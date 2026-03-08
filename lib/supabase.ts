import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 서버 전용 클라이언트 (Service Role Key 사용)
export function getSupabaseAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        return null;
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export type UserRow = {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    daily_count: number;
    last_used_date: string | null;
    credits: number; // 새로 추가된 토스페이먼츠 결제 충전 크레딧
};

export type HistoryRow = {
    id: string;
    user_email: string;
    item_name: string;
    item_details: string;
    generated_text: string;
    is_favorite: boolean;
    created_at: string;
    platform_versions?: {
        danggeun?: string;
        joonggonara?: string;
        bungae?: string;
        seo_tags?: string[];
    } | null;
    seo_tags?: string[] | null;
};

export type PaymentRow = {
    // Schema A (repo SQL)
    transaction_id?: string;
    // Schema B (observed on production DB)
    id?: string;
    user_id?: string;
    report_id?: string;
    stripe_session_id?: string;
    currency?: string;

    user_email: string;
    amount: string | number;
    credits_added: number;
    status: string;
    created_at: string;
};
