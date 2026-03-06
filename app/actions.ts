"use server";

import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const GUEST_DAILY_LIMIT = 1;
const USER_DAILY_LIMIT = 2;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "luvsoul@kakao.com";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MIN_COPY_LENGTH = {
    danggeun: 240,
    joonggonara: 300,
    bungae: 220,
} as const;

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
function normalizeGeneratedCopy(raw: any): GeneratedCopy | null {
    if (!raw || typeof raw !== "object") return null;

    if (
        typeof raw.danggeun !== "string" ||
        typeof raw.joonggonara !== "string" ||
        typeof raw.bungae !== "string"
    ) {
        return null;
    }

    return {
        danggeun: raw.danggeun.trim(),
        joonggonara: raw.joonggonara.trim(),
        bungae: raw.bungae.trim(),
        seo_tags: normalizeSeoTags(raw.seo_tags),
    };
}

function isLowQualityCopy(copy: GeneratedCopy): boolean {
    return (
        copy.danggeun.length < MIN_COPY_LENGTH.danggeun ||
        copy.joonggonara.length < MIN_COPY_LENGTH.joonggonara ||
        copy.bungae.length < MIN_COPY_LENGTH.bungae ||
        copy.seo_tags.length < 5
    );
}

function enforceMinLength(text: string, minLength: number): string {
    const filler = "\n\n작성 내용은 입력해주신 정보만 바탕으로 정리했으며, 확인되지 않은 정보는 임의로 추가하지 않았습니다. 궁금한 점은 메시지로 문의해 주세요.";
    let next = text.trim();

    while (next.length < minLength) {
        next += filler;
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
}): GeneratedCopy {
    const item = params.itemName.trim();
    const details = params.itemDetails.trim();

    const danggeunBase = [
        `${item} 판매합니다.`,
        ``,
        `${details}`,
        ``,
        `입력해주신 내용을 기준으로 핵심 정보를 읽기 쉽게 정리했습니다. 과장 없이 실제 입력 정보 중심으로 안내드리며, 구매 시기/보증/환불 같은 확인되지 않은 내용은 임의로 추가하지 않았습니다. 관심 있으시면 편하게 문의 주세요.`,
    ].join("\n");

    const joonggonaraBase = [
        `[상품명] ${item}`,
        `[입력된 특징] ${details}`,
        `[거래 안내] 입력해주신 내용 기준으로 거래 가능합니다.`,
        `[추가 안내] 본 문구는 제공된 정보만 바탕으로 작성되었으며, 확인되지 않은 세부 정보(보증/환불/구매시기 등)는 포함하지 않았습니다.`,
        `문의 주시면 입력된 정보 범위에서 상세히 안내드리겠습니다.`,
    ].join("\n");

    const bungaeBase = [
        `${item} 판매합니다.`,
        `${details}`,
        `핵심만 빠르게 확인하실 수 있도록 정리했습니다. 제공된 정보 범위를 넘는 내용은 넣지 않았고, 확인되지 않은 조건은 별도로 안내드리지 않습니다.`,
        `관심 있으시면 메시지 주세요.`,
    ].join("\n\n");

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

    let userEmail = session?.user?.email || null;

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
}, userEmail: string | null): Promise<{ success: boolean; data?: any; text?: string }> {
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

Length constraints (minimum):
- danggeun: at least ${MIN_COPY_LENGTH.danggeun} Korean characters
- joonggonara: at least ${MIN_COPY_LENGTH.joonggonara} Korean characters
- bungae: at least ${MIN_COPY_LENGTH.bungae} Korean characters

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
${imageUrl ? "- image is attached: you may describe visible condition/appearance only if clearly inferable from the image." : ""}

${personaPrompt}

For "seo_tags":
- Return 5 to 8 tags as plain strings.
- No duplicates.
- Keep tags specific and relevant to the item.
`;

    const messagesContent: any[] = [{ type: "text", text: prompt }];

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
        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== "string") {
            console.error("OpenAI API invalid payload:", data);
            return { success: false, text: "[DEBUG] Invalid AI payload" };
        }

        let jsonContent: any;
        try {
            jsonContent = JSON.parse(content);
        } catch (parseError) {
            console.error("OpenAI JSON parse error:", parseError, content);
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

        if (isLowQualityCopy(finalCopy)) {
            finalCopy = buildFactSafeFallbackCopy({
                itemName,
                itemDetails,
                draft: finalCopy,
            });
        }

        return { success: true, data: finalCopy };
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return { success: false, text: `[DEBUG] ?덉쇅 ?ㅻ쪟 諛쒖깮` };
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
- seo_tags count: 5 to 8

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
        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== "string") {
            return null;
        }

        const parsed = JSON.parse(content);
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


