// app/api/admin/auth/route.ts: 관리자 로그인 엔드포인트
// Edge Runtime 호환 — Node.js API 사용 금지

export const runtime = "edge";

import { signAdminToken } from "@/lib/adminAuth";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json() as { username?: string; password?: string };
    const { username, password } = body;

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (
      !expectedUsername ||
      !expectedPassword ||
      username !== expectedUsername ||
      password !== expectedPassword
    ) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = await signAdminToken(username);

    const cookieValue = [
      `admin_token=${token}`,
      "HttpOnly",
      "Secure",
      "SameSite=Strict",
      "Path=/",
      `Max-Age=${24 * 60 * 60}`,
    ].join("; ");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieValue,
      },
    });
  } catch (error) {
    console.error("Admin auth error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
