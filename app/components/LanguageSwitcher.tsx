"use client";

import { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";
import { LOCALES, Locale, setStoredLocale } from "../i18n";

interface Props {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export default function LanguageSwitcher({ locale, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleSelect = (code: Locale) => {
    setStoredLocale(code);
    onChange(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative" id="language-switcher">
      <button
        aria-label="언어 선택 / Language"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
      >
        <Globe size={14} className="text-white/70" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.label}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="언어 선택"
          className="absolute right-0 top-full mt-2 z-[200] min-w-[160px] bg-[#1a1030]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden animate-[fadeInDown_0.15s_ease-out]"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === locale}
              onClick={() => handleSelect(l.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
                ${l.code === locale
                  ? "bg-[#ff6f0f]/20 text-[#ff6f0f] font-bold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === locale && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
