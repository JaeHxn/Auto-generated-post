// VisionSkill.ts: AI Image recognition skill
import { TextProcessingSkill } from "./TextProcessingSkill";

const IMAGE_ANALYSIS_FAILURE_REGEX = /확인(?:되는)? 정보가 없|판단이 어렵|식별이 어렵|명확하지 않|알 수 없|불분명|사진이 흐릿|분석 실패/;
const EMPTY_IMAGE_RESPONSE_REGEX = /^["']?\s*(?:없음|없습니다|none|null)?\s*["']?$/i;

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

export class VisionSkill {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async describeImage(imageUrl: string, itemName: string, itemDetails: string): Promise<string> {
    if (!this.apiKey) return "";

    const prompt = `
You analyze one marketplace image and write only clearly visible facts in Korean.
Do not invent hidden details.
Return 1 or 2 natural Korean sentences that can be inserted directly into a seller listing.
Include at least 2 concrete visual observations when they are clearly visible.
If there are not at least 2 clear visible facts, return an empty string.

Item name: ${itemName}
Item details from seller: ${itemDetails}
`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 220,
        }),
      });

      if (!response.ok) return "";

      const data = await response.json();
      const text = TextProcessingSkill.extractTextFromModelContent(data?.choices?.[0]?.message?.content);
      if (!text) return "";

      return normalizeImageObservationText(text);
    } catch {
      return "";
    }
  }
}
