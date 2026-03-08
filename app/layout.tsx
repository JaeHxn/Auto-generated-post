import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "./components/SiteFooter";
import AuthProvider from "./providers";

const siteUrl = "https://daangn-auto-post.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Magic Seller | 중고 판매글 AI 자동 작성",
    template: "%s | Magic Seller",
  },
  description:
    "Magic Seller는 당근마켓, 중고나라, 번개장터용 판매글을 AI로 정리해 주는 웹 서비스입니다. 서비스 소개, 가이드, 개인정보 처리방침, 이용약관, 문의 페이지를 함께 제공합니다.",
  applicationName: "Magic Seller",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Magic Seller",
    title: "Magic Seller | 중고 판매글 AI 자동 작성",
    description:
      "중고 판매글 자동 작성 도구와 서비스 안내, 가이드, 정책 페이지를 함께 제공하는 Magic Seller 공식 사이트입니다.",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Seller | 중고 판매글 AI 자동 작성",
    description:
      "당근마켓, 중고나라, 번개장터용 판매글을 AI로 정리하고 서비스 정책과 운영 정보를 함께 제공하는 공식 사이트입니다.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5354319294441406" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5354319294441406"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-screen font-sans">
        <AuthProvider>
          <div className="fixed left-0 top-0 -z-10 h-full w-full overflow-hidden pointer-events-none">
            <div className="absolute -left-[150px] -top-[150px] h-[500px] w-[500px] animate-[drift_20s_infinite_alternate_cubic-bezier(0.4,0,0.2,1)] rounded-full bg-[#ff6f0f] opacity-50 blur-[100px]" />
            <div className="absolute -bottom-[200px] -right-[200px] h-[600px] w-[600px] animate-[drift_20s_infinite_alternate_cubic-bezier(0.4,0,0.2,1)] rounded-full bg-[#8c52ff] opacity-50 blur-[100px] delay-[-5s]" />
            <div className="absolute left-[40%] top-[30%] h-[400px] w-[400px] animate-[drift_25s_infinite_alternate_cubic-bezier(0.4,0,0.2,1)] rounded-full bg-[#ff007b] opacity-30 blur-[100px]" />
          </div>
          <div className="relative z-0 flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
