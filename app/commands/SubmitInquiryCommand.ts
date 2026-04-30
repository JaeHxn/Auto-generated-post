// SubmitInquiryCommand.ts: 관리자 문의 접수 커맨드
// 역할: 입력 검증 → Supabase inquiries 테이블에 insert → 결과 반환

import { getSupabaseAdmin } from "@/lib/supabase";
import { InquiryInput, InquiryResult } from "../types/inquiry";

const SUBJECT_MAX_LENGTH = 100;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1000;

export class SubmitInquiryCommand {
  async execute(input: InquiryInput): Promise<InquiryResult> {
    const { userEmail, userName, subject, message } = input;

    if (!subject || subject.trim().length === 0) {
      return { success: false, error: "제목을 입력해주세요." };
    }
    if (subject.trim().length > SUBJECT_MAX_LENGTH) {
      return { success: false, error: `제목은 ${SUBJECT_MAX_LENGTH}자 이내로 입력해주세요.` };
    }
    if (!message || message.trim().length < MESSAGE_MIN_LENGTH) {
      return { success: false, error: `문의 내용은 ${MESSAGE_MIN_LENGTH}자 이상 입력해주세요.` };
    }
    if (message.trim().length > MESSAGE_MAX_LENGTH) {
      return { success: false, error: `문의 내용은 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.` };
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return { success: false, error: "서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요." };
    }

    const { error: insertError } = await supabase.from("inquiries").insert({
      user_email: userEmail,
      user_name: userName ?? null,
      subject: subject.trim(),
      message: message.trim(),
      status: "pending",
    });

    if (insertError) {
      return { success: false, error: "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
    }

    return { success: true };
  }
}
