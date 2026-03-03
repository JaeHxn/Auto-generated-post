import type { Metadata } from "next";
import { Outfit, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

export const runtime = 'edge';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "600", "800"],
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Magic Seller - 당근마켓 프리미엄 판매글 자동 생성",
  description: "당신의 중고물품, 명품처럼 포장해 드립니다 🥕",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5354319294441406"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${outfit.variable} ${notoSansKR.variable} font-sans`}>
        {/* 앰비언트 백그라운드 애니메이션 */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full blur-[100px] opacity-50 bg-[#ff6f0f] w-[500px] h-[500px] -top-[150px] -left-[150px] animate-[drift_20s_infinite_alternate_cubic-bezier(0.4,0,0.2,1)]" />
          <div className="absolute rounded-full blur-[100px] opacity-50 bg-[#8c52ff] w-[600px] h-[600px] -bottom-[200px] -right-[200px] animate-[drift_20s_infinite_alternate_cubic-bezier(0.4,0,0.2,1)] delay-[-5s]" />
          <div className="absolute rounded-full blur-[100px] opacity-30 bg-[#ff007b] w-[400px] h-[400px] top-[30%] left-[40%] animate-[drift_25s_infinite_alternate_cubic-bezier(0.4,0,0.2,1)]" />
        </div>
        {children}
      </body>
    </html>
  );
}
