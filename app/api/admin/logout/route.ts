// app/api/admin/logout/route.ts: 관리자 로그아웃 엔드포인트
// Edge Runtime 호환 — admin_token 쿠키 만료 처리

export const runtime = "edge";

export async function POST(): Promise<Response> {
  const cookieValue = [
    "admin_token=",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=0",
  ].join("; ");

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookieValue,
    },
  });
}
