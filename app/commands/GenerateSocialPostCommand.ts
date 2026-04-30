import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  AgentContext,
  SocialPostInput,
  SocialPostResult,
} from "../types/harness";
import { SocialPostAgent } from "../agents/SocialPostAgent";
import { YouTubeTranscriptSkill, YouTubeVideoContext } from "../skills/YouTubeTranscriptSkill";

const GUEST_DAILY_LIMIT = 2;
const USER_DAILY_LIMIT = 2;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "luvsoul@kakao.com";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class GenerateSocialPostCommand {
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
      }

      return { allowed: false, remaining: 0, credits: 0, usedCredit: false };
    }

    await supabase
      .from("users")
      .update({ daily_count: currentCount + 1, last_used_date: today })
      .eq("email", email);

    return {
      allowed: true,
      remaining: USER_DAILY_LIMIT - (currentCount + 1),
      credits: currentCredits,
      usedCredit: false,
    };
  }

  private buildPrompt(input: SocialPostInput, youtubeContext?: YouTubeVideoContext | null) {
    const { platform, imageUrl, postBrief, videoUrl, videoDetails } = input;
    const youtubeContextText =
      youtubeContext
        ? `
YouTube URL context:
- url: ${youtubeContext.url}
- video id: ${youtubeContext.videoId}
${youtubeContext.title ? `- title: ${youtubeContext.title}` : ""}
${youtubeContext.authorName ? `- channel: ${youtubeContext.authorName}` : ""}
- context source: ${youtubeContext.source}
${youtubeContext.transcript ? `- transcript excerpt:\n${youtubeContext.transcript}` : "- transcript: unavailable"}
`
        : "";

    const platformRules = platform === "instagram"
      ? `
Instagram style:
- The user is NOT creating a second-hand sales listing.
- Write one natural Korean Instagram caption based on the uploaded photo and rough post memo.
- Make it sound like a real caption: readable line breaks, warm hook, natural flow, no sales-template labels.
- If the memo is rough, organize it into a polished caption without inventing facts.
- Do not ask for seller age, gender, product name, price, shipping, warranty, or trading conditions.`
      : `
YouTube style — IMPORTANT: produce HIGH-ENGAGEMENT, algorithm-friendly Korean content:
- The user is NOT creating a second-hand sales listing.
- TITLE: Write a click-worthy Korean title under 60 characters. Use proven hook patterns:
  "이걸 몰랐다면?", "~하는 법", "충격적인 ~", "솔직 후기", "~만에 ~한 결과", numbers like "3가지", "5분 만에" etc.
  Make it emotionally compelling — curiosity, surprise, or clear value.
- DESCRIPTION: Write a full YouTube description (200~350 characters Korean).
  Structure: 1) Hook sentence  2) What viewers will learn/see  3) Key timestamps or chapters hint (even if rough)  4) CTA ("좋아요·구독·알림설정 부탁드립니다!")
- CONTENT (community post / shorts caption): Write 150~250 characters of engaging Korean copy.
  Use conversational tone, emojis where natural, line breaks for readability. End with a question or CTA to boost comments.
- HASHTAGS: Return 20 to 30 hashtags. Mix these categories:
  a) Core topic tags (5~8): exact topic keyword
  b) Trending discovery tags (5~8): broad popular tags currently trending on YouTube Korea (e.g. 유튜브, 브이로그, 일상, 꿀팁, 정보, 리뷰, 추천 etc.)
  c) Niche long-tail tags (5~8): specific sub-topic or audience tags
  d) SEO helper tags (3~6): synonyms, related searches
  All as plain strings without "#". No duplicates.
- If a YouTube URL transcript is available, ground all content in actual video facts.
- If only metadata or user memo is available, use that clearly without inventing scenes.
- Do not add unverifiable claims or fake timestamps.`;

    return `
You are a top-tier Korean YouTube content strategist and copywriter.
Return ONLY a JSON object with keys:
"platform", "content", "hashtags", and for YouTube always include "title" and "description".

Hard constraints:
1) platform must be exactly "${platform}".
2) Write natural Korean for content, title, and description.
3) Use ONLY facts from the input. Do not invent any new facts.
4) Never add unverifiable claims. Do not invent results, timestamps, names, events, or video scenes.
5) If an image is attached, reflect only clearly visible facts.
6) For YouTube: return 20 to 30 hashtags as plain strings without "#".
   For Instagram: return 15 to 25 hashtags as plain strings without "#".
7) Hashtags must be useful for discovery, specific to the content, Korean where natural, no duplicates.
8) Do not output markdown, explanations, comments, or text outside JSON.

${platformRules}

User input:
${postBrief ? `- Instagram post memo: ${postBrief}` : ""}
${videoUrl ? `- YouTube video URL: ${videoUrl}` : ""}
${videoDetails ? `- YouTube video memo: ${videoDetails}` : ""}
${imageUrl ? "- image is attached and may be used only for visible facts." : "- no image is attached."}
${youtubeContextText}
`;
  }

  async execute(
    input: SocialPostInput,
    guestCount?: number
  ): Promise<SocialPostResult> {
    if (!OPENAI_API_KEY) {
      return { success: false, text: "OPENAI_API_KEY is missing", isLimitReached: true };
    }

    if (input.platform !== "instagram" && input.platform !== "youtube") {
      return { success: false, text: "Unsupported social platform", isLimitReached: false };
    }

    if (input.platform === "instagram" && !input.imageUrl && !input.postBrief?.trim()) {
      return { success: false, text: "사진이나 게시물 메모를 입력해 주세요.", isLimitReached: false };
    }

    if (input.platform === "youtube" && !input.videoUrl?.trim() && !input.videoDetails?.trim()) {
      return { success: false, text: "유튜브 URL이나 영상 내용 메모를 입력해 주세요.", isLimitReached: false };
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
          text: `오늘 무료 생성 횟수(${USER_DAILY_LIMIT}회)를 모두 사용했습니다. 충전된 크레딧이 없습니다.`,
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

    const context: AgentContext = { apiKey: OPENAI_API_KEY, userEmail };
    const agent = new SocialPostAgent(context);
    const youtubeContext = input.platform === "youtube" && input.videoUrl?.trim()
      ? await YouTubeTranscriptSkill.fetchContext(input.videoUrl)
      : null;
    const result = await agent.generatePost(
      this.buildPrompt(input, youtubeContext),
      input.platform,
      {
        imageUrl: input.imageUrl,
        visualSubject: input.postBrief ?? input.videoDetails ?? input.videoUrl ?? "",
        visualDetails: input.postBrief ?? input.videoDetails ?? "",
      }
    );

    return {
      ...result,
      remainingCount: remaining,
      limit,
      isLimitReached: false,
      isCreditUsed,
      currentCredits,
    };
  }
}
