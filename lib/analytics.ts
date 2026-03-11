"use client";

import { createClient } from "@supabase/supabase-js";

// 클라이언트 사이드 익명 추적용 (인증 정보 없이 사용 가능하도록 설정 확인 필요)
// 실제 운영 환경에서는 별도의 로그 테이블(event_logs)이 필요합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type TrackingEvent =
    | "generate_click"
    | "copy_click"
    | "share_click"
    | "roulette_spin"
    | "payment_modal_open";

export async function trackEvent(eventName: TrackingEvent, metadata: Record<string, any> = {}) {
    try {
        // UTM 파라미터나 레퍼러 정보 자동 추가
        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get("utm_source") || "direct";
        const utm_medium = urlParams.get("utm_medium") || "none";

        // Supabase의 event_logs 테이블에 기록 (없을 경우 에러가 나겠지만 마케팅 분석용 틀 마련)
        // 보안상 RLS가 인서트만 허용하도록 설정되어야 합니다.
        const { error } = await supabase.from("event_logs").insert({
            event_name: eventName,
            utm_source,
            utm_medium,
            metadata,
            user_agent: navigator.userAgent,
            path: window.location.pathname,
            created_at: new Date().toISOString()
        });

        if (error) console.warn("Analytics error:", error.message);
    } catch (err) {
        console.error("Failed to track event:", err);
    }
}
