"use client";

import { useAdBlockDetection } from "../hooks/useAdBlockDetection";

export default function AdBlockGate({ children }: { children: React.ReactNode }) {
  const { status, recheck } = useAdBlockDetection();

  if (status === "allowed" || status === "checking") {
    return <>{children}</>;
  }

  // Ad blocker detected — show full-screen gate
  return (
    <>
      {/* Blurred, non-interactive background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 blur-sm select-none">
        {children}
      </div>

      {/* Gate overlay */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="adblock-title"
        aria-describedby="adblock-desc"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
      >
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1430] p-8 shadow-2xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/15 text-4xl">
            🛡️
          </div>

          {/* Title */}
          <h2
            id="adblock-title"
            className="mb-2 text-xl font-bold text-white"
          >
            광고 차단 확장 프로그램이 감지되었습니다
          </h2>

          {/* Description */}
          <p
            id="adblock-desc"
            className="mb-6 text-sm leading-relaxed text-white/60"
          >
            Magic Seller는 쿠팡 파트너스 광고 수익으로 AI 서비스를 무료로 제공합니다.
            <br />
            광고 차단 프로그램을 해제해 주셔야 서비스를 이용하실 수 있어요.
          </p>

          {/* Steps */}
          <ol className="mb-6 space-y-2 text-left text-sm text-white/70">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff6f0f] text-[11px] font-bold text-white">
                1
              </span>
              브라우저 우측 상단의 광고 차단 아이콘을 클릭하세요
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff6f0f] text-[11px] font-bold text-white">
                2
              </span>
              <span>
                이 사이트(<code className="rounded bg-white/10 px-1 text-orange-300">daangn-auto-post.pages.dev</code>)를
                허용 목록에 추가하세요
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff6f0f] text-[11px] font-bold text-white">
                3
              </span>
              아래 버튼을 눌러 페이지를 새로고침하세요
            </li>
          </ol>

          {/* CTA */}
          <button
            onClick={recheck}
            className="w-full rounded-xl bg-gradient-to-r from-[#ff6f0f] to-[#ff3c7e] py-3 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 active:scale-95"
          >
            광고 차단 해제했어요 →
          </button>

          <p className="mt-4 text-xs text-white/30">
            💛 광고 클릭 없이 보기만 해도 서비스 운영에 큰 도움이 됩니다
          </p>
        </div>
      </div>
    </>
  );
}
