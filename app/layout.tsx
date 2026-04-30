import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteFooter from "./components/SiteFooter";
import AuthProvider from "./providers";

const siteUrl = "https://daangn-auto-post.pages.dev";
const fontStylesheetHref =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&family=Noto+Sans+KR:wght@400;600;700;900&display=swap";
const criticalCss = `
html,body{margin:0;min-height:100%;background:#120e1f;color:#fff;}
*,*::before,*::after{box-sizing:border-box;}
body{overflow-x:hidden;font-family:"Noto Sans KR","Segoe UI","Apple SD Gothic Neo","Malgun Gothic",sans-serif;}
img,svg,video,canvas{max-width:100%;height:auto;}
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Magic Seller | 10초 만에 끝내는 중고 판매글 AI 자동 작성",
    template: "%s | Magic Seller",
  },
  description:
    "당근마켓·중고나라·번개장터 판매글 쓰기 힘드셨죠? Magic Seller AI가 사진 한 장으로 완성도 높은 판매글을 10초 만에 써드립니다. 말투 학습·다중 플랫폼·SEO 태그까지 자동!",
  keywords: [
    "당근마켓 판매글", "중고나라 글쓰기", "번개장터 판매글",
    "중고거래 AI", "판매글 자동 작성", "중고 판매 팁",
    "AI 글쓰기", "매직셀러", "중고판매", "당근 글쓰기",
    "중고나라 글 잘쓰는 법", "번개장터 꿀팁", "중고거래 문구",
    "판매글 예시", "중고 물건 팔기", "AI 판매글 생성기",
  ],
  applicationName: "Magic Seller",
  category: "productivity",
  creator: "Magic Seller Team",
  alternates: {
    canonical: "/",
    languages: { "ko-KR": "/" },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Magic Seller",
    title: "Magic Seller | 사진 한 장으로 완성하는 중고 판매글 AI",
    description:
      "글쓰기 귀찮을 땐? 매직셀러! AI가 내 말투로 당근·중고나라·번개장터 판매글을 한 번에 작성해 드립니다. 지금 무료로 체험해 보세요.",
    locale: "ko_KR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Magic Seller - 중고거래 AI 판매글 자동 작성",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Seller | 중고거래 필수 AI 도구",
    description:
      "귀찮은 중고 판매글, 사진만 올리세요. AI가 당근·중고나라·번개장터용으로 한 번에 써드립니다.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href={fontStylesheetHref} as="style" />
        <link href={fontStylesheetHref} rel="stylesheet" />
        <meta name="google-adsense-account" content="ca-pub-5354319294441406" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5354319294441406"
          crossOrigin="anonymous"
        ></script>
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "f8137debf60b46a1955102aa3875bd23"}'
        ></script>
        {/* ── Schema.org 구조화 데이터 (WebApplication) ─────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Magic Seller",
              url: "https://daangn-auto-post.pages.dev",
              description:
                "당근마켓·중고나라·번개장터 판매글을 AI가 10초 만에 자동 작성해 주는 서비스. 사진 한 장으로 플랫폼별 맞춤 판매글과 SEO 태그를 생성합니다.",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              inLanguage: "ko-KR",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KRW",
                availability: "https://schema.org/InStock",
              },
              featureList: [
                "당근마켓 판매글 자동 작성",
                "중고나라 판매글 자동 작성",
                "번개장터 판매글 자동 작성",
                "AI 이미지 분석",
                "SEO 태그 자동 생성",
                "사용자 말투 학습",
              ],
              screenshot: "https://daangn-auto-post.pages.dev/og-image.png",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "120",
              },
            }),
          }}
        />
        {/* ── Schema.org FAQPage (검색 결과 FAQ 패널) ──────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Magic Seller는 무료인가요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "비로그인 시 하루 1회, 로그인 시 하루 2회 무료로 사용할 수 있습니다. 추가 사용이 필요하면 크레딧 충전을 통해 계속 이용할 수 있습니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "어떤 플랫폼의 판매글을 만들어주나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "당근마켓, 중고나라, 번개장터 3개 플랫폼에 최적화된 판매글을 한 번에 생성합니다. 각 플랫폼의 문화와 포맷에 맞게 다르게 작성됩니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "사진이 없어도 판매글을 만들 수 있나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "네! 사진 없이 상품명과 설명만 입력해도 판매글을 생성할 수 있습니다. 사진이 있으면 AI가 이미지를 분석해서 더 풍부한 판매글을 작성해 드립니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "내 말투를 반영할 수 있나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "로그인 후 '말투 학습' 기능을 사용하면 내가 평소 쓰는 문체와 말투를 AI가 학습해서 판매글에 반영해줍니다.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-[#120e1f] font-sans antialiased">
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
        {/* Kakao JavaScript SDK */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
