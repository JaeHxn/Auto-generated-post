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
          **광고 쿠키의 사용**: Google은 본 서비스를 방문하거나 광고를 클릭할 때 사용자의 브라우저에 쿠키를 설정합니다. 이 정보는 개인을 식별하지 않는 비개별적인 통합 정보로 활용됩니다.
        </p>
        <p>
          사용자는 <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" className="text-[#ffde00] hover:underline">Google 광고 설정</a>에서
          맞춤 광고를 관리하거나 비활성화할 수 있습니다. 또는 <a href="https://www.aboutads.info/" target="_blank" rel="noreferrer" className="text-[#ffde00] hover:underline">aboutads.info</a>를 통해
          제3자 사업자의 맞춤 광고용 쿠키 사용을 선택 해제할 수 있습니다.
        </p>
        <p>
          본 서비스는 Google AdSense를 이용하며, 광고 노출 시 사용자의 IP 주소, 브라우저 환경 설정, 방문 시각 등의 기술 정보가 Google에 전송될 수 있음을 명시합니다.
          Google이 파트너 사이트나 앱에서 데이터를 사용하는 방식은 <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer" className="text-[#ffde00] hover:underline">Google 파트너 사이트에서의 데이터 사용 안내</a>에서 확인할 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="4. 정보 보관 기간 및 파기 절차">
        <p>계정 정보와 서비스 기록은 서비스 운영 및 법적 의무 이행에 필요한 범위에서 보관합니다.</p>
        <ul className="space-y-2 pl-5 mt-2">
          <li>**계정 정보**: 서비스 탈퇴 시까지 보관 (단, 결제 정보는 전자상거래법에 따라 5년간 보관)</li>
          <li>**생성 데이터(이력)**: 사용자 삭제 시 또는 서비스 종료 시까지 보관</li>
          <li>**기술 로그**: 수집 후 최대 1년 보관 후 파기</li>
        </ul>
        <p className="mt-4">회원 탈퇴 또는 삭제 요청이 있는 경우, 재생 불가능한 기술적 방법으로 즉시 파기합니다.</p>
      </InfoSection>

      <InfoSection title="5. 제3자 제공 및 개인정보 처리 위탁">
        <p>Magic Seller는 서비스의 안정적 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다. 위탁받는 업체는 개인정보가 안전하게 보호될 수 있도록 관리 및 감독을 받습니다.</p>
        <ul className="space-y-2 pl-5 mt-3 text-sm">
          <li>**Google LLC**: 서비스 인증 보조 및 광고 서비스 운영</li>
          <li>**Supabase (PostgreSQL)**: 데이터베이스 인프라 제공 및 안정적인 데이터 보관</li>
          <li>**Paddle.com**: 결제 대행, 세금 처리 및 결제 정보 관리 (Merchant of Record)</li>
          <li>**Cloudflare, Inc.**: 콘텐츠 전송 네트워크(CDN) 및 사이트 보안(DDoS 방어)</li>
        </ul>
      </InfoSection>

      <InfoSection title="6. 이용자의 권리와 행사 방법">
        <p>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 계정 삭제 및 데이터 파기를 요청할 권리가 있습니다. 관련 요청은 운영자 이메일을 통해 접수해 주시면 지체 없이 처리하겠습니다.</p>
      </InfoSection>

      <InfoSection title="7. 개인정보 보호책임자 및 문의">
        <p>본 서비스의 개인정보 보호 관련 침해 신고나 상담이 필요한 경우 아래 연락처로 문의해 주시기 바랍니다.</p>
        <p className="mt-4 font-bold text-[#ffde00]">개인정보 관리 책임자: Magic Seller 운영팀 (<a href="mailto:luvsoul@kakao.com" className="hover:underline">luvsoul@kakao.com</a>)</p>
        <p className="mt-2 text-xs text-white/50">최종 업데이트: {lastUpdated} (공고일: 2026-03-08)</p>
      </InfoSection>
    </InfoPageShell>
  );
}
