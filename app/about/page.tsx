import type { Metadata } from "next";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";

import Script from "next/script";

const siteUrl = "https://daangn-auto-post.pages.dev";

export const metadata: Metadata = {
  title: "서비스 소개 — AI 중고 판매글 작성기 | Magic Seller",
  description: "Magic Seller가 어떤 문제를 해결하는지, 어떤 방식으로 당근마켓, 중고나라, 번개장터 판매글을 생성하는지 설명합니다. AI 비전 기술 기반 중고거래 혁신.",
  keywords: ["매직셀러 소개", "AI 판매글 작성", "당근마켓 자동 글쓰기", "중고나라 AI", "번개장터 글쓰기 프로그램"],
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "서비스 소개 | Magic Seller",
    description: "사진 한 장으로 중고거래 판매글을 마법처럼 완성하는 Magic Seller의 미션과 기술을 소개합니다.",
    url: `${siteUrl}/about`,
    siteName: "Magic Seller",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "ko_KR",
    type: "website",
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Magic Seller 서비스 소개",
    description: "Magic Seller의 미션, AI 비전 기술, 그리고 향후 로드맵에 대한 소개입니다.",
    url: `${siteUrl}/about`,
    publisher: {
      "@type": "Organization",
      name: "Magic Seller",
      url: siteUrl
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "서비스 소개", item: `${siteUrl}/about` },
    ],
  };

  return (
    <>
      <Script id="about-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <Script id="about-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <InfoPageShell
      eyebrow="Mission & Vision"
      title="Magic Seller: 중고 거래의 가치를 재정의하다"
      description="우리는 누구나 쉽고 정직하게 자신의 물건을 판매할 수 있는 세상을 꿈꿉니다. 최고의 AI 기술로 중고 거래의 첫 단추인 '판매글 작성'을 마법처럼 바꿔드립니다."
    >
      <InfoSection title="1. 프로젝트의 시작: 왜 Magic Seller인가요?">
        <p>
          중고 거래 시장은 매년 폭발적으로 성장하고 있지만, 개인이 물건을 등록하는 과정은 여전히 10년 전과 다름없습니다.
          제품 사진을 찍고, 사양을 검색하고, 어색하지 않은 말투를 고민하며 키보드를 두드리는 일은 누구에게나 번거로운 작업입니다.
          이러한 불편함 때문에 많은 좋은 물건들이 집 안 구석에 방치되곤 합니다.
        </p>
        <p>
          Magic Seller는 이 &lsquo;등록의 허들&rsquo;을 AI 기술로 낮추기 위해 시작되었습니다.
          단순한 자동 완성을 넘어, 판매자가 진심으로 자신의 물건을 소개하고 구매자가 필요한 정보를 한눈에 파악할 수 있는
          가장 효율적인 인터페이스를 연구합니다.
        </p>
      </InfoSection>

      <InfoSection title="2. 기술적 정수: Vision AI와 LLM의 결합">
        <p>
          매직셀러의 핵심 기술은 OpenAI의 최신 모델인 GPT-4o Vision을 기반으로 합니다.
          단순히 이미지가 &lsquo;무엇인지&rsquo; 파악하는 단계를 넘어, 이미지 속 제품의 상태, 흠집의 유무, 브랜드 로고의 위치, 구성품의 개수까지 정밀하게 스캔합니다.
        </p>
        <p>
          이렇게 추출된 시각 데이터는 사용자가 입력한 텍스트 데이터와 결합되어 거대 언어 모델(LLM)에 의해 정제됩니다.
          이 과정에서 &lsquo;당근마켓의 친근함&rsquo;, &lsquo;중고나라의 상세함&rsquo;, &lsquo;번개장터의 트렌디함&rsquo;이라는 세 가지 페르소나를 각각 적용하여,
          하나의 데이터로 세 개의 플랫폼에 최적화된 결과물을 동시에 뽑아내는 멀티-에이전트 시스템을 구축했습니다.
        </p>
      </InfoSection>

      <InfoSection title="3. 우리가 지키는 3가지 철학">
        <div className="mt-4 space-y-6">
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
            <h4 className="text-[#ffde00] font-bold mb-2">사실 기반의 정직함 (Data-Driven Honesty)</h4>
            <p className="text-sm leading-relaxed">
              AI가 존재하지 않는 정보를 꾸며내는 &lsquo;환각(Hallucination)&rsquo; 현상을 억제하기 위해,
              보이는 사실과 입력된 사실만을 기반으로 글을 작성하도록 엄격한 프롬프트 엔지니어링을 적용하고 있습니다.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
            <h4 className="text-[#ffde00] font-bold mb-2">사용자 중심의 편의성 (User-Centric Simplicity)</h4>
            <p className="text-sm leading-relaxed">
              복잡한 설정 없이 사진 한 장과 몇 단어만으로도 전문가 수준의 판매글을 얻을 수 있도록
              UX 시나리오를 설계했습니다. 기술은 복잡해도 사용법은 마법처럼 단순해야 합니다.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
            <h4 className="text-[#ffde00] font-bold mb-2">지속 가능한 운영 (Sustainable Growth)</h4>
            <p className="text-sm leading-relaxed">
              수익 모델(AdSense 및 유료 충전)을 투명하게 운영하여 안정적인 서버 인프라를 유지하고,
              창출된 수익은 다시 AI 모델의 고도화와 무료 사용 혜택 확대에 사용됩니다.
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="4. 향후 로드맵: Magic Seller의 내일">
        <p>
          현재의 판매글 생성을 넘어, 향후에는 각 플랫폼의 &lsquo;실시간 시세 데이터&rsquo;를 연동하여 적정 판매 가격을 제안하고,
          구매자와의 채팅 단계에서 사용할 수 있는 &lsquo;매너 답변 가이드 AI&rsquo;까지 확장할 계획입니다.
          Magic Seller는 당신의 중고 거래가 즐겁고 가치 있는 경험이 될 때까지 멈추지 않을 것입니다.
        </p>
      </InfoSection>

      <InfoSection title="운영 및 연락처">
        <p>
          서비스 운영자에게 전하고 싶은 의견이나 비즈니스 제안은 아래 메일로 보내주세요.
          보내주시는 모든 응원과 비판은 사이트 발전의 밑거름이 됩니다.
        </p>
        <p className="mt-4 font-bold text-lg text-[#ffde00]">Email: <a href="mailto:luvsoul@kakao.com" className="hover:underline">luvsoul@kakao.com</a></p>
      </InfoSection>
    </InfoPageShell>
    </>
  );
}
