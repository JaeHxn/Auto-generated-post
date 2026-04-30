// StatsAgent.ts: Supabase에서 관리자 통계 데이터를 가져오는 에이전트
// Supabase 연결 실패 시 빈 데이터 반환 (graceful degradation)

import { getSupabaseAdmin } from "@/lib/supabase";
import { AdminStats, AccessLog } from "../types/admin";

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  todayActiveUsers: 0,
  totalGenerations: 0,
  todayGenerations: 0,
  recentAccessLogs: [],
  countryBreakdown: [],
  ipBreakdown: [],
};

export class StatsAgent {
  /**
   * 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (UTC 기준)
   */
  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Supabase에서 전체 통계 데이터 조회
   */
  async fetchStats(): Promise<AdminStats> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return EMPTY_STATS;

    const today = this.getTodayDateString();

    try {
      const [
        totalUsersResult,
        todayActiveUsersResult,
        totalGenerationsResult,
        todayGenerationsResult,
        recentLogsResult,
        countryBreakdownResult,
        ipBreakdownResult,
      ] = await Promise.all([
        // 전체 유저 수
        supabase.from("users").select("*", { count: "exact", head: true }),

        // 오늘 활성 유저 수 (last_used_date = today)
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("last_used_date", today),

        // 전체 생성 수
        supabase.from("histories").select("*", { count: "exact", head: true }),

        // 오늘 생성 수
        supabase
          .from("histories")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${today}T00:00:00.000Z`)
          .lt("created_at", `${today}T23:59:59.999Z`),

        // 최근 접근 로그 50건
        supabase
          .from("access_logs")
          .select("id, ip, country, user_agent, path, user_email, created_at")
          .order("created_at", { ascending: false })
          .limit(50),

        // 국가별 접근 집계
        supabase
          .from("access_logs")
          .select("country"),

        // IP별 접근 집계 (상위 20개)
        supabase
          .from("access_logs")
          .select("ip, country, created_at")
          .order("created_at", { ascending: false }),
      ]);

      const totalUsers = totalUsersResult.count ?? 0;
      const todayActiveUsers = todayActiveUsersResult.count ?? 0;
      const totalGenerations = totalGenerationsResult.count ?? 0;
      const todayGenerations = todayGenerationsResult.count ?? 0;

      const recentAccessLogs: AccessLog[] = recentLogsResult.data ?? [];

      // 국가별 집계 계산
      const countryMap = new Map<string, number>();
      for (const row of (countryBreakdownResult.data ?? [])) {
        const key = row.country ?? "unknown";
        countryMap.set(key, (countryMap.get(key) ?? 0) + 1);
      }
      const countryBreakdown = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      // IP별 집계 계산 (상위 20개)
      const ipMap = new Map<string, { country: string; count: number; lastSeen: string }>();
      for (const row of (ipBreakdownResult.data ?? [])) {
        const key = row.ip ?? "unknown";
        const existing = ipMap.get(key);
        if (!existing) {
          ipMap.set(key, {
            country: row.country ?? "unknown",
            count: 1,
            lastSeen: row.created_at,
          });
        } else {
          ipMap.set(key, {
            ...existing,
            count: existing.count + 1,
          });
        }
      }
      const ipBreakdown = Array.from(ipMap.entries())
        .map(([ip, data]) => ({ ip, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      return {
        totalUsers,
        todayActiveUsers,
        totalGenerations,
        todayGenerations,
        recentAccessLogs,
        countryBreakdown,
        ipBreakdown,
      };
    } catch (error) {
      console.error("StatsAgent.fetchStats error:", error);
      return EMPTY_STATS;
    }
  }
}
