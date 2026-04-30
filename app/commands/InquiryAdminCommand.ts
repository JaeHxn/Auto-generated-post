// InquiryAdminCommand.ts: 관리자 문의 목록 조회 + 답변 처리 커맨드
// 역할: Supabase inquiries 테이블 CRUD — 제1조 하네스 아키텍처 준수

import { getSupabaseAdmin } from "@/lib/supabase";
import {
  InquiryRow,
  InquiryListResult,
  InquiryResult,
  ReplyInquiryInput,
} from "../types/inquiry";

export class InquiryAdminCommand {
  /** 전체 문의 목록 조회 (최신순) */
  async list(): Promise<InquiryListResult> {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return { success: false, error: "서비스 연결에 실패했습니다." };
    }

    const { data, error } = await supabase
      .from("inquiries")
      .select("id, user_email, user_name, subject, message, status, admin_reply, replied_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as InquiryRow[] };
  }

  /** 관리자 답변 저장 + status → replied */
  async reply(input: ReplyInquiryInput): Promise<InquiryResult> {
    const { id, adminReply } = input;

    if (!adminReply || adminReply.trim().length === 0) {
      return { success: false, error: "답변 내용을 입력해주세요." };
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return { success: false, error: "서비스 연결에 실패했습니다." };
    }

    const { error } = await supabase
      .from("inquiries")
      .update({
        admin_reply: adminReply.trim(),
        replied_at: new Date().toISOString(),
        status: "replied",
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
