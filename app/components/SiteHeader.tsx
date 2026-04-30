"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { MessageCircleQuestion, ShieldCheck, Zap, LogIn, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Locale, useDict } from "../i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const USER_DAILY_LIMIT = 2;
const GUEST_DAILY_LIMIT = 2;

interface Props {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  remainingCount: number | null;
  creditsCount: number | null;
  guestCount: number;
  onOpenPayment: () => void;
  onOpenHistory: () => void;
  onOpenInquiry: () => void;
}

export default function SiteHeader({
  locale,
  onLocaleChange,
  remainingCount,
  creditsCount,
  guestCount,
  onOpenPayment,
  onOpenHistory,
  onOpenInquiry,
}: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as Record<string, unknown> | undefined)?.isAdmin === true;
  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";
  const t = useDict(locale);

  const currentLimit = isLoggedIn ? USER_DAILY_LIMIT : GUEST_DAILY_LIMIT;
  const currentRemaining =
    remainingCount !== null
      ? remainingCount
      : isLoggedIn
      ? USER_DAILY_LIMIT
      : Math.max(0, GUEST_DAILY_LIMIT - guestCount);

  // 9999 = 어드민 무제한 마커 → "∞"로 표시
  const UNLIMITED_MARKER = 9999;
  const displayRemaining = currentRemaining >= UNLIMITED_MARKER ? "∞" : String(currentRemaining);
  const displayLimit = currentRemaining >= UNLIMITED_MARKER ? "∞" : String(currentLimit);
  const displayCredits =
    creditsCount !== null && creditsCount >= UNLIMITED_MARKER ? "∞" : creditsCount !== null ? String(creditsCount) : null;

  const freeCountText = t.freeCount
    .replace("{remaining}", displayRemaining)
    .replace("{limit}", displayLimit);

  return (
    <header className="text-center mb-10 relative min-h-[236px]">
      {/* Top bar: language + auth */}
      <div className="flex min-h-10 items-center justify-between mb-6 gap-2 flex-wrap">
        <LanguageSwitcher locale={locale} onChange={onLocaleChange} />

        <div className="flex min-h-9 flex-1 items-center justify-end gap-2 flex-wrap">
          {isLoading ? (
            <div className="w-24 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex items-center justify-end gap-2 bg-white/10 rounded-2xl sm:rounded-full px-2.5 py-1.5 border border-white/20 flex-wrap">
              {session?.user?.image && (
                <NextImage
                  src={session.user.image}
                  alt="profile"
                  width={24}
                  height={24}
                  unoptimized
                  className="w-6 h-6 rounded-full border border-white/30"
                />
              )}
              <span className="text-white/80 text-xs font-semibold hidden sm:block">
                {session?.user?.name?.split(" ")[0]}
              </span>
              <button
                type="button"
                onClick={onOpenPayment}
                className="rounded-full px-2 py-1 text-[#ffde00] font-bold text-xs hover:bg-white/10 transition-colors"
              >
                {t.charge}
              </button>
              <button
                onClick={onOpenHistory}
                className="rounded-full px-2 py-1 text-white/75 hover:text-[#ffde00] hover:bg-white/10 transition-colors text-xs font-semibold"
                title={t.storage}
              >
                {t.storage}
              </button>
              <button
                onClick={onOpenInquiry}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-white/75 hover:text-[#ffde00] hover:bg-white/10 transition-colors text-xs font-semibold"
                title="관리자에게 문의"
              >
                <MessageCircleQuestion size={13} />
                문의
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-orange-400 hover:text-orange-300 hover:bg-white/10 transition-colors text-xs font-semibold"
                  title="관리자 페이지"
                >
                  <ShieldCheck size={13} />
                  관리자
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold"
                title={t.logout}
              >
                <LogOut size={13} />
                {t.logout}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenInquiry}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/85 text-xs sm:text-sm font-bold px-3 py-2 rounded-full transition-all shadow-[0_4px_15px_rgba(0,0,0,0.25)]"
                title="관리자에게 문의"
              >
                <MessageCircleQuestion size={14} />
                문의
              </button>
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-1.5 bg-[#ff6f0f] hover:bg-[#ff812c] border border-[#ffb88c]/40 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-full transition-all hover:scale-105 shadow-[0_4px_15px_rgba(255,111,15,0.3)]"
              >
                <LogIn size={14} />
                {t.loginGoogle}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div
        className="inline-block bg-gradient-to-r from-[#ffb88c] to-[#ff6f0f] text-black text-xs font-black px-4 py-1.5 rounded-full mb-3 tracking-wider shadow-[0_0_15px_rgba(255,111,15,0.4)]"
      >
        {t.proVersion}
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight font-outfit m-0">
        Magic{" "}
        <span className="bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] text-transparent bg-clip-text">
          Seller
        </span>
      </h1>
      <p className="text-[#b3b3b3] text-lg mt-3 min-h-[28px]">{t.tagline}</p>

      {/* Usage badge */}
      <div className="mt-4 flex min-h-8 items-center justify-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${
            currentRemaining === 0 && (creditsCount || 0) === 0 && currentRemaining < UNLIMITED_MARKER
              ? "bg-red-500/20 border-red-500/50 text-red-400"
              : isLoggedIn
              ? "bg-[#00c9ff]/10 border-[#00c9ff]/30 text-[#00c9ff]"
              : "bg-white/10 border-white/20 text-white/70"
          }`}
        >
          <Zap size={14} />
          {isLoggedIn
            ? `${freeCountText}${displayCredits !== null ? ` + 💎${displayCredits}` : ""}`
            : freeCountText}
        </div>
        {!isLoggedIn && (
          <button
            onClick={() => signIn("google")}
            className="text-xs text-[#ffde00] hover:underline font-semibold"
          >
            {t.loginBonus}
          </button>
        )}
      </div>
    </header>
  );
}
