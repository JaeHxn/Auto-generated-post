// ListingAgent.ts: AI 판매글 생성 에이전트
// 역할: OpenAI API 직접 호출 담당. VisionSkill로 이미지 선분석 후 프롬프트에 주입.

import { GeneratedCopy, AgentContext } from "../types/harness";
import { VisionSkill } from "../skills/VisionSkill";
import { TextProcessingSkill } from "../skills/TextProcessingSkill";

type MessageContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export class ListingAgent {
  private context: AgentContext;
  private visionSkill: VisionSkill;

  constructor(context: AgentContext) {
    this.context = context;
    this.visionSkill = new VisionSkill(context.apiKey);
  }

  /**
   * 1단계: 이미지 선분석 (있을 경우)
   * VisionSkill로 저렴한 mini 모델을 먼저 돌려서 시각 사실을 추출,
   * 이후 메인 생성 프롬프트에 주입 → 메인 모델의 정확도 향상
   */
  private async enrichPromptWithVision(
    prompt: string,
    imageUrl: string | undefined,
    itemName: string,
    itemDetails: string
  ): Promise<{ enrichedPrompt: string; messagesContent: MessageContent[] }> {
    const messagesContent: MessageContent[] = [{ type: "text", text: prompt }];

    if (!imageUrl) {
      return { enrichedPrompt: prompt, messagesContent };
    }

    // VisionSkill: gpt-4o-mini로 시각 사실 선추출
    const imageDesc = await this.visionSkill.describeImage(imageUrl, itemName, itemDetails);

    if (imageDesc) {
      // 프롬프트에 VisionSkill이 뽑은 구체적 시각 사실 주입
      const enrichedPrompt =
        prompt +
        `\n\n[이미지 사전 분석 결과 — 아래 사실만 반영하고 추가 추측 금지]\n${imageDesc}`;
      return {
        enrichedPrompt,
        messagesContent: [
          { type: "text", text: enrichedPrompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      };
    }

    // VisionSkill 분석 실패 시 이미지 URL만 그대로 전달
    return {
      enrichedPrompt: prompt,
      messagesContent: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    };
  }

  /**
   * 2단계: 메인 판매글 초안 생성
   * gpt-4o 모델로 플랫폼별 판매글 JSON 생성
   */
  async generateDraft(
    prompt: string,
    imageUrl?: string,
    itemName?: string,
    itemDetails?: string
  ): Promise<{ success: boolean; data?: GeneratedCopy; text?: string; jsonContent?: Record<string, unknown> }> {
    try {
      const { messagesContent } = await this.enrichPromptWithVision(
        prompt,
        imageUrl,
        itemName ?? "",
        itemDetails ?? ""
      );

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.context.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: messagesContent }],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: 1800,
        }),
      });

      if (!response.ok) {
        return { success: false, text: `[DEBUG] HTTP ${response.status} 오류` };
      }

      const data = await response.json();
      const content = TextProcessingSkill.extractTextFromModelContent(
        data?.choices?.[0]?.message?.content
      );
      if (!content) return { success: false, text: "[DEBUG] Invalid AI payload" };

      const jsonContent = TextProcessingSkill.extractJsonPayload(content);
      if (!jsonContent) return { success: false, text: "[DEBUG] AI JSON parse failed" };

      const normalized = TextProcessingSkill.normalizeGeneratedCopy(jsonContent);
      if (!normalized) return { success: false, text: "[DEBUG] AI JSON schema mismatch" };

      return { success: true, data: normalized, jsonContent };
    } catch {
      return { success: false, text: "[DEBUG] 예외 오류 발생" };
    }
  }

  /**
   * 3단계: 품질 미달 시 초안 확장 재시도
   * gpt-4o-mini 모델로 최소 길이/블록 수 충족하도록 재작성
   */
  async expandDraft(
    draft: GeneratedCopy,
    prompt: string
  ): Promise<GeneratedCopy | null> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.context.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 1800,
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      const content = TextProcessingSkill.extractTextFromModelContent(
        data?.choices?.[0]?.message?.content
      );
      if (!content) return null;

      const parsed = TextProcessingSkill.extractJsonPayload(content);
      if (!parsed) return null;

      const normalized = TextProcessingSkill.normalizeGeneratedCopy(parsed);
      if (!normalized) return null;

      if (TextProcessingSkill.isLowQualityCopy(normalized)) return null;

      return normalized;
    } catch {
      return null;
    }
  }
}
