"use server";

import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const GUEST_DAILY_LIMIT = 1;
const USER_DAILY_LIMIT = 2;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "luvsoul@kakao.com";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MIN_COPY_LENGTH = {
    danggeun: 360,
    joonggonara: 420,
    bungae: 320,
} as const;
const MIN_CONTENT_BLOCKS = 3; // 기존보다 문단 2개 추가
const TEMPLATE_MARKER_REGEX = /\[(?:사진 관찰|추가 안내|문의 안내|입력된 특징|거래 안내|상품명)\]/;
const META_COPY_REGEX =
    /입력해주신 내용|읽기 쉽게 정리|안내드립니다|핵심 정보를|제공된 정보|상세히 정리|문의 주시면 입력된 정보 범위|본 문구는|기준으로 정리했습니다/;
const VISUAL_CUE_REGEX = /사진|이미지|보이는|확인되는|외관|라벨|색상|포장|박스|구성품|스크래치|기스|찍힘|오염|패키지/;
const IMAGE_ANALYSIS_FAILURE_REGEX = /확인(?:되는)? 정보가 없|판단이 어렵|식별이 어렵|명확하지 않|알 수 없|불분명|사진이 흐릿|분석 실패/;
const EMPTY_IMAGE_RESPONSE_REGEX = /^["']?\s*(?:없음|없습니다|none|null)?\s*["']?$/i;

export type GenerateResult = {
    success: boolean;
    data?: {
        danggeun: string;
        joonggonara: string;
        bungae: string;
        seo_tags: string[];
    };
    text?: string; // ?먮윭 硫붿떆吏???泥??띿뒪?몄슜
    remainingCount?: number;
    limit?: number;
    isLimitReached?: boolean;
    isCreditUsed?: boolean;
    currentCredits?: number;
};

type GeneratedCopy = {
    danggeun: string;
    joonggonara: string;
    bungae: string;
    seo_tags: string[];
};

type ModelContentPart =
    | string
    | {
        text?: unknown;
    };

type OpenAITextPart = {
    type: "text";
    text: string;
};

type OpenAIImagePart = {
    type: "image_url";
    image_url: {
        url: string;
    };
};

function normalizeSeoTags(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];

    const deduped = new Set<string>();
    for (const tag of raw) {
        const normalized = String(tag ?? "").trim().replace(/^#+/, "");
        if (!normalized) continue;
        if (normalized.length > 30) continue;
        deduped.add(normalized);
        if (deduped.size >= 8) break;
    }

    return Array.from(deduped);
}
function normalizeGeneratedCopy(raw: unknown): GeneratedCopy | null {
    if (!raw || typeof raw !== "object") return null;

    const candidate = raw as Record<string, unknown>;

    if (
        typeof candidate.danggeun !== "string" ||
        typeof candidate.joonggonara !== "string" ||
        typeof candidate.bungae !== "string"
    ) {
        return null;
    }

    return {
        danggeun: candidate.danggeun.trim(),
        joonggonara: candidate.joonggonara.trim(),
        bungae: candidate.bungae.trim(),
        seo_tags: normalizeSeoTags(candidate.seo_tags),
    };
}

function extractTextFromModelContent(content: unknown): string {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";

    return (content as ModelContentPart[])
        .map((part) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object" && "text" in part) {
                const text = (part as { text?: unknown }).text;
                return typeof text === "string" ? text : "";
            }
            return "";
        })
        .join("\n")
        .trim();
}

function extractJsonPayload(raw: string): unknown | null {
    const normalized = raw.trim().replace(/^\uFEFF/, "");
    if (!normalized) return null;

    const tryParse = (value: string) => {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    };

    const direct = tryParse(normalized);
    if (direct) return direct;

    const fenced = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
    if (fenced) {
        const fencedParsed = tryParse(fenced);
        if (fencedParsed) return fencedParsed;
    }

    const firstBrace = normalized.indexOf("{");
    const lastBrace = normalized.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const objectSlice = normalized.slice(firstBrace, lastBrace + 1);
        const slicedParsed = tryParse(objectSlice);
        if (slicedParsed) return slicedParsed;
    }

    return null;
}

function getContentBlocks(text: string): string[] {
    return text
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean);
}

function containsTemplatedCopy(text: string): boolean {
    return TEMPLATE_MARKER_REGEX.test(text) || META_COPY_REGEX.test(text);
}

function normalizeImageObservationText(text: string): string {
    const normalized = text.trim().replace(/\s+/g, " ");
    if (!normalized || EMPTY_IMAGE_RESPONSE_REGEX.test(normalized) || IMAGE_ANALYSIS_FAILURE_REGEX.test(normalized)) {
        return "";
    }

    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/^[-*•\d.)\s]+/, ""))
        .map((line) => line.replace(/\s+/g, " "))
        .filter(Boolean);

    const compact = lines
        .slice(0, 4)
        .map((line) => (/[\.\!\?]$/.test(line) ? line : `${line}.`))
        .join(" ")
        .trim();

    if (compact) return compact;

    return "";
}

function buildImageObservationParagraph(observation: string): string {
    const normalized = normalizeImageObservationText(observation);
    if (!normalized) return "";
    if (/^(사진|이미지)/.test(normalized)) return normalized;

    return `사진으로 보면 ${normalized}`;
}

function hasVisualCue(text: string): boolean {
    return VISUAL_CUE_REGEX.test(text);
}

function hasVisualCuesInAllCopies(copy: GeneratedCopy): boolean {
    return hasVisualCue(copy.danggeun) && hasVisualCue(copy.joonggonara) && hasVisualCue(copy.bungae);
}

function insertParagraphBeforeLast(text: string, paragraph: string): string {
    const blocks = getContentBlocks(text);
    if (!paragraph.trim()) return text.trim();
    if (blocks.length === 0) return paragraph.trim();

    const insertIndex = blocks.length >= 2 ? blocks.length - 1 : blocks.length;
    blocks.splice(insertIndex, 0, paragraph.trim());
    return blocks.join("\n\n").trim();
}

function appendImageObservationParagraph(text: string, minLength: number, observation: string): string {
    const paragraph = buildImageObservationParagraph(observation);
    if (!paragraph || hasVisualCue(text)) {
        return enforceMinLength(text, minLength);
    }

    return enforceMinLength(insertParagraphBeforeLast(text, paragraph), minLength);
}

function injectImageObservationParagraphs(copy: GeneratedCopy, observation: string): GeneratedCopy {
    return {
        danggeun: appendImageObservationParagraph(copy.danggeun, MIN_COPY_LENGTH.danggeun, observation),
        joonggonara: appendImageObservationParagraph(copy.joonggonara, MIN_COPY_LENGTH.joonggonara, observation),
        bungae: appendImageObservationParagraph(copy.bungae, MIN_COPY_LENGTH.bungae, observation),
        seo_tags: copy.seo_tags,
    };
}

function isLowQualityCopy(copy: GeneratedCopy): boolean {
    const blockCount = (text: string) => getContentBlocks(text).length;
    const hasTemplatedSections =
        containsTemplatedCopy(copy.danggeun) ||
        containsTemplatedCopy(copy.joonggonara) ||
        containsTemplatedCopy(copy.bungae);

    return (
        copy.danggeun.length < MIN_COPY_LENGTH.danggeun ||
        copy.joonggonara.length < MIN_COPY_LENGTH.joonggonara ||
        copy.bungae.length < MIN_COPY_LENGTH.bungae ||
        blockCount(copy.danggeun) < MIN_CONTENT_BLOCKS ||
        blockCount(copy.joonggonara) < MIN_CONTENT_BLOCKS ||
        blockCount(copy.bungae) < MIN_CONTENT_BLOCKS ||
        copy.seo_tags.length < 5 ||
        hasTemplatedSections
    );
}

function enforceMinLength(text: string, minLength: number): string {
    let next = text.trim();
    const fillerParagraphs = [
        "중고 거래 특성상 확인하고 싶은 포인트가 다를 수 있어 궁금한 부분은 메시지로 편하게 남겨 주세요.",
        "보이는 상태와 적어둔 내용을 참고해 보시면 판단하시기 좋고, 필요한 내용은 확인 가능한 범위에서 답변드리겠습니다.",
        "실제로 보고 궁금해질 만한 부분은 미리 물어보셔도 괜찮고, 과장 없이 전달된 내용 중심으로만 정리했습니다.",
    ];
    let fillerIndex = 0;

    while (next.length < minLength) {
        next += `\n\n${fillerParagraphs[fillerIndex % fillerParagraphs.length]}`;
        fillerIndex += 1;
    }

    return next;
}

function buildFallbackTags(itemName: string, itemDetails: string, current: string[]): string[] {
    const seeds = `${itemName} ${itemDetails}`
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2);

    const deduped = new Set<string>(current.map((tag) => tag.replace(/^#+/, "").trim()).filter(Boolean));

    for (const token of seeds) {
        if (deduped.size >= 8) break;
        deduped.add(token);
    }

    const tags = Array.from(deduped);
    if (tags.length >= 5) return tags.slice(0, 8);

    const extras = ["중고거래", "직거래", "상세문의", "판매글", "중고장터"];
    for (const extra of extras) {
        if (tags.length >= 8) break;
        if (!tags.includes(extra)) tags.push(extra);
    }

    return tags.slice(0, 8);
}

function buildFactSafeFallbackCopy(params: {
    itemName: string;
    itemDetails: string;
    draft: GeneratedCopy;
    imageAttached: boolean;
    imageObservation?: string;
}): GeneratedCopy {
    const item = params.itemName.trim();
    const details = params.itemDetails.trim();
    const imageParagraph = params.imageAttached ? buildImageObservationParagraph(params.imageObservation ?? "") : "";

    const danggeunBase = [
        `${item} 판매합니다.`,
        ``,
        `${details} 찾으시는 분이 상태를 바로 파악하실 수 있도록 전달해주신 내용 중심으로 자연스럽게 풀어 적었습니다.`,
        ...(imageParagraph ? ["", `${imageParagraph} 사진에서 바로 확인되는 부분만 본문에 녹였습니다.`] : []),
        ``,
        `과하게 포장하지 않고 실제로 전달된 내용 위주로 적어두었으니, 관심 있으시면 궁금한 부분 편하게 메시지 주세요.`,
    ].join("\n");

    const joonggonaraBase = [
        `${item} 판매합니다.`,
        ``,
        `${details} 제품을 비교해서 보시는 분들이 헷갈리지 않도록 현재 확인되는 정보 위주로 조금 더 자세히 적었습니다.`,
        ...(imageParagraph ? ["", `${imageParagraph} 보이지 않는 부분은 임의로 덧붙이지 않았습니다.`] : []),
        ``,
        `중고 거래에서 중요하게 보시는 포인트가 다를 수 있는 만큼, 필요하신 부분은 문의 주시면 확인 가능한 범위에서 자세히 답변드리겠습니다.`,
    ].join("\n");

    const bungaeBase = [
        `${item} 판매합니다.`,
        ``,
        `${details} 핵심만 짧게 보기보다 실제 상태가 잘 전달되도록 필요한 내용은 빠지지 않게 정리했습니다.`,
        ...(imageParagraph ? ["", `${imageParagraph}`] : []),
        ``,
        `관심 있으시면 메시지 주세요. 거래 전에 확인하고 싶은 부분은 편하게 물어보시면 답변드리겠습니다.`,
    ].join("\n");

    return {
        danggeun: enforceMinLength(danggeunBase, MIN_COPY_LENGTH.danggeun),
        joonggonara: enforceMinLength(joonggonaraBase, MIN_COPY_LENGTH.joonggonara),
        bungae: enforceMinLength(bungaeBase, MIN_COPY_LENGTH.bungae),
        seo_tags: buildFallbackTags(item, details, params.draft.seo_tags),
    };
}

async function getSafeSession() {
    try {
        return await auth();
    } catch (error) {
        // Auth failure should not block guest generation flow.
        console.error("Auth session read failed:", error);
        return null;
    }
}

// 濡쒓렇???좎????ㅻ뒛 ?좎쭨 湲곗? ?ъ슜 移댁슫??泥댄겕 諛?利앷? (?щ젅???곗꽑 ?뺤씤)
async function checkAndIncrementUserCount(email: string): Promise<{
    allowed: boolean;
    remaining: number;
    credits: number;
    usedCredit: boolean;
}> {
    // 愿由ъ옄 怨꾩젙? 臾댁젣???덉슜
    if (email === ADMIN_EMAIL) {
        return { allowed: true, remaining: 9999, credits: 9999, usedCredit: false };
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return { allowed: true, remaining: USER_DAILY_LIMIT, credits: 0, usedCredit: false };
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: user } = await supabase
        .from("users")
        .select("daily_count, last_used_date, credits")
        .eq("email", email)
        .single();

    if (!user) {
        return { allowed: true, remaining: USER_DAILY_LIMIT, credits: 0, usedCredit: false };
    }

    const currentCredits = user.credits || 0;
    const isToday = user.last_used_date === today;
    const currentCount = isToday ? user.daily_count : 0;

    if (currentCount >= USER_DAILY_LIMIT) {
        if (currentCredits > 0) {
            await supabase.from("users").update({ credits: currentCredits - 1 }).eq("email", email);
            return { allowed: true, remaining: 0, credits: currentCredits - 1, usedCredit: true };
        } else {
            return { allowed: false, remaining: 0, credits: 0, usedCredit: false };
        }
    }

    await supabase
        .from("users")
        .update({ daily_count: currentCount + 1, last_used_date: today })
        .eq("email", email);

    return { allowed: true, remaining: USER_DAILY_LIMIT - (currentCount + 1), credits: currentCredits, usedCredit: false };
}

export async function generateSellerCopy(
    formData: {
        birthYear: number;
        gender: string;
        itemName: string;
        itemDetails: string;
        imageUrl?: string; // ?대?吏 遺꾩꽍??URL (Vision AI)
    },
    guestCount?: number
): Promise<GenerateResult> {
    const session = await getSafeSession();
    const supabase = getSupabaseAdmin();

    const userEmail = session?.user?.email || null;

    if (userEmail) {
        const { allowed, remaining, credits, usedCredit } = await checkAndIncrementUserCount(userEmail);
        if (!allowed) {
            return {
                success: false,
                text: `?ㅻ뒛??臾대즺 ?앹꽦 ?잛닔(${USER_DAILY_LIMIT}??瑜?紐⑤몢 ?ъ슜?덉뒿?덈떎. 異⑹쟾???щ젅?㏃씠 ?놁뒿?덈떎. ?뭿?щ젅?㏃쓣 異⑹쟾?섏떆嫄곕굹 ?댁씪 ?ㅼ떆 ?댁슜?댁＜?몄슂! ?삟`,
                remainingCount: 0,
                limit: USER_DAILY_LIMIT,
                isLimitReached: true,
            };
        }

        const result = await callOpenAI(formData, userEmail);

        if (result.success && result.data && supabase) {
            await supabase.from("histories").insert({
                user_email: userEmail,
                item_name: formData.itemName,
                item_details: formData.itemDetails,
                generated_text: result.data.danggeun, // 援щ쾭???명솚?깆쓣 ?꾪빐 ?밴렐留덉폆 踰꾩쟾 湲곕낯 ???
                platform_versions: result.data, // ?꾩껜 JSON ???
                seo_tags: result.data.seo_tags
            });
        }

        return { ...result, remainingCount: remaining, limit: USER_DAILY_LIMIT, isCreditUsed: usedCredit, currentCredits: credits };
    } else {
        const count = guestCount ?? 0;
        if (count >= GUEST_DAILY_LIMIT) {
            return {
                success: false,
                text: `Guest limit reached: ${GUEST_DAILY_LIMIT}/day. Sign in with Google for ${USER_DAILY_LIMIT}/day free usage.`,
                remainingCount: 0,
                limit: GUEST_DAILY_LIMIT,
                isLimitReached: true,
            };
        }

        const result = await callOpenAI(formData, null);
        return { ...result, remainingCount: GUEST_DAILY_LIMIT - (count + 1), limit: GUEST_DAILY_LIMIT };
    }
}

async function callOpenAI(formData: {
    birthYear: number;
    gender: string;
    itemName: string;
    itemDetails: string;
    imageUrl?: string;
}, userEmail: string | null): Promise<{ success: boolean; data?: GeneratedCopy; text?: string }> {
    const { birthYear, gender, itemName, itemDetails, imageUrl } = formData;
    const currentYear = new Date().getFullYear();
    const ageGroup = `${Math.floor((currentYear - birthYear) / 10) * 10}s`;
    const genderStr = gender === "female" ? "female" : "male";

    const supabase = getSupabaseAdmin();
    let personaPrompt = "";

    // ?대찓?쇱씠 ?덉쑝硫?而ㅼ뒪? ?섎Ⅴ?뚮굹 議고쉶
    if (userEmail && supabase) {
        const { data: persona } = await supabase.from("user_personas").select("analyzed_tone").eq("user_email", userEmail).single();
        if (persona?.analyzed_tone) {
            personaPrompt = `
[?밸퀎 吏?쒖궗?? ?먮ℓ?먯쓽 怨좎쑀 留먰닾 ?섎Ⅴ?뚮굹 ?곸슜]
?ㅼ쓬? ?ъ슜?먯쓽 ?몄뒪?洹몃옩/寃뚯떆湲 ?깆뿉??異붿텧??怨좎쑀??留먰닾 ?뱀쭠?낅땲?? ???뱀쭠??1?쒖쐞濡?諛섏쁺?섏뿬 ?묒꽦?댁＜?몄슂!
--- ?섎Ⅴ?뚮굹 遺꾩꽍 寃곌낵 ---
${persona.analyzed_tone}
--------------------------
`;
        }
    }

    const prompt = `
You are a Korean marketplace copywriter for second-hand listings.
Return ONLY a JSON object with keys:
"danggeun", "joonggonara", "bungae", "seo_tags".

Write in natural Korean. Tone must be warm, trustworthy, and detailed.
Each listing should feel like a real seller wrote it and can paste it directly into the marketplace.
All listing text fields must be written in Korean.

Hard constraints:
1) Use ONLY facts from the input. Do not invent any new facts.
2) Never add unverifiable claims such as:
   - warranty/refund period
   - authenticity/certification
   - purchase date or usage period (unless explicitly given)
   - reason for sale
   - shipping option (unless explicitly given)
   - hidden defects or accessories not mentioned
3) Keep important details from the user input. Do not over-compress.
4) Do not use exaggerated hype language or spammy phrases.

Writing rules:
- Blend the user's original wording and facts into a cohesive listing.
- Do not turn the result into a guide, notice, or explanation about how the text was written.
- Never output bracketed headers or template labels such as [사진 관찰], [추가 안내], [문의 안내], [상품명], [거래 안내].
- Never write meta phrases such as "입력해주신 내용을 기준으로 정리했습니다", "읽기 쉽게 정리했습니다", "안내드립니다".
- Use normal paragraphs, not checklist-style labels.

Length constraints (minimum):
- danggeun: at least ${MIN_COPY_LENGTH.danggeun} Korean characters
- joonggonara: at least ${MIN_COPY_LENGTH.joonggonara} Korean characters
- bungae: at least ${MIN_COPY_LENGTH.bungae} Korean characters

Structure constraints:
- Each platform copy must have at least ${MIN_CONTENT_BLOCKS} content blocks separated by blank lines.
- Expand by adding at least 2 extra detail blocks compared to a short one-paragraph listing.
- Recommended block order: 1) item summary 2) condition/detail explanation 3) transaction/contact guidance.
${imageUrl
            ? `- An image is attached. Reflect only clearly visible facts from the image inside normal body paragraphs.
- Mention at least 2 concrete visual facts when they are clearly visible.
- If clear image-based details are not available, simply leave image-based wording out.`
            : `- No image is attached. Do not mention photos or image analysis.`}

Platform style:
- danggeun: friendly local-trade vibe, clear condition description, easy-to-read structure.
- joonggonara: more structured and informative, include condition/details in organized form.
- bungae: concise but still detailed, mobile-friendly flow, clear call-to-action.

Input profile:
- seller age group: ${ageGroup}
- seller gender: ${genderStr}

Item facts:
- item name: ${itemName}
- item details: ${itemDetails}
${imageUrl ? "- image is attached and must be analyzed for visible facts only." : ""}

${personaPrompt}

For "seo_tags":
- Return 5 to 8 tags as plain strings.
- No duplicates.
- Keep tags specific and relevant to the item.
`;

    const messagesContent: Array<OpenAITextPart | OpenAIImagePart> = [{ type: "text", text: prompt }];

    // ?대?吏媛 ?덉쑝硫?Vision AI瑜??꾪븳 媛앹껜 異붽?
    if (imageUrl) {
        messagesContent.push({
            type: "image_url",
            image_url: { url: imageUrl }
        });
    }

    if (!OPENAI_API_KEY) {
        return { success: false, text: "[DEBUG] OPENAI_API_KEY is missing" };
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o", // Vision + JSON Output 吏?먰븯??紐⑤뜽
                messages: [{ role: "user", content: messagesContent }],
                response_format: { type: "json_object" },
                temperature: 0.4,
                max_tokens: 1800,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error:", response.status, errorText);
            return { success: false, text: `[DEBUG] HTTP ${response.status} ?ㅻ쪟` };
        }

        const data = await response.json();
        const content = extractTextFromModelContent(data?.choices?.[0]?.message?.content);
        if (!content) {
            console.error("OpenAI API invalid payload:", data);
            return { success: false, text: "[DEBUG] Invalid AI payload" };
        }

        const jsonContent = extractJsonPayload(content);
        if (!jsonContent) {
            console.error("OpenAI JSON parse error. Raw content:", content);
            return { success: false, text: "[DEBUG] AI JSON parse failed" };
        }

        const normalized = normalizeGeneratedCopy(jsonContent);
        if (!normalized) {
            console.error("OpenAI JSON schema mismatch:", jsonContent);
            return { success: false, text: "[DEBUG] AI JSON schema mismatch" };
        }

        let finalCopy = normalized;

        if (isLowQualityCopy(finalCopy)) {
            const expanded = await expandCopyToMeetQuality({
                draft: finalCopy,
                ageGroup,
                genderStr,
                itemName,
                itemDetails,
                imageAttached: Boolean(imageUrl),
            });

            if (expanded) {
                finalCopy = expanded;
            }
        }

        let imageObservation: string | undefined;
        if (imageUrl && !hasVisualCuesInAllCopies(finalCopy)) {
            imageObservation = await describeImageObservation({
                imageUrl,
                itemName,
                itemDetails,
            });
            if (imageObservation) {
                finalCopy = injectImageObservationParagraphs(finalCopy, imageObservation);
            }
        }

        if (isLowQualityCopy(finalCopy)) {
            finalCopy = buildFactSafeFallbackCopy({
                itemName,
                itemDetails,
                draft: finalCopy,
                imageAttached: Boolean(imageUrl),
                imageObservation,
            });
        }

        return { success: true, data: finalCopy };
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return { success: false, text: `[DEBUG] ?덉쇅 ?ㅻ쪟 諛쒖깮` };
    }
}

async function describeImageObservation(params: {
    imageUrl: string;
    itemName: string;
    itemDetails: string;
}): Promise<string> {
    if (!OPENAI_API_KEY) {
        return "";
    }

    const prompt = `
You analyze one marketplace image and write only clearly visible facts in Korean.
Do not invent hidden details.
Return 1 or 2 natural Korean sentences that can be inserted directly into a seller listing.
Include at least 2 concrete visual observations when they are clearly visible.
If there are not at least 2 clear visible facts, return an empty string.

Item name: ${params.itemName}
Item details from seller: ${params.itemDetails}
`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: params.imageUrl } },
                        ],
                    },
                ],
                temperature: 0.1,
                max_tokens: 220,
            }),
        });

        if (!response.ok) return "";

        const data = await response.json();
        const text = extractTextFromModelContent(data?.choices?.[0]?.message?.content);
        if (!text) return "";

        return normalizeImageObservationText(text);
    } catch {
        return "";
    }
}

async function expandCopyToMeetQuality(params: {
    draft: GeneratedCopy;
    ageGroup: string;
    genderStr: string;
    itemName: string;
    itemDetails: string;
    imageAttached: boolean;
}): Promise<GeneratedCopy | null> {
    if (!OPENAI_API_KEY) return null;

    const prompt = `
You are improving Korean second-hand listing copy quality.
Rewrite the draft to satisfy quality constraints while preserving facts.
Return ONLY JSON with keys "danggeun", "joonggonara", "bungae", "seo_tags".
All listing text fields must be written in Korean.

Quality constraints:
- danggeun length >= ${MIN_COPY_LENGTH.danggeun}
- joonggonara length >= ${MIN_COPY_LENGTH.joonggonara}
- bungae length >= ${MIN_COPY_LENGTH.bungae}
- each copy must include at least ${MIN_CONTENT_BLOCKS} content blocks separated by blank lines
- seo_tags count: 5 to 8
- write cohesive seller-facing paragraphs, not guide text or notices
- do not use bracketed labels such as [사진 관찰], [추가 안내], [문의 안내], [상품명], [거래 안내]
- do not use meta phrases about how the text was organized or based on the input
${params.imageAttached
            ? `- when clearly visible facts from the image are available, weave them naturally into normal body paragraphs
- if clear image-based details are not available, simply leave them out`
            : `- do not mention photos or image analysis when no image is attached`}

Fact safety:
- Do not invent warranty/refund/receipt/certification/purchase date/shipping/reason-for-sale details.
- Use only facts below and draft wording.

Facts:
- seller age group: ${params.ageGroup}
- seller gender: ${params.genderStr}
- item name: ${params.itemName}
- item details: ${params.itemDetails}
- image attached: ${params.imageAttached ? "yes" : "no"}

Current draft JSON:
${JSON.stringify(params.draft)}
`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3,
                max_tokens: 1800,
            }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const content = extractTextFromModelContent(data?.choices?.[0]?.message?.content);
        if (!content) {
            return null;
        }

        const parsed = extractJsonPayload(content);
        if (!parsed) return null;

        const normalized = normalizeGeneratedCopy(parsed);
        if (!normalized) return null;

        if (isLowQualityCopy(normalized)) return null;

        return normalized;
    } catch {
        return null;
    }
}

// ?덉뒪?좊━ 紐⑸줉 議고쉶
export async function getUserHistories() {
    const session = await getSafeSession();
    if (!session?.user?.email) return { success: false, data: [] };

    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, data: [] };

    const { data, error } = await supabase
        .from("histories")
        .select("*")
        .eq("user_email", session.user.email)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fetch histories error:", error);
        return { success: false, data: [] };
    }

    return { success: true, data };
}

// 利먭꺼李얘린 ?곹깭 ?좉?
export async function toggleFavoriteHistory(id: string, is_favorite: boolean) {
    const session = await getSafeSession();
    if (!session?.user?.email) return { success: false };

    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false };

    const { error } = await supabase
        .from("histories")
        .update({ is_favorite })
        .eq("id", id)
        .eq("user_email", session.user.email);

    if (error) {
        console.error("Update favorite error:", error);
        return { success: false };
    }

    return { success: true };
}

// ?몄뒪?洹몃옩 留먰닾 遺꾩꽍 諛?????≪뀡
export async function analyzeAndSavePersona(sampleTexts: string[]) {
    const session = await getSafeSession();
    if (!session?.user?.email) return { success: false, error: "濡쒓렇?몄씠 ?꾩슂?⑸땲??" };

    const prompt = `
?뱀떊? 理쒓퀬??NLP ?곗씠??遺꾩꽍媛?댁옄 移댄뵾?쇱씠?곗엯?덈떎.
?꾨옒 ?ъ슜?먭? 吏곸젒 ?묒꽦???щ윭 媛쒖쓽 寃뚯떆湲/臾몄옣?ㅼ쓣 遺꾩꽍?섏뿬, ???щ엺??怨좎쑀??"留먰닾, 遺꾩쐞湲? 二쇰줈 ?곕뒗 ?대え吏 ?⑦꽩, 臾몄옣 醫낃껐 ?대?(?뚯뒾泥? 議대뙎留???, 媛먯꽦" ?깆쓣 ?뚯븙?섏꽭??
寃곌낵???섎Ⅴ?뚮굹 ?꾨＼?꾪듃??吏곸젒 二쇱엯?????덈룄濡?3~4臾몄옣?쇰줈 紐낇솗?섍퀬 援ъ껜?곸쑝濡??붿빟?댁＜?몄슂.

[?ъ슜???묒꽦 湲 ?섑뵆]
${sampleTexts.join("\n\n---\n\n")}
`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }]
            }),
        });

        const data = await response.json();
        const analyzedTone = data.choices[0].message.content;

        const supabase = getSupabaseAdmin();
        if (supabase) {
            // Upsert 諛⑹떇?쇰줈 ???
            const { error } = await supabase
                .from("user_personas")
                .upsert({ user_email: session.user.email, analyzed_tone: analyzedTone }, { onConflict: "user_email" });

            if (error) console.error("Persona upsert error:", error);
        }

        return { success: true, analyzedTone };
    } catch (err) {
        console.error(err);
        return { success: false, error: "遺꾩꽍 以??먮윭媛 諛쒖깮?덉뒿?덈떎." };
    }
}


