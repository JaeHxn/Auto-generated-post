import type { Metadata } from "next";
import Link from "next/link";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";

export const metadata: Metadata = {
  title: "서비스 소개",
  description: "Magic Seller가 어떤 문제를 해결하는지, 어떤 방식으로 판매글을 생성하는지 설명합니다.",
};

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About"
      title="Magic Seller 서비스 소개"
      description="Magic Seller는 중고 판매글 작성 시간을 줄이고, 플랫폼에 맞는 구조로 판매글을 정리해 주는 AI 도구입니다."
    >
      <InfoSection title="무엇을 하는 서비스인가요?">
        <p>
          Magic Seller는 사용자가 입력한 상품명, 상태 설명, 판매 조건, 사진을 바탕으로 중고 판매글 초안을 작성합니다.
          당근마켓, 중고나라, 번개장터처럼 서로 다른 분위기의 플랫폼에 맞춰 글 구조를 나눠 보여 주는 것이 핵심입니다.
        </p>
        <p>
          단순히 문장을 화려하게 바꾸는 것이 아니라, 구매자가 확인하고 싶어 하는 정보가 빠지지 않도록 정리하는 방향으로 설계했습니다.
        </p>
      </InfoSection>

      <InfoSection title="어떤 원칙으로 결과를 만드나요?">
        <p>서비스는 다음 원칙을 우선합니다.</p>
        <ul className="space-y-2 pl-5">
          <li>허위 스펙, 미확인 구성품, 과장 표현을 임의로 추가하지 않습니다.</li>
          <li>사진이 있으면 이미지에서 실제로 확인되는 정보만 설명하도록 유도합니다.</li>
          <li>플랫폼마다 어울리는 길이와 말투를 반영하되, 핵심 거래 정보는 유지합니다.</li>
          <li>최종 게시 전에 사용자가 반드시 검토할 수 있도록 초안 중심으로 제공합니다.</li>
        </ul>
      </InfoSection>

      <InfoSection title="이 서비스가 특히 도움이 되는 경우">
        <ul className="space-y-2 pl-5">
          <li>상품은 괜찮은데 글을 짧고 밋밋하게 쓰는 경우</li>
          <li>중고나라처럼 상세 설명을 길게 쓰고 싶은데 구조가 잘 안 잡히는 경우</li>
          <li>사진은 올렸지만 어떤 포인트를 본문에 넣어야 할지 모르겠는 경우</li>
          <li>여러 플랫폼에 맞춰 제목과 본문을 각각 다르게 정리하고 싶은 경우</li>
        </ul>
      </InfoSection>

      <InfoSection title="운영 및 문의">
        <p>
          운영 문의, 결제 문의, 환불 문의는 <a href="mailto:luvsoul@kakao.com" className="text-[#ffde00] hover:underline">luvsoul@kakao.com</a> 으로 받고 있습니다.
        </p>
        <p>
          상세한 운영 정책은 <Link href="/terms" className="text-[#ffde00] hover:underline">이용약관</Link>과 <Link href="/privacy" className="text-[#ffde00] hover:underline">개인정보 처리방침</Link>에서 확인할 수 있습니다.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
