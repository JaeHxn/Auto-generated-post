"use client";

import { useState, useEffect, useRef } from "react";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  userName: string | null;
}

const SUBJECT_MAX_LENGTH = 100;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1000;

export default function InquiryModal({
  isOpen,
  onClose,
  userEmail,
  userName,
}: InquiryModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSubject("");
      setMessage("");
      setSubmitError(null);
      setIsSuccess(false);
      setIsSubmitting(false);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!subject.trim()) {
      setSubmitError("제목을 입력해주세요.");
      return;
    }
    if (subject.trim().length > SUBJECT_MAX_LENGTH) {
      setSubmitError(`제목은 ${SUBJECT_MAX_LENGTH}자 이내로 입력해주세요.`);
      return;
    }
    if (!message.trim() || message.trim().length < MESSAGE_MIN_LENGTH) {
      setSubmitError(`문의 내용은 ${MESSAGE_MIN_LENGTH}자 이상 입력해주세요.`);
      return;
    }
    if (message.trim().length > MESSAGE_MAX_LENGTH) {
      setSubmitError(`문의 내용은 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };

      if (!data.success) {
        setSubmitError(data.error ?? "문의 접수에 실패했습니다.");
        return;
      }

      setIsSuccess(true);
      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, 3000);
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">📬 관리자에게 문의하기</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors rounded-lg p-1 hover:bg-gray-700"
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 바디 */}
        <div className="px-6 py-5">
          {/* 미로그인 안내 */}
          {!userEmail ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-4xl">🔒</span>
              <p className="text-gray-300 text-sm leading-relaxed">
                로그인 후 문의 가능합니다.
                <br />
                Google 계정으로 로그인해주세요.
              </p>
            </div>
          ) : isSuccess ? (
            /* 성공 안내 */
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-white font-medium">문의가 접수되었습니다.</p>
              <p className="text-gray-400 text-sm">빠른 시일 내 답변드리겠습니다.</p>
              <p className="text-gray-500 text-xs mt-1">3초 후 자동으로 닫힙니다.</p>
            </div>
          ) : (
            /* 문의 폼 */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* 발신자 정보 (읽기 전용) */}
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 rounded-lg px-3 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="truncate">
                  {userName ? `${userName} (${userEmail})` : userEmail}
                </span>
              </div>

              {/* 제목 */}
              <div className="flex flex-col gap-1">
                <label htmlFor="inquiry-subject" className="text-sm font-medium text-gray-300">
                  제목 <span className="text-orange-400">*</span>
                </label>
                <input
                  id="inquiry-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={SUBJECT_MAX_LENGTH}
                  placeholder="문의 제목을 입력해주세요"
                  className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  disabled={isSubmitting}
                />
                <span className="text-xs text-gray-500 text-right">
                  {subject.length} / {SUBJECT_MAX_LENGTH}
                </span>
              </div>

              {/* 내용 */}
              <div className="flex flex-col gap-1">
                <label htmlFor="inquiry-message" className="text-sm font-medium text-gray-300">
                  문의 내용 <span className="text-orange-400">*</span>
                </label>
                <textarea
                  id="inquiry-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MESSAGE_MAX_LENGTH}
                  rows={5}
                  placeholder={`문의 내용을 입력해주세요. (최소 ${MESSAGE_MIN_LENGTH}자)`}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                  disabled={isSubmitting}
                />
                <span className="text-xs text-gray-500 text-right">
                  {message.length} / {MESSAGE_MAX_LENGTH}
                </span>
              </div>

              {/* 에러 메시지 */}
              {submitError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    접수 중...
                  </>
                ) : (
                  "문의 보내기"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
