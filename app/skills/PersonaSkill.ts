// PersonaSkill.ts: AI 말투 분석 스킬 (원자 기능)
// 역할: 사용자 샘플 텍스트에서 고유 말투/페르소나를 분석하는 단일 능력

export class PersonaSkill {
  /**
   * 사용자가 작성한 샘플 텍스트들을 분석해 말투 페르소나 요약 반환
   * @returns 분석된 말투 요약 문자열, 실패 시 null
   */
  static async analyzeTone(sampleTexts: string[], apiKey: string): Promise<string | null> {
    if (!apiKey || sampleTexts.length === 0) return null;

    const prompt = `
당신은 최고의 NLP 데이터 분석가이자 카피라이터입니다.
아래 사용자가 직접 작성한 여러 개의 게시글/문장들을 분석하여, 이 사람의 고유한 "말투, 분위기, 주로 쓰는 이모지 패턴, 문장 종결 어미(하쇼체, 존댓말 등), 감성" 등을 파악하세요.
결과를 다른 AI 프롬프트에 직접 주입할 수 있도록 3~4문장으로 명확하고 구체적으로 요약해주세요.

[사용자 작성 글 샘플]
${sampleTexts.join("\n\n---\n\n")}
`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const result = data?.choices?.[0]?.message?.content;
      if (typeof result !== "string" || !result.trim()) return null;

      return result.trim();
    } catch {
      return null;
    }
  }
}
