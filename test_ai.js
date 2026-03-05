const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAITest(formData, personaPrompt) {
    const { birthYear, gender, itemName, itemDetails, imageUrl } = formData;
    const currentYear = new Date().getFullYear();
    const ageGroup = Math.floor((currentYear - birthYear) / 10) * 10 + "대";
    const genderStr = gender === "female" ? "여성" : "남성";

    let prompt = `
당신은 중고물품 거래에서 클릭률과 신뢰도를 극대화하는 매력적인 판매글 작성을 돕는 '마케팅 카피라이터'입니다.
다음 정보를 바탕으로 구매자의 마음을 사로잡는 판매글을 작성해주세요.
반드시 JSON 형태로 응답해야 합니다! 응답 키는 "danggeun", "joonggonara", "bungae", "seo_tags" (문자열 배열) 로 해주세요.

[판매자 프로필] 
나이 및 성별: ${ageGroup} ${genderStr} 

[물품 정보]
- 상품명: ${itemName}
- 상품 특이사항: ${itemDetails}
`;

    if (imageUrl) {
        prompt += `\n(이미지가 첨부되었습니다. 이미지 내의 브랜드, 모델명, 색상, 스크래치 등 상태를 분석하여 글에 자연스럽게 포함시켜 주세요.)\n`;
    }

    if (personaPrompt) {
        prompt += `\n
[특별 지시사항: 판매자의 고유 말투 페르소나 적용]
다음은 사용자의 인스타그램/게시글 등에서 추출한 고유한 말투 특징입니다. 이 특징을 1순위로 반영하여 작성해주세요!
--- 페르소나 분석 결과 ---
${personaPrompt}
--------------------------
\n`;
    }

    prompt += `
[플랫폼별 톤앤매너 요구사항]
1. "danggeun" (당근마켓용): 친밀하고 이웃같은 느낌, 직거래 위주, 쿨거래 조건 강조, 이모지 풍부하게.
2. "joonggonara" (중고나라용): 신뢰감, 명확한 스펙과 상태 설명 우선, 매너있고 전문적인 느낌, 택배 선호 포맷.
3. "bungae" (번개장터용): 트렌디함, 힙한 말투, 명확한 장단점 피드백, 택배거래 환영 문구.

[공통 요구사항]
1. 입력/분석에 없는 확인되지 않은 정보(원가, 구매일 등)를 지어내지 말 것.
2. 단점은 솔직히 인정하되 긍정적인 가치로 포장할 것 (Sweet Sales Pitch).
3. "seo_tags" 배열에는 상위 노출을 위한 5~8개의 추천 키워드를 담을 것.
`;

    const messagesContent = [{ type: "text", text: prompt }];

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [{ role: "user", content: messagesContent }],
                response_format: { type: "json_object" },
                temperature: 0.7
            }),
        });

        const data = await response.json();
        const jsonContent = JSON.parse(data.choices[0].message.content || "{}");
        return { success: true, data: jsonContent };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log("=== 테스트 1: 일반 전자제품 (커스텀 페르소나 없음) ===");
    const test1 = await callOpenAITest({
        birthYear: 1995,
        gender: "male",
        itemName: "맥북 프로 14인치 M2 Pro",
        itemDetails: "1년 정도 썼고, 아껴 써서 상태 아주 좋습니다. 키보드 번들거림 살짝 있고 상판에 아주 미세한 기스(빛 비춰야 보임) 하나 있어요. 박스와 정품 충전기 다 드립니다. 직거래는 강남역."
    }, null);

    console.log("=== 테스트 2: 의류/뷰티 (인스타 감성 듬뿍 커스텀 페르소나) ===");
    const test2 = await callOpenAITest({
        birthYear: 2000,
        gender: "female",
        itemName: "마르디 메크르디 스웻셔츠 블루",
        itemDetails: "작년에 사서 5번 정도 입었어요! 건조기 한 번 돌렸더니 기분 탓인지 살짝 줄어든 느낌? 핏은 여전히 예쁜데 저한테 작아져서 올려요. 얼룩 같은 건 전혀 없고 세탁 완료했습니다!"
    }, "이모지를 🌸 🎀 ✨ 같은 귀여운 걸 주로 씁니다. 말끝에 '~했어용', '~하쥬' 등 애교 있는 어미를 사용하며, 전체적으로 아주 발랄하고 친화력 넘치는 톤앤매너입니다.");

    fs.writeFileSync('test_results.json', JSON.stringify({ test1, test2 }, null, 2));
    console.log("테스트 완료, 결과를 test_results.json에 저장했습니다.");
}

runTests();
