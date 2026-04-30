export const runtime = "edge";

import { getSupabaseAdmin } from "@/lib/supabase";

interface AccessLogPayload {
    path: string;
    userEmail?: string;
}

function extractIp(request: Request): string {
    return (
        request.headers.get("CF-Connecting-IP") ??
        request.headers.get("X-Real-IP") ??
        (request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "unknown")
    );
}

function extractCountry(request: Request): string {
    return request.headers.get("CF-IPCountry") ?? "unknown";
}

export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json() as AccessLogPayload;
        const path = typeof body?.path === "string" ? body.path : "unknown";
        const userEmail = typeof body?.userEmail === "string" ? body.userEmail : null;

        const ip = extractIp(request);
        const country = extractCountry(request);
        const userAgent = request.headers.get("User-Agent") ?? "unknown";

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        await supabase.from("access_logs").insert({
            ip,
            country,
            user_agent: userAgent,
            path,
            user_email: userEmail,
            created_at: new Date().toISOString(),
        });
    } catch {
        // 로깅 실패가 메인 서비스에 영향을 주지 않도록 조용히 처리
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
