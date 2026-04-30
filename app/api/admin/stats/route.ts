// app/api/admin/stats/route.ts: 관리자 통계 조회 엔드포인트
// Edge Runtime 호환 — 토큰 검증 후 통계 데이터 반환

export const runtime = "edge";

import { verifyAdminToken } from "@/lib/adminAuth";
import { createHarness } from "@/app/harness";

export async function GET(req: Request): Promise<Response> {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const token = parseCookie(cookieHeader, "admin_token");

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await createHarness().adminStats();

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : null;
}
