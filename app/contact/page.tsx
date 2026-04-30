import type { Metadata } from "next";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";

import Script from "next/script";

const siteUrl = "https://daangn-auto-post.pages.dev";

export const metadata: Metadata = {
  title: "문의 및 고객센터 | Magic Seller",
  description: "Magic Seller의 운영 문의, 결제 문의, 오류 제보 방법을 안내합니다. 언제든 편하게 연락주세요.",
  keywords: ["매직셀러 고객센터", "결제 문의", "오류 제보", "Magic Seller 문의"],
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Magic Seller 문의",
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "ContactPoint",
      email: "luvsoul@kakao.com",
      contactType: "customer support",
      availableLanguage: "Korean"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "문의", item: `${siteUrl}/contact` },
    ],
  };

  return (
    <>
      <Script id="contact-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      <Script id="contact-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <InfoPageShell
      eyebrow="Contact"
      title="문의 및 운영 연락처"
      description="서비스 사용 중 문제가 있거나 결제, 환불, 계정 관련 문의가 있을 때 사용할 수 있는 공식 연락 경로입니다."
    >
      <InfoSection title="기본 문의 메일">
        <p>
          공식 문의 메일: <a href="mailto:luvsoul@kakao.com" className="text-[#ffde00] hover:underline">luvsoul@kakao.com</a>
        </p>
        <p>아래 정보가 함께 오면 처리가 더 빨라집니다.</p>
        <ul className="space-y-2 pl-5">
          <li>로그인에 사용한 이메일 주소</li>
          <li>문제가 발생한 날짜와 시간</li>
          <li>에러 화면 또는 재현 순서</li>
          <li>결제 문의인 경우 주문 정보 또는 결제 시도 내역</li>
        </ul>
      </InfoSection>

      <InfoSection title="문의 유형별 안내">
        <ul className="space-y-2 pl-5">
          <li>로그인 문제: Google 로그인 실패, 세션 만료, 접근 권한 문제</li>
          <li>AI 작성 문제: 무한 로딩, 사진 반영 실패, 결과 품질 이슈</li>
          <li>결제 문제: 크레딧 미반영, 결제 실패, 환불 요청</li>
          <li>보관함 문제: 저장 실패, 히스토리 누락, 즐겨찾기 오류</li>
        </ul>
      </InfoSection>

      <InfoSection title="운영 원칙">
        <p>서비스 안정성과 계정 보안을 위해 민감한 정보는 메일 본문에 과도하게 포함하지 않는 것을 권장합니다.</p>
        <p>
          개인정보 및 광고 관련 데이터 처리 기준은 개인정보 처리방침에서 확인할 수 있으며, 결제 관련 기준은 이용약관과 환불 정책을 따릅니다.
        </p>
      </InfoSection>
    </InfoPageShell>
    </>
  );
}
