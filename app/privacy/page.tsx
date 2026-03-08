import type { Metadata } from "next";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "Magic Seller의 개인정보 수집 항목, 이용 목적, 광고 및 쿠키 사용 안내를 설명합니다.",
};

const lastUpdated = "2026-03-08";

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy"
      title="개인정보 처리방침"
      description="Magic Seller는 서비스 제공과 계정 관리, 결제 처리, 광고 운영에 필요한 범위에서만 정보를 다룹니다."
    >
      <InfoSection title="1. 수집하는 정보">
        <ul className="space-y-2 pl-5">
          <li>Google 로그인 시 전달되는 기본 프로필 정보: 이름, 이메일 주소, 프로필 이미지</li>
          <li>서비스 이용 정보: 판매글 생성 이력, 저장한 결과, 즐겨찾기 여부</li>
          <li>결제 관련 정보: Paddle 결제 처리 결과, 크레딧 충전 이력, 주문 식별 정보</li>
          <li>기술 정보: 로그, 브라우저 정보, 쿠키 또는 유사 식별자</li>
        </ul>
      </InfoSection>

      <InfoSection title="2. 이용 목적">
        <ul className="space-y-2 pl-5">
          <li>회원 식별 및 로그인 유지</li>
          <li>판매글 생성 결과 제공 및 보관함 기능 운영</li>
          <li>크레딧 차감 및 충전 이력 관리</li>
          <li>오류 대응, 보안 점검, 서비스 개선</li>
          <li>Google AdSense 등 광고 서비스 운영 시 광고 표시와 성과 측정</li>
        </ul>
      </InfoSection>

      <InfoSection title="3. Google 광고 쿠키 및 제3자 광고 안내">
        <p>
          Google을 포함한 제3자 광고 사업자는 사용자의 이전 방문 기록을 바탕으로 광고를 제공하기 위해 쿠키를 사용할 수 있습니다.
          Google의 광고 쿠키를 통해 Google과 그 파트너는 사용자의 이 사이트 방문 또는 인터넷상의 다른 사이트 방문 이력을 기준으로 광고를 제공할 수 있습니다.
        </p>
        <p>
          사용자는 <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" className="text-[#ffde00] hover:underline">Google 광고 설정</a>에서
          맞춤 광고를 관리할 수 있습니다. 또는 <a href="https://www.aboutads.info/" target="_blank" rel="noreferrer" className="text-[#ffde00] hover:underline">aboutads.info</a>를 통해
          일부 제3자 맞춤 광고를 거부할 수 있습니다.
        </p>
        <p>
          Google이 파트너 사이트나 앱에서 데이터를 사용하는 방식은 <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer" className="text-[#ffde00] hover:underline">Google 파트너 사이트에서의 데이터 사용 안내</a>에서 확인할 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="4. 정보 보관 기간">
        <p>계정 정보와 서비스 기록은 서비스 운영 및 법적 의무 이행에 필요한 범위에서 보관합니다.</p>
        <p>회원 탈퇴 또는 삭제 요청이 있는 경우, 관련 법령상 보관 의무가 없는 정보는 합리적인 기간 내에 삭제합니다.</p>
      </InfoSection>

      <InfoSection title="5. 제3자 제공 및 처리 위탁">
        <ul className="space-y-2 pl-5">
          <li>Google: 로그인 및 광고 서비스</li>
          <li>Supabase: 인증 및 데이터 저장</li>
          <li>Paddle: 결제 처리</li>
          <li>Cloudflare Pages: 사이트 호스팅 및 전송</li>
        </ul>
      </InfoSection>

      <InfoSection title="6. 문의">
        <p>개인정보 관련 문의: <a href="mailto:luvsoul@kakao.com" className="text-[#ffde00] hover:underline">luvsoul@kakao.com</a></p>
        <p>최종 업데이트: {lastUpdated}</p>
      </InfoSection>
    </InfoPageShell>
  );
}
