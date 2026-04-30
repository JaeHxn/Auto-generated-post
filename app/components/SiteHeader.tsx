"use client";

import NextImage from "next/image";
import { Zap, LogIn, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Locale, useDict } from "../i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const USER_DAILY_LIMIT = 2;
const GUEST_DAILY_LIMIT = 1;

interface Props {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  remainingCount: number | null;
  creditsCount: number | null;
  guestCount: number;
  onOpenPayment: () => void;
  onOpenHistory: () => void;
}

export default function SiteHeader({
  locale,
  onLocaleChange,
  remainingCount,
  creditsCount,
  guestCount,
  onOpenPayment,
  onOpenHistory,
}: Props) {
  const { data: session, status } = useSession();
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

  const freeCountText = t.freeCount
    .replace("{remaining}", String(currentRemaining))
    .replace("{limit}", String(currentLimit));

  return (
    <header className="text-center mb-10 relative">
      {/* Top bar: language + auth */}
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <LanguageSwitcher locale={locale} onChange={onLocaleChange} />

        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoading ? (
            <div className="w-24 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/20">
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
                className="text-[#ffde00] font-bold text-xs ml-1 hover:underline bg-transparent border-0 p-0"
              >
                {t.charge}
              </button>
              <button
                onClick={onOpenHistory}
                className="text-white/70 hover:text-[#ffde00] transition-colors ml-1 text-xs"
                title={t.storage}
              >
                {t.storage}
              </button>
              <button
                onClick={() => signOut()}
                className="text-white/40 hover:text-white transition-colors ml-1"
                title={t.logout}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-full transition-all hover:scale-105 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
            >
              <LogIn size={13} />
              {t.loginGoogle}
            </button>
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
      <p className="text-[#b3b3b3] text-lg mt-3">{t.tagline}</p>

      {/* Usage badge */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${
            currentRemaining === 0 && (creditsCount || 0) === 0
              ? "bg-red-500/20 border-red-500/50 text-red-400"
              : isLoggedIn
              ? "bg-[#00c9ff]/10 border-[#00c9ff]/30 text-[#00c9ff]"
              : "bg-white/10 border-white/20 text-white/70"
          }`}
        >
          <Zap size={14} />
          {isLoggedIn
            ? `${freeCountText}${creditsCount !== null ? ` + 💎${creditsCount}` : ""}`
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
