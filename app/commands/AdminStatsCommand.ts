// AdminStatsCommand.ts: 관리자 통계 커맨드
// 역할: StatsAgent를 감싸서 에러 핸들링과 일관된 응답 포맷 제공

import { StatsAgent } from "../agents/StatsAgent";
import { AdminStats } from "../types/admin";

export class AdminStatsCommand {
  async execute(): Promise<{ success: boolean; data?: AdminStats; error?: string }> {
    try {
      const agent = new StatsAgent();
      const data = await agent.fetchStats();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("AdminStatsCommand.execute error:", error);
      return { success: false, error: message };
    }
  }
}
