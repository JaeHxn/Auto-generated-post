// app/api/inquiry/route.ts: 관리자 문의 접수 엔드포인트
// Edge Runtime 호환 — NextAuth 세션 확인 후 문의 접수

export const runtime = "edge";

import { auth } from "@/auth";
import { createHarness } from "@/app/harness";

const SUBJECT_MAX_LENGTH = 100;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1000;

interface InquiryRequestBody {
  subject: unknown;
  message: unknown;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ success: false, error: "로그인이 필요합니다." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as InquiryRequestBody;
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!subject || subject.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "제목을 입력해주세요." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (subject.length > SUBJECT_MAX_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `제목은 ${SUBJECT_MAX_LENGTH}자 이내로 입력해주세요.` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!message || message.length < MESSAGE_MIN_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `문의 내용은 ${MESSAGE_MIN_LENGTH}자 이상 입력해주세요.` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (message.length > MESSAGE_MAX_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `문의 내용은 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await createHarness().submitInquiry({
      userEmail: session.user.email,
      userName: session.user.name ?? null,
      subject,
      message,
    });

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
