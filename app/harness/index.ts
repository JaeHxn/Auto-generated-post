// harness/index.ts: 하네스 조립 공장 (Factory)
// 역할: 모든 Command를 한 곳에서 조립·제공 → actions.ts는 여기만 바라봄
//
// 사용법:
//   import { createHarness } from "@/app/harness";
//   const result = await createHarness().generate(params, guestCount);
//   const persona = await createHarness().analyzePersona(sampleTexts);
//   const stats = await createHarness().adminStats();

import { GeneratePostCommand } from "../commands/GeneratePostCommand";
import { AnalyzePersonaCommand } from "../commands/AnalyzePersonaCommand";
import { AdminStatsCommand } from "../commands/AdminStatsCommand";
import { GenerateResult, GeneratorParams } from "../types/harness";
import { AdminStats } from "../types/admin";

export interface AppHarness {
  /**
   * AI 판매글 생성 파이프라인
   * 인증 → 사용량 제한 → 프롬프트 빌드 → AI 생성 → 품질 검사 → DB 저장
   */
  generate(formData: GeneratorParams, guestCount?: number): Promise<GenerateResult>;

  /**
   * 사용자 말투 페르소나 분석 파이프라인
   * 인증 → AI 분석 → DB 저장
   */
  analyzePersona(sampleTexts: string[]): Promise<{
    success: boolean;
    analyzedTone?: string;
    error?: string;
  }>;

  /**
   * 관리자 대시보드 통계 조회 파이프라인
   * Supabase에서 유저, 생성 기록, 접근 로그 집계
   */
  adminStats(): Promise<{ success: boolean; data?: AdminStats; error?: string }>;
}

/**
 * 하네스 인스턴스 생성
 * 모든 Command를 조립해서 단일 인터페이스로 제공
 */
export function createHarness(): AppHarness {
  return {
    generate: (formData, guestCount) =>
      new GeneratePostCommand().execute(formData, guestCount),

    analyzePersona: (sampleTexts) =>
      new AnalyzePersonaCommand().execute(sampleTexts),

    adminStats: () =>
      new AdminStatsCommand().execute(),
  };
}
