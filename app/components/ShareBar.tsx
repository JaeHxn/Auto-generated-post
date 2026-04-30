"use client";
// ShareBar.tsx: 바이럴 URL 공유 컴포넌트
// 역할: 카카오톡(SDK)·X·페이스북·링크복사·Web Share API로 마케팅 공유 지원

import { useState, useCallback, useEffect } from "react";

const SITE_URL = "https://daangn-auto-post.pages.dev";
const SHARE_TEXT = "당근·중고나라·번개장터 판매글, AI가 10초에 써줌 😮 사진만 올리면 완성! 무료로 써봐";
const SHARE_HASHTAGS = "매직셀러,중고거래,당근마켓,AI글쓰기,중고판매팁";
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY ?? "";

function buildUtmUrl(medium: string, campaign = "viral_share") {
  const params = new URLSearchParams({
    utm_source: medium,
    utm_medium: "social",
    utm_campaign: campaign,
  });
  return `${SITE_URL}?${params.toString()}`;
}

// Kakao SDK 전역 타입 선언
type KakaoSDK = {
  init: (appKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (settings: {
      objectType: string;
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: { mobileWebUrl: string; webUrl: string };
      };
      buttons?: Array<{ title: string; link: { mobileWebUrl: string; webUrl: string } }>;
    }) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

// ─── 아이콘 SVG ──────────────────────────────────────────────
const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M12 3C6.477 3 2 6.477 2 10.857c0 2.742 1.523 5.158 3.826 6.657L4.8 21l4.412-2.345A11.6 11.6 0 0 0 12 18.714c5.523 0 10-3.477 10-7.857S17.523 3 12 3Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const NativeShareIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// ─── 공유 버튼 정의 ──────────────────────────────────────────
interface ShareButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  copied?: boolean;
}

function ShareButton({ label, icon, onClick, className = "", copied }: ShareButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${className}`}
    >
      {icon}
      <span className="hidden sm:inline">{copied ? "복사됨 ✓" : label}</span>
    </button>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────
interface ShareBarProps {
  /** 공유할 텍스트 (없으면 기본 마케팅 문구 사용) */
  customText?: string;
  /** 공유할 URL (없으면 SITE_URL 사용) */
  customUrl?: string;
  /** 컴팩트 모드 (결과 카드 안에 삽입할 때) */
  compact?: boolean;
}

export default function ShareBar({ customText, customUrl, compact = false }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  const shareText = customText ?? SHARE_TEXT;

  // ── Kakao SDK 초기화 ──────────────────────────────────────
  useEffect(() => {
    const tryInit = () => {
      if (typeof window !== "undefined" && window.Kakao) {
        if (!window.Kakao.isInitialized() && KAKAO_APP_KEY) {
          window.Kakao.init(KAKAO_APP_KEY);
        }
        setKakaoReady(true);
      }
    };
    tryInit();
    // SDK 스크립트가 늦게 로드될 경우 재시도
    const timer = setTimeout(tryInit, 1000);
    return () => clearTimeout(timer);
  }, []);

  // ── 카카오톡 공유 (Kakao SDK) ─────────────────────────────
  const shareKakao = useCallback(() => {
    const url = buildUtmUrl("kakaotalk");
    if (kakaoReady && typeof window !== "undefined" && window.Kakao?.Share) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "Magic Seller",
          description: shareText,
          imageUrl: OG_IMAGE_URL,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          {
            title: "무료로 써보기",
            link: { mobileWebUrl: url, webUrl: url },
          },
        ],
      });
      return;
    }
    // Kakao SDK 미로드 시 Web Share API → 클립보드 복사 fallback
    const fallback = async () => {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: "Magic Seller", text: shareText, url });
          return;
        } catch {
          return;
        }
      }
      try {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
      } catch {
        const el = document.createElement("input");
        el.value = `${shareText}\n${url}`;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    };
    fallback();
  }, [shareText, kakaoReady]);

  // ── X (Twitter) ───────────────────────────────────────────
  const shareX = useCallback(() => {
    const url = buildUtmUrl("twitter");
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(SHARE_HASHTAGS)}`;
    window.open(twitterUrl, "_blank", "width=600,height=500");
  }, [shareText]);

  // ── 페이스북 ──────────────────────────────────────────────
  const shareFacebook = useCallback(() => {
    const url = buildUtmUrl("facebook");
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, "_blank", "width=600,height=500");
  }, [shareText]);

  // ── 링크 복사 (UTM 없이 깔끔한 URL) ──────────────────────
  const copyLink = useCallback(async () => {
    const url = customUrl ?? SITE_URL;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [customUrl]);

  // ── 네이티브 공유 (모바일) ────────────────────────────────
  const shareNative = useCallback(async () => {
    const url = buildUtmUrl("native_share");
    if (navigator.share) {
      await navigator.share({ title: "Magic Seller", text: shareText, url });
    } else {
      await copyLink();
    }
  }, [shareText, copyLink]);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/5 p-3 backdrop-blur-sm">
        <span className="text-xs font-semibold text-white/50 mr-1">공유</span>
        <button onClick={shareKakao} title="카카오톡 공유" aria-label="카카오톡 공유"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFE812] text-[#3A1D1D] transition hover:scale-110 active:scale-95">
          <KakaoIcon />
        </button>
        <button onClick={shareX} title="X(Twitter) 공유" aria-label="X 공유"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white border border-white/20 transition hover:scale-110 active:scale-95">
          <XIcon />
        </button>
        <button onClick={shareFacebook} title="페이스북 공유" aria-label="페이스북 공유"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1877F2] text-white transition hover:scale-110 active:scale-95">
          <FacebookIcon />
        </button>
        <button onClick={copyLink} title="링크 복사" aria-label="링크 복사"
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition hover:scale-110 active:scale-95 ${
            copied ? "border-green-400 bg-green-400/20 text-green-400" : "border-white/20 bg-white/10 text-white"
          }`}>
          <LinkIcon />
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button onClick={shareNative} title="더 보기" aria-label="더 보기 공유"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white border border-white/20 transition hover:scale-110 active:scale-95">
            <NativeShareIcon />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ffb88c]">
        친구에게 공유하기
      </p>
      <p className="mb-4 text-sm text-white/60">
        알면 손해인 꿀팁 — 주변에 퍼뜨려서 같이 써보세요 🔥
      </p>
      <div className="flex flex-wrap gap-2">
        <ShareButton
          label="카카오톡"
          icon={<KakaoIcon />}
          onClick={shareKakao}
          className="bg-[#FFE812] text-[#3A1D1D] hover:bg-[#ffd900]"
        />
        <ShareButton
          label="X(트위터)"
          icon={<XIcon />}
          onClick={shareX}
          className="border border-white/20 bg-black/40 text-white hover:bg-white/10"
        />
        <ShareButton
          label="페이스북"
          icon={<FacebookIcon />}
          onClick={shareFacebook}
          className="bg-[#1877F2] text-white hover:bg-[#1565d8]"
        />
        <ShareButton
          label="링크 복사"
          icon={<LinkIcon />}
          onClick={copyLink}
          copied={copied}
          className={`border transition-colors ${
            copied
              ? "border-green-400 bg-green-400/20 text-green-400"
              : "border-white/20 bg-white/10 text-white hover:bg-white/20"
          }`}
        />
        <ShareButton
          label="더 보기"
          icon={<NativeShareIcon />}
          onClick={shareNative}
          className="border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
        />
      </div>
    </div>
  );
}
