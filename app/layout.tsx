import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "./components/SiteFooter";
import AuthProvider from "./providers";

const siteUrl = "https://daangn-auto-post.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Magic Seller | 10초 만에 끝내는 중고 판매글 AI 자동 작성",
    template: "%s | Magic Seller",
  },
  description:
    "당근마켓, 중고나라, 번개장터 판매글 쓰기 힘드셨죠? Magic Seller AI가 사진 한 장으로 명품 같은 판매글을 10초 만에 써드립니다. 말투 학습부터 다중 플랫폼 대응까지!",
  keywords: ["당근마켓", "중고나라", "번개장터", "중고거래", "AI 글쓰기", "매직셀러", "중고판매팁"],
  applicationName: "Magic Seller",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Magic Seller",
    title: "Magic Seller | 사진 한 장으로 완성하는 중고 판매글 AI",
    description:
      "글쓰기 귀찮을 땐? 매직셀러! AI가 내 말투로 당근, 중고나라, 번개장터 판매글을 한 번에 작성해 드립니다. 지금 무료로 체험해 보세요.",
    locale: "ko_KR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Magic Seller - AI Second-hand Listing Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Seller | 중고거래 필수 AI 도구",
    description:
      "귀찮은 중고 판매글, 사진만 찍으세요. AI가 완벽하게 대신 써줍니다.",
    images: ["/og-image.png"],
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
