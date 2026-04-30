"use client";

// app/page.tsx에서 useEffect로 logAccess를 호출하세요:
// import { logAccess } from "@/lib/accessLog";
// useEffect(() => { logAccess(window.location.pathname, session?.user?.email); }, []);

export async function logAccess(path: string, userEmail?: string): Promise<void> {
    try {
        await fetch("/api/log-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, userEmail }),
            keepalive: true,
        });
    } catch {
        // 접속 로그 실패가 사용자 경험에 영향을 주지 않도록 조용히 처리
    }
}
