"use server";

import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const GUEST_DAILY_LIMIT = 1;
const USER_DAILY_LIMIT = 2;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "luvsoul@kakao.com";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
    const ageGroup = Math.floor((currentYear - birthYear) / 10) * 10 + "?";
    const genderStr = gender === "female" ? "?ъ꽦" : "?⑥꽦";

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
?뱀떊? 以묎퀬臾쇳뭹 嫄곕옒?먯꽌 ?대┃瑜좉낵 ?좊ː?꾨? 洹밸??뷀븯??留ㅻ젰?곸씤 ?먮ℓ湲 ?묒꽦???뺣뒗 '留덉???移댄뵾?쇱씠???낅땲??
?ㅼ쓬 ?뺣낫瑜?諛뷀깢?쇰줈 援щℓ?먯쓽 留덉쓬???щ줈?〓뒗 ?먮ℓ湲???묒꽦?댁＜?몄슂.
諛섎뱶??JSON ?뺥깭濡??묐떟?댁빞 ?⑸땲?? ?묐떟 ?ㅻ뒗 "danggeun", "joonggonara", "bungae", "seo_tags" (臾몄옄??諛곗뿴) 濡??댁＜?몄슂.

[?먮ℓ???꾨줈?? 
?섏씠 諛??깅퀎: ${ageGroup} ${genderStr} 

[臾쇳뭹 ?뺣낫]
- ?곹뭹紐? ${itemName}
- ?곹뭹 ?뱀씠?ы빆: ${itemDetails}

${imageUrl ? `(?대?吏媛 泥⑤??섏뿀?듬땲?? ?대?吏 ?댁쓽 釉뚮옖?? 紐⑤뜽紐? ?됱긽, ?ㅽ겕?섏튂 ???곹깭瑜?遺꾩꽍?섏뿬 湲???먯뿰?ㅻ읇寃??ы븿?쒖폒 二쇱꽭??)` : ""}

${personaPrompt}

[?뚮옯?쇰퀎 ?ㅼ븻留ㅻ꼫 ?붽뎄?ы빆]
1. "danggeun" (?밴렐留덉폆??: 移쒕??섍퀬 ?댁썐媛숈? ?먮굦, 吏곴굅???꾩＜, 荑④굅??議곌굔 媛뺤“, ?대え吏 ?띾??섍쾶.
2. "joonggonara" (以묎퀬?섎씪??: ?좊ː媛? 紐낇솗???ㅽ럺怨??곹깭 ?ㅻ챸 ?곗꽑, 留ㅻ꼫?덇퀬 ?꾨Ц?곸씤 ?먮굦, ?앸같 ?좏샇 ?щ㎎.
3. "bungae" (踰덇컻?ν꽣??: ?몃젋?뷀븿, ?숉븳 留먰닾, 紐낇솗???λ떒???쇰뱶諛? ?앸같嫄곕옒 ?섏쁺 臾멸뎄.

[怨듯넻 ?붽뎄?ы빆]
1. ?낅젰/遺꾩꽍???녿뒗 ?뺤씤?섏? ?딆? ?뺣낫(?먭?, 援щℓ????瑜?吏?대궡吏 留?寃?
2. ?⑥젏? ?붿쭅???몄젙?섎릺 湲띿젙?곸씤 媛移섎줈 ?ъ옣??寃?(Sweet Sales Pitch).
3. "seo_tags" 諛곗뿴?먮뒗 ?곸쐞 ?몄텧???꾪븳 5~8媛쒖쓽 異붿쿇 ?ㅼ썙?쒕? ?댁쓣 寃?
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
                temperature: 0.7
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

        const hasRequiredFields =
            typeof jsonContent?.danggeun === "string" &&
            typeof jsonContent?.joonggonara === "string" &&
            typeof jsonContent?.bungae === "string" &&
            Array.isArray(jsonContent?.seo_tags);

        if (!hasRequiredFields) {
            console.error("OpenAI JSON schema mismatch:", jsonContent);
            return { success: false, text: "[DEBUG] AI JSON schema mismatch" };
        }

        return { success: true, data: jsonContent };
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return { success: false, text: `[DEBUG] ?덉쇅 ?ㅻ쪟 諛쒖깮` };
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

