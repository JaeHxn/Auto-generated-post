"use server";

import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const GUEST_DAILY_LIMIT = 1;
const USER_DAILY_LIMIT = 2;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@magicseller.local";

export type GenerateResult = {
    success: boolean;
    data?: {
        danggeun: string;
        joonggonara: string;
        bungae: string;
        seo_tags: string[];
    };
    text?: string; // 에러 메시지나 대체 텍스트용
    remainingCount?: number;
    limit?: number;
    isLimitReached?: boolean;
    isCreditUsed?: boolean;
    currentCredits?: number;
};

// 로그인 유저의 오늘 날짜 기준 사용 카운트 체크 및 증가 (크레딧 우선 확인)
async function checkAndIncrementUserCount(email: string): Promise<{
    allowed: boolean;
    remaining: number;
    credits: number;
    usedCredit: boolean;
}> {
    // 관리자 계정은 무제한 허용
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
        imageUrl?: string; // 이미지 분석용 URL (Vision AI)
    },
    guestCount?: number
): Promise<GenerateResult> {
    const session = await auth();
    const supabase = getSupabaseAdmin();

    let userEmail = session?.user?.email || null;

    if (userEmail) {
        const { allowed, remaining, credits, usedCredit } = await checkAndIncrementUserCount(userEmail);
        if (!allowed) {
            return {
                success: false,
                text: `오늘의 무료 생성 횟수(${USER_DAILY_LIMIT}회)를 모두 사용했습니다. 충전된 크레딧이 없습니다. 💎크레딧을 충전하시거나 내일 다시 이용해주세요! 😢`,
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
                generated_text: result.data.danggeun, // 구버전 호환성을 위해 당근마켓 버전 기본 저장
                platform_versions: result.data, // 전체 JSON 저장
                seo_tags: result.data.seo_tags
            });
        }

        return { ...result, remainingCount: remaining, limit: USER_DAILY_LIMIT, isCreditUsed: usedCredit, currentCredits: credits };
    } else {
        const count = guestCount ?? 0;
        if (count >= GUEST_DAILY_LIMIT) {
            return {
                success: false,
                text: "비로그인 사용자는 하루 2회까지 무료입니다. 구글 계정으로 로그인하면 하루 5회로 늘어납니다! 🎁",
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
    const ageGroup = Math.floor((currentYear - birthYear) / 10) * 10 + "대";
    const genderStr = gender === "female" ? "여성" : "남성";

    const supabase = getSupabaseAdmin();
    let personaPrompt = "";

    // 이메일이 있으면 커스텀 페르소나 조회
    if (userEmail && supabase) {
        const { data: persona } = await supabase.from("user_personas").select("analyzed_tone").eq("user_email", userEmail).single();
        if (persona?.analyzed_tone) {
            personaPrompt = `
[특별 지시사항: 판매자의 고유 말투 페르소나 적용]
다음은 사용자의 인스타그램/게시글 등에서 추출한 고유한 말투 특징입니다. 이 특징을 1순위로 반영하여 작성해주세요!
--- 페르소나 분석 결과 ---
${persona.analyzed_tone}
--------------------------
`;
        }
    }

    const prompt = `
당신은 중고물품 거래에서 클릭률과 신뢰도를 극대화하는 매력적인 판매글 작성을 돕는 '마케팅 카피라이터'입니다.
다음 정보를 바탕으로 구매자의 마음을 사로잡는 판매글을 작성해주세요.
반드시 JSON 형태로 응답해야 합니다! 응답 키는 "danggeun", "joonggonara", "bungae", "seo_tags" (문자열 배열) 로 해주세요.

[판매자 프로필] 
나이 및 성별: ${ageGroup} ${genderStr} 

[물품 정보]
- 상품명: ${itemName}
- 상품 특이사항: ${itemDetails}

${imageUrl ? `(이미지가 첨부되었습니다. 이미지 내의 브랜드, 모델명, 색상, 스크래치 등 상태를 분석하여 글에 자연스럽게 포함시켜 주세요.)` : ""}

${personaPrompt}

[플랫폼별 톤앤매너 요구사항]
1. "danggeun" (당근마켓용): 친밀하고 이웃같은 느낌, 직거래 위주, 쿨거래 조건 강조, 이모지 풍부하게.
2. "joonggonara" (중고나라용): 신뢰감, 명확한 스펙과 상태 설명 우선, 매너있고 전문적인 느낌, 택배 선호 포맷.
3. "bungae" (번개장터용): 트렌디함, 힙한 말투, 명확한 장단점 피드백, 택배거래 환영 문구.

[공통 요구사항]
1. 입력/분석에 없는 확인되지 않은 정보(원가, 구매일 등)를 지어내지 말 것.
2. 단점은 솔직히 인정하되 긍정적인 가치로 포장할 것 (Sweet Sales Pitch).
3. "seo_tags" 배열에는 상위 노출을 위한 5~8개의 추천 키워드를 담을 것.
`;

    const messagesContent: any[] = [{ type: "text", text: prompt }];

    // 이미지가 있으면 Vision AI를 위한 객체 추가
    if (imageUrl) {
        messagesContent.push({
            type: "image_url",
            image_url: { url: imageUrl }
        });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o", // Vision + JSON Output 지원하는 모델
                messages: [{ role: "user", content: messagesContent }],
                response_format: { type: "json_object" },
                temperature: 0.7
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error:", response.status, errorText);
            return { success: false, text: `[DEBUG] HTTP ${response.status} 오류` };
        }

        const data = await response.json();
        const jsonContent = JSON.parse(data.choices[0].message.content || "{}");

        return { success: true, data: jsonContent };
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return { success: false, text: `[DEBUG] 예외 오류 발생` };
    }
}

// 히스토리 목록 조회
export async function getUserHistories() {
    const session = await auth();
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

// 즐겨찾기 상태 토글
export async function toggleFavoriteHistory(id: string, is_favorite: boolean) {
    const session = await auth();
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

// 인스타그램 말투 분석 및 저장 액션
export async function analyzeAndSavePersona(sampleTexts: string[]) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "로그인이 필요합니다." };

    const prompt = `
당신은 최고의 NLP 데이터 분석가이자 카피라이터입니다.
아래 사용자가 직접 작성한 여러 개의 게시글/문장들을 분석하여, 이 사람의 고유한 "말투, 분위기, 주로 쓰는 이모지 패턴, 문장 종결 어미(음슴체, 존댓말 등), 감성" 등을 파악하세요.
결과는 페르소나 프롬프트에 직접 주입할 수 있도록 3~4문장으로 명확하고 구체적으로 요약해주세요.

[사용자 작성 글 샘플]
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
            // Upsert 방식으로 저장
            const { error } = await supabase
                .from("user_personas")
                .upsert({ user_email: session.user.email, analyzed_tone: analyzedTone }, { onConflict: "user_email" });

            if (error) console.error("Persona upsert error:", error);
        }

        return { success: true, analyzedTone };
    } catch (err) {
        console.error(err);
        return { success: false, error: "분석 중 에러가 발생했습니다." };
    }
}
