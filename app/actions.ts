"use server";

// actions.ts: Next.js Server Action 진입점
// 역할: 하네스(createHarness)에 100% 위임 — 비즈니스 로직 절대 없음

import { createHarness } from "./harness";
import { GeneratorParams } from "./types/harness";

// 재사용을 위해 타입 다시 export (기존 컴포넌트들 호환성 유지)
export type { GenerateResult } from "./types/harness";

/**
 * 1. AI 판매글 생성 (Harness → GeneratePostCommand → ListingAgent)
 */
export async function generateSellerCopy(
  formData: GeneratorParams,
  guestCount?: number
) {
  return createHarness().generate(formData, guestCount);
}

/**
 * 2. 히스토리 목록 조회
 */
export async function getUserHistories() {
  const { auth } = await import("@/auth");
  const { getSupabaseAdmin } = await import("@/lib/supabase");

  let session = null;
  try { session = await auth(); } catch (e) { console.error("Auth failed:", e); }
  if (!session?.user?.email) return { success: false, data: [] };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { success: false, data: [] };

  const { data, error } = await supabase
    .from("histories")
    .select("*")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch histories error:", error);
    return { success: false, data: [] };
  }

  return { success: true, data };
}

/**
 * 3. 즐겨찾기 상태 변경
 */
export async function toggleFavoriteHistory(id: string, is_favorite: boolean) {
  const { auth } = await import("@/auth");
  const { getSupabaseAdmin } = await import("@/lib/supabase");

  let session = null;
  try { session = await auth(); } catch (e) { console.error("Auth failed:", e); }
  if (!session?.user?.email) return { success: false };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { success: false };

  const { error } = await supabase
    .from("histories")
    .update({ is_favorite })
    .eq("id", id)
    .eq("user_email", session.user.email);

  if (error) {
    console.error("Update favorite error:", error);
    return { success: false };
  }

  return { success: true };
}

/**
 * 4. 인스타그램/게시글 말투 분석 및 저장 (Harness → AnalyzePersonaCommand → PersonaSkill)
 */
export async function analyzeAndSavePersona(sampleTexts: string[]) {
  return createHarness().analyzePersona(sampleTexts);
}
