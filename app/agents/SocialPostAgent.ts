import { AgentContext, GeneratedSocialPost, SocialPlatform } from "../types/harness";
import { TextProcessingSkill } from "../skills/TextProcessingSkill";
import { VisionSkill } from "../skills/VisionSkill";

type SocialPostPayload = {
  platform: SocialPlatform;
  content?: unknown;
  hashtags?: unknown;
  title?: unknown;
  description?: unknown;
};

type SocialPostVisionInput = {
  imageUrl?: string;
  visualSubject?: string;
  visualDetails?: string;
};

function normalizeHashtags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const deduped = new Set<string>();
  for (const tag of raw) {
    const normalized = String(tag ?? "")
      .trim()
      .replace(/^#+/, "")
      .replace(/\s+/g, "");

    if (!normalized || normalized.length > 40) continue;
    deduped.add(normalized);
    if (deduped.size >= 30) break;
  }

  return Array.from(deduped);
}

function normalizeSocialPost(raw: unknown, platform: SocialPlatform): GeneratedSocialPost | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as SocialPostPayload;
  if (candidate.platform !== platform || typeof candidate.content !== "string") {
    return null;
  }

  const hashtags = normalizeHashtags(candidate.hashtags);
  if (hashtags.length < 5) return null;

  const result: GeneratedSocialPost = {
    platform,
    content: candidate.content.trim(),
    hashtags,
  };

  if (typeof candidate.title === "string" && candidate.title.trim()) {
    result.title = candidate.title.trim();
  }

  if (typeof candidate.description === "string" && candidate.description.trim()) {
    result.description = candidate.description.trim();
  }

  if (!result.content) return null;

  return result;
}

export class SocialPostAgent {
  private context: AgentContext;
  private visionSkill: VisionSkill;

  constructor(context: AgentContext) {
    this.context = context;
    this.visionSkill = new VisionSkill(context.apiKey);
  }

  private async enrichPromptWithVision(
    prompt: string,
    visionInput?: SocialPostVisionInput
  ): Promise<{ messagesContent: unknown[] }> {
    const imageUrl = visionInput?.imageUrl;
    if (!imageUrl) {
      return { messagesContent: [{ type: "text", text: prompt }] };
    }

    const imageDesc = await this.visionSkill.describeImage(
      imageUrl,
      visionInput?.visualSubject ?? "",
      visionInput?.visualDetails ?? ""
    );
    const enrichedPrompt = imageDesc
      ? `${prompt}\n\nImage observation for visible facts only:\n${imageDesc}`
      : prompt;

    return {
      messagesContent: [
        { type: "text", text: enrichedPrompt },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    };
  }

  async generatePost(
    prompt: string,
    platform: SocialPlatform,
    visionInput?: SocialPostVisionInput
  ): Promise<{ success: boolean; data?: GeneratedSocialPost; text?: string; jsonContent?: unknown }> {
    try {
      const { messagesContent } = await this.enrichPromptWithVision(prompt, visionInput);

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
          temperature: 0.55,
          max_tokens: 2400,
        }),
      });

      if (!response.ok) {
        return { success: false, text: `[DEBUG] HTTP ${response.status} error` };
      }

      const data = await response.json();
      const content = TextProcessingSkill.extractTextFromModelContent(
        data?.choices?.[0]?.message?.content
      );
      if (!content) return { success: false, text: "[DEBUG] Invalid AI payload" };

      const jsonContent = TextProcessingSkill.extractJsonPayload(content);
      if (!jsonContent) return { success: false, text: "[DEBUG] AI JSON parse failed" };

      const normalized = normalizeSocialPost(jsonContent, platform);
      if (!normalized) return { success: false, text: "[DEBUG] AI JSON schema mismatch" };

      return { success: true, data: normalized, jsonContent };
    } catch {
      return { success: false, text: "[DEBUG] Social post generation failed" };
    }
  }
}
