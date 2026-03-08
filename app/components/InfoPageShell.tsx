import Link from "next/link";
import type { ReactNode } from "react";

type InfoPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function InfoPageShell({
  eyebrow,
  title,
  description,
  children,
}: InfoPageShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
        <Link href="/" className="rounded-full border border-white/15 px-3 py-1.5 hover:border-[#ff6f0f]/50 hover:text-white">
          홈으로
        </Link>
        <span>·</span>
        <span>{eyebrow}</span>
      </div>

      <header className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-[20px]">
        <div className="mb-4 inline-flex rounded-full border border-[#ff6f0f]/30 bg-[#ff6f0f]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#ffb88c]">
          {eyebrow}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">{description}</p>
      </header>

      <div className="grid gap-6">{children}</div>
    </main>
  );
}

type InfoSectionProps = {
  title: string;
  children: ReactNode;
};

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-black/20 p-6 backdrop-blur-[16px] sm:p-8">
      <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-white/75 sm:text-base">{children}</div>
    </section>
  );
}
