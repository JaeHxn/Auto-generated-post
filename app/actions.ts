"use server";

export async function generateSellerCopy(formData: {
    birthYear: number;
    gender: string;
    itemName: string;
    itemDetails: string;
}) {
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

[요구사항]
1. 도입부: 정중하고 친근한 인사와 함께 판매자의 긍정적 페르소나 어필 
2. 본문: 단점은 솔직히 말하면서도 장점(가치)을 극대화시켜 포장할 것
3. 타겟 추천: 어떤 사람이 사면 좋을지 2~3가지 명확한 타겟 나열
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
        // Responses API: output_text or output[0].content[0].text
        const text = data.output_text || data.output?.[0]?.content?.[0]?.text || "";
        return { success: true, text };
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return {
            success: false,
            text: `[DEBUG] 예외 오류: ${String(error).slice(0, 300)}`,
        };
    }
}
