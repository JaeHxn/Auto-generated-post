"use server";

import { headers } from "next/headers";
import { ratelimit } from "@/lib/redis";

export async function generateSellerCopy(formData: {
    birthYear: number;
    gender: string;
    itemName: string;
    itemDetails: string;
}) {
    // 1. IP 기반 Rate Limiting 검사 (Upstash Redis 설정이 있을 경우만)
    if (ratelimit) {
        // Next.js >= 13 (App Router Server Action)
        const forwardedFor = (await headers()).get("x-forwarded-for") || (await headers()).get("x-real-ip");
        const ip = forwardedFor?.split(",")[0] || "127.0.0.1";
        const { success } = await ratelimit.limit(ip);

        if (!success) {
            return {
                success: false,
                text: "하루 무료 사용량(10회)을 모두 소진하셨습니다. 내일 다시 이용해주세요! 😢",
            };
        }
    }

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
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-5-mini-2025-08-07",
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
        // gpt-5-mini Responses API: output[0]=reasoning, output[1]=message
        const messageItem = data.output?.find((item: { type: string }) => item.type === "message");
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
