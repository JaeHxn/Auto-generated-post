// AnalyzePersonaCommand.ts: 페르소나 분석 오케스트레이터
// 역할: 인증 확인 → PersonaSkill 호출 → DB 저장 순서 조립

import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PersonaSkill } from "../skills/PersonaSkill";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class AnalyzePersonaCommand {
  private async getSafeSession() {
    try {
      return await auth();
    } catch (error) {
      console.error("Auth session read failed:", error);
      return null;
    }
  }

  async execute(sampleTexts: string[]): Promise<{
    success: boolean;
    analyzedTone?: string;
    error?: string;
  }> {
    // 1. 인증 확인
    const session = await this.getSafeSession();
    if (!session?.user?.email) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    if (!OPENAI_API_KEY) {
      return { success: false, error: "OPENAI_API_KEY is missing" };
    }

    // 2. PersonaSkill로 AI 분석 위임
    const analyzedTone = await PersonaSkill.analyzeTone(sampleTexts, OPENAI_API_KEY);
    if (!analyzedTone) {
      return { success: false, error: "분석 중 에러가 발생했습니다." };
    }

    // 3. Supabase에 결과 저장
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase
        .from("user_personas")
        .upsert(
          { user_email: session.user.email, analyzed_tone: analyzedTone },
          { onConflict: "user_email" }
        );

      if (error) console.error("Persona upsert error:", error);
    }

    return { success: true, analyzedTone };
  }
}
