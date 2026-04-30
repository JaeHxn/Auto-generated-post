import { getSupabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { GenerateResult, GeneratorParams, AgentContext } from "../types/harness";
import { ListingAgent } from "../agents/ListingAgent";
import { TextProcessingSkill } from "../skills/TextProcessingSkill";

const GUEST_DAILY_LIMIT = 1;
const USER_DAILY_LIMIT = 2;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "luvsoul@kakao.com";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class GeneratePostCommand {
  private async getSafeSession() {
    try {
      return await auth();
    } catch (error) {
      console.error("Auth session read failed:", error);
      return null;
    }
  }

  private async checkAndIncrementUserCount(email: string) {
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

  private async buildPrompt(formData: GeneratorParams, userEmail: string | null) {
    const { birthYear, gender, itemName, itemDetails, imageUrl } = formData;
    const currentYear = new Date().getFullYear();
    const ageGroup = `${Math.floor((currentYear - birthYear) / 10) * 10}s`;
    const genderStr = gender === "female" ? "female" : "male";

    let personaPrompt = "";
    const supabase = getSupabaseAdmin();
    if (userEmail && supabase) {
      const { data: persona } = await supabase.from("user_personas").select("analyzed_tone").eq("user_email", userEmail).single();
      if (persona?.analyzed_tone) {
        personaPrompt = `
[특별 지시사항: 판매자의 고유 말투 페르소나 적용]
다음은 사용자의 인스타그램/게시글 등에서 추출한 고유의 말투 특징입니다. 이 특징을 1순위로 반영하여 작성해주세요!
--- 페르소나 분석 결과 ---
${persona.analyzed_tone}
--------------------------
`;
      }
    }

    const prompt = `
You are a Korean marketplace copywriter for second-hand listings.
Return ONLY a JSON object with keys:
"danggeun", "joonggonara", "bungae", "seo_tags".

Write in natural Korean. Tone must be warm, trustworthy, and detailed.
Each listing should feel like a real seller wrote it and can paste it directly into the marketplace.
All listing text fields must be written in Korean.

Hard constraints:
1) Use ONLY facts from the input. Do not invent any new facts.
2) Never add unverifiable claims such as:
   - warranty/refund period
   - authenticity/certification
   - purchase date or usage period (unless explicitly given)
   - reason for sale
   - shipping option (unless explicitly given)
   - hidden defects or accessories not mentioned
3) Keep important details from the user input. Do not over-compress.
4) Do not use exaggerated hype language or spammy phrases.

Writing rules:
- Blend the user's original wording and facts into a cohesive listing.
- Do not turn the result into a guide, notice, or explanation about how the text was written.
- Never output bracketed headers or template labels such as [사진 관찰], [추가 안내], [문의 안내], [상품명], [거래 안내].
- Never write meta phrases such as "입력해주신 내용을 기준으로 정리했습니다", "읽기 쉽게 정리했습니다", "안내드립니다".
- Use normal paragraphs, not checklist-style labels.

Length constraints (minimum):
- danggeun: at least 360 Korean characters
- joonggonara: at least 420 Korean characters
- bungae: at least 320 Korean characters

Structure constraints:
- Each platform copy must have at least 3 content blocks separated by blank lines.
- Expand by adding at least 2 extra detail blocks compared to a short one-paragraph listing.
- Recommended block order: 1) item summary 2) condition/detail explanation 3) transaction/contact guidance.
${imageUrl
      ? `- An image is attached. Reflect only clearly visible facts from the image inside normal body paragraphs.
- Mention at least 2 concrete visual facts when they are clearly visible.
- If clear image-based details are not available, simply leave image-based wording out.`
      : `- No image is attached. Do not mention photos or image analysis.`}

Platform style:
- danggeun: friendly local-trade vibe, clear condition description, easy-to-read structure.
- joonggonara: more structured and informative, include condition/details in organized form.
- bungae: concise but still detailed, mobile-friendly flow, clear call-to-action.

Input profile:
- seller age group: ${ageGroup}
- seller gender: ${genderStr}

Item facts:
- item name: ${itemName}
- item details: ${itemDetails}
${imageUrl ? "- image is attached and must be analyzed for visible facts only." : ""}

${personaPrompt}

For "seo_tags":
- Return 5 to 8 tags as plain strings.
- No duplicates.
- Keep tags specific and relevant to the item.
`;
    return { prompt, ageGroup, genderStr };
  }

  async execute(formData: GeneratorParams, guestCount?: number): Promise<GenerateResult> {
    if (!OPENAI_API_KEY) {
      return { success: false, text: "OPENAI_API_KEY is missing", isLimitReached: true };
    }

    const session = await this.getSafeSession();
    const userEmail = session?.user?.email || null;

    let remaining = 0;
    let limit = 0;
    let isCreditUsed = false;
    let currentCredits = 0;

    if (userEmail) {
      const authCheck = await this.checkAndIncrementUserCount(userEmail);
      if (!authCheck.allowed) {
        return {
          success: false,
          text: `오늘의 무료 생성 횟수(${USER_DAILY_LIMIT}회)를 모두 사용했습니다. 충전된 크레딧이 없습니다.`,
          remainingCount: 0,
          limit: USER_DAILY_LIMIT,
          isLimitReached: true,
        };
      }
      remaining = authCheck.remaining;
      limit = USER_DAILY_LIMIT;
      isCreditUsed = authCheck.usedCredit;
      currentCredits = authCheck.credits;
    } else {
      const count = guestCount ?? 0;
      if (count >= GUEST_DAILY_LIMIT) {
        return {
          success: false,
          text: `Guest limit reached: ${GUEST_DAILY_LIMIT}/day. Sign in for more.`,
          remainingCount: 0,
          limit: GUEST_DAILY_LIMIT,
          isLimitReached: true,
        };
      }
      remaining = GUEST_DAILY_LIMIT - (count + 1);
      limit = GUEST_DAILY_LIMIT;
    }

    const { prompt, ageGroup, genderStr } = await this.buildPrompt(formData, userEmail);

    // messagesContent 조립은 Agent(ListingAgent)의 책임 — Command는 imageUrl만 전달
    const context: AgentContext = { apiKey: OPENAI_API_KEY, userEmail };
    const agent = new ListingAgent(context);

    let result = await agent.generateDraft(prompt, formData.imageUrl, formData.itemName, formData.itemDetails);
    if (!result.success || !result.data) {
      return { ...result, remainingCount: remaining, limit, isLimitReached: false, isCreditUsed, currentCredits };
    }

    let finalCopy = result.data;

    if (TextProcessingSkill.isLowQualityCopy(finalCopy)) {
      const expandedPrompt = `
You are improving Korean second-hand listing copy quality.
Rewrite the draft to satisfy quality constraints while preserving facts.
Return ONLY JSON with keys "danggeun", "joonggonara", "bungae", "seo_tags".
All listing text fields must be written in Korean.

Quality constraints:
- danggeun length >= 360
- joonggonara length >= 420
- bungae length >= 320
- each copy must include at least 3 content blocks separated by blank lines
- seo_tags count: 5 to 8
- write cohesive seller-facing paragraphs, not guide text or notices
- do not use bracketed labels
${formData.imageUrl ? "- weave clearly visible facts from image naturally" : "- do not mention photos"}

Facts:
- seller age group: ${ageGroup}
- seller gender: ${genderStr}
- item name: ${formData.itemName}
- item details: ${formData.itemDetails}

Current draft JSON:
${JSON.stringify(finalCopy)}
`;
      const expanded = await agent.expandDraft(finalCopy, expandedPrompt);
      if (expanded) finalCopy = expanded;
    }

    // Save to history
    if (userEmail) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from("histories").insert({
          user_email: userEmail,
          item_name: formData.itemName,
          item_details: formData.itemDetails,
          generated_text: finalCopy.danggeun,
          platform_versions: finalCopy,
          seo_tags: finalCopy.seo_tags
        });
      }
    }

    return { success: true, data: finalCopy, remainingCount: remaining, limit, isLimitReached: false, isCreditUsed, currentCredits };
  }
}
