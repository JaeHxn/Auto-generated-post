"use server";

import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const GUEST_DAILY_LIMIT = 1;
const USER_DAILY_LIMIT = 2;

export type GenerateResult = {
    success: boolean;
    text: string;
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
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        // Supabase 미설정 시 무제한 허용
        return { allowed: true, remaining: USER_DAILY_LIMIT, credits: 0, usedCredit: false };
    }

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

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

    // 만약 무료 횟수를 다 썼다면 크레딧을 차감
    if (currentCount >= USER_DAILY_LIMIT) {
        if (currentCredits > 0) {
            await supabase
                .from("users")
                .update({ credits: currentCredits - 1 })
                .eq("email", email);

            return { allowed: true, remaining: 0, credits: currentCredits - 1, usedCredit: true };
        } else {
            return { allowed: false, remaining: 0, credits: 0, usedCredit: false };
        }
    }

    // 아직 무료 횟수가 남아있다면 무료 횟수 소진
    await supabase
        .from("users")
        .update({
            daily_count: currentCount + 1,
            last_used_date: today,
        })
        .eq("email", email);

    return {
        allowed: true,
        remaining: USER_DAILY_LIMIT - (currentCount + 1),
        credits: currentCredits,
        usedCredit: false,
    };
}

export async function generateSellerCopy(
    formData: {
        birthYear: number;
        gender: string;
        itemName: string;
        itemDetails: string;
    },
    guestCount?: number
): Promise<GenerateResult> {
    // 로그인 세션 및 Supabase 인스턴스 확인
    const session = await auth();
    const supabase = getSupabaseAdmin();

    if (session?.user?.email) {
        // 로그인 유저: Supabase 기반 하루 2회 제한 + 크레딧 사용
        const { allowed, remaining, credits, usedCredit } = await checkAndIncrementUserCount(
            session.user.email
        );
        if (!allowed) {
            return {
                success: false,
                text: `오늘의 무료 생성 횟수(${USER_DAILY_LIMIT}회)를 모두 사용했습니다. 충전된 크레딧이 없습니다. 💎크레딧을 충전하시거나 내일 다시 이용해주세요! 😢`,
                remainingCount: 0,
                limit: USER_DAILY_LIMIT,
                isLimitReached: true,
            };
        }

        const result = await callOpenAI(formData);

        if (result.success && result.text && supabase) {
            // 히스토리 저장
            await supabase.from("histories").insert({
                user_email: session.user.email,
                item_name: formData.itemName,
                item_details: formData.itemDetails,
                generated_text: result.text,
            });
        }

        return { ...result, remainingCount: remaining, limit: USER_DAILY_LIMIT, isCreditUsed: usedCredit, currentCredits: credits };
    } else {
        // 비로그인 유저: 클라이언트에서 guestCount를 넘겨받아 서버에서 검증
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

        const result = await callOpenAI(formData);
        return {
            ...result,
            remainingCount: GUEST_DAILY_LIMIT - (count + 1),
            limit: GUEST_DAILY_LIMIT,
        };
    }
}

async function callOpenAI(formData: {
    birthYear: number;
    gender: string;
    itemName: string;
    itemDetails: string;
}): Promise<{ success: boolean; text: string }> {
    const { birthYear, gender, itemName, itemDetails } = formData;

    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const ageGroup = Math.floor(age / 10) * 10 + "대";
    const genderStr = gender === "female" ? "여성" : "남성";

    const prompt = `
당신은 중고물품 거래(당근마켓 등)에서 클릭률과 신뢰도를 극대화하는 매력적인 판매글 작성을 돕는 '마케팅 카피라이터'입니다.
다음 정보를 바탕으로 구매자의 마음을 사로잡는 VIP 감성 판매글을 작성해주세요.

[판매자 정보 (신뢰도 형성 목적)]
- 나이 및 성별: ${ageGroup} ${genderStr} 

[물품 정보]
- 상품명: ${itemName}
- 상품 특이사항 장단점: ${itemDetails}

[절대 원칙 - 반드시 지킬 것]
1. 위 [물품 정보]에 명시된 사항만 사용할 것. 입력에 없는 기능, 스펙, 상태, 부속품 등을 절대 추가하거나 추측하지 말 것.
2. 단점이나 하자가 언급된 경우 축소하거나 숨기지 말 것. 단, 구매자가 납득할 수 있도록 정중하고 공감 가는 표현으로 전달할 것.
3. 입력에 없는 정보(예: 원가, 구매처, 사용 빈도, 부속품 존재 여부 등)를 임의로 추가하지 말 것.
4. 확인되지 않은 사항은 "약", "추정", "아마" 같은 불확실한 표현조차 쓰지 말고 아예 언급하지 말 것.

[작성 요구사항]
1. 도입부: 정중하고 친근한 인사와 함께 판매자의 긍정적 페르소나 어필 
2. 본문: 입력된 장단점을 사실 그대로 서술하되, 장점(가치)을 극대화하고 단점은 솔직하게 인정하면서도 공감을 유도하는 방식으로 표현
3. 타겟 추천: 입력된 상품명과 상태를 바탕으로 실제로 이 물건이 어울릴 구매자 2~3가지 나열
4. 마무리: 쿨거래 및 직거래 조건 등 깔끔하고 매너있는 맺음말
5. 분위기: 무리한 개그보다는 진정성, 깔끔함, 전문성, 따뜻함을 주는 명품 매장 직원 같은 톤앤매너
6. 이모지를 적절히 사용하여 글이 지루하지 않게 할 것
7. 짧지 않게, 적당한 긴장감과 스토리텔링이 있는 길이로 작성
`;

    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                input: [{ role: "user", content: prompt }],
                store: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error:", response.status, errorText);
            return {
                success: false,
                text: `[DEBUG] HTTP ${response.status} 오류: ${errorText.slice(0, 300)}`,
            };
        }

        const data = await response.json();
        const messageItem = data.output?.find(
            (item: { type: string }) => item.type === "message"
        );
        const text = messageItem?.content?.[0]?.text || "";
        return { success: true, text };
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return {
            success: false,
            text: `[DEBUG] 예외 오류: ${String(error).slice(0, 300)}`,
        };
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

    // 보안상 자기 자신의 데이터인지 확인
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
