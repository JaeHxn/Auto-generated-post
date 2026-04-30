import type { Metadata } from "next";
import Link from "next/link";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";

import Script from "next/script";

const siteUrl = "https://daangn-auto-post.pages.dev";

export const metadata: Metadata = {
  title: "이용 안내 센터 | Magic Seller",
  description: "Magic Seller의 운영 정보, 결제, 정책, 문의 링크를 한 번에 확인할 수 있는 안내 페이지입니다.",
  alternates: { canonical: `${siteUrl}/legal` },
};

const cards = [
  {
    href: "/about",
    title: "서비스 소개",
    description: "Magic Seller가 무엇을 하는 서비스인지, 어떤 원칙으로 결과를 만드는지 설명합니다.",
  },
  {
    href: "/guide",
    title: "판매글 가이드",
    description: "중고 판매글을 더 신뢰감 있게 쓰는 방법과 체크리스트를 제공합니다.",
  },
  {
    href: "/privacy",
    title: "개인정보 처리방침",
    description: "로그인, 저장소, 결제, 광고 쿠키 처리 방식을 확인할 수 있습니다.",
  },
  {
    href: "/terms",
    title: "이용약관",
    description: "결제, 환불, 사용자 책임, 서비스 제한 기준을 확인할 수 있습니다.",
  },
  {
    href: "/contact",
    title: "문의",
    description: "오류 제보, 결제 문의, 운영 문의를 보낼 수 있는 연락처 안내입니다.",
  },
];

export default function LegalPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "이용 안내 센터", item: `${siteUrl}/legal` },
    ],
  };

  return (
    <>
      <Script id="legal-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <InfoPageShell
      eyebrow="Legal"
      title="이용 안내"
      description="서비스 정보, 정책, 문의 경로를 한 번에 확인할 수 있도록 정리한 안내 페이지입니다."
    >
      <InfoSection title="운영 안내">
        <p>
          Magic Seller는 도구형 서비스이지만, 기능만 제공하는 랜딩 페이지가 아니라 운영 정보와 정책을 함께 공개하는 구조로 운영합니다.
          아래 문서를 통해 서비스 목적, 사용 원칙, 개인정보 처리, 문의 방법을 확인할 수 있습니다.
        </p>
      </InfoSection>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[24px] border border-white/10 bg-black/20 p-6 transition-colors hover:border-[#ff6f0f]/40"
          >
            <h2 className="text-lg font-bold text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">{card.description}</p>
          </Link>
        ))}
      </section>
    </InfoPageShell>
    </>
  );
}
