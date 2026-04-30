import type { Metadata } from "next";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";

import Script from "next/script";

const siteUrl = "https://daangn-auto-post.pages.dev";

export const metadata: Metadata = {
  title: "이용약관 | Magic Seller",
  description: "Magic Seller의 서비스 이용 조건, 결제 및 환불 기준, 사용자 책임 범위를 안내합니다.",
  alternates: { canonical: `${siteUrl}/terms` },
};

const lastUpdated = "2026-03-08";

export default function TermsPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "이용약관", item: `${siteUrl}/terms` },
    ],
  };

  return (
    <>
      <Script id="terms-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <InfoPageShell
      eyebrow="Terms"
      title="이용약관"
      description="Magic Seller를 사용할 때 적용되는 기본 이용 조건과 결제, 환불, 책임 범위를 안내합니다."
    >
      <InfoSection title="1. 서비스 성격">
        <p>
          Magic Seller는 사용자가 입력한 정보를 바탕으로 중고 판매글 초안을 생성하는 도구입니다.
          서비스는 결과 초안을 제공할 뿐이며, 실제 거래 성사 여부나 입력 정보의 진실성까지 보증하지 않습니다.
        </p>
      </InfoSection>

      <InfoSection title="2. 사용자 책임">
        <ul className="space-y-2 pl-5">
          <li>최종 게시 전 판매글의 사실 여부를 직접 검토해야 합니다.</li>
          <li>허위 상품 정보, 타인 권리 침해, 불법 거래 게시물 등록은 금지됩니다.</li>
          <li>사진과 본문에 포함된 정보의 법적 책임은 게시한 사용자에게 있습니다.</li>
        </ul>
      </InfoSection>

      <InfoSection title="3. 크레딧 및 결제">
        <p>일부 기능은 유료 크레딧 기반으로 제공될 수 있으며, 결제는 Paddle을 통해 처리됩니다.</p>
        <p>크레딧은 결제 완료 후 계정에 반영되며, 사용된 크레딧은 원칙적으로 복구되지 않습니다.</p>
      </InfoSection>

      <InfoSection title="4. 환불 정책">
        <ul className="space-y-2 pl-5">
          <li>결제 후 7일 이내이고 충전한 크레딧을 전혀 사용하지 않은 경우 전액 환불을 검토할 수 있습니다.</li>
          <li>이미 일부라도 사용한 크레딧은 원칙적으로 환불 대상에서 제외될 수 있습니다.</li>
          <li>서비스 결함으로 정상 사용이 어려운 경우, 사실 확인 후 예외 환불 또는 보상을 검토할 수 있습니다.</li>
        </ul>
      </InfoSection>

      <InfoSection title="5. 서비스 제한 및 종료">
        <p>
          반복적인 악용, 비정상 결제 시도, 타인 권리 침해, 운영 방해가 확인될 경우 서비스 이용이 제한될 수 있습니다.
          유지보수, 정책 변경, 외부 서비스 장애로 인해 일부 기능은 사전 고지 없이 수정될 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="6. 문의">
        <p>결제, 환불, 약관 문의: <a href="mailto:luvsoul@kakao.com" className="text-[#ffde00] hover:underline">luvsoul@kakao.com</a></p>
        <p>최종 업데이트: {lastUpdated}</p>
      </InfoSection>
    </InfoPageShell>
    </>
  );
}
