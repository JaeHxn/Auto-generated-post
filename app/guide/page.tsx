import type { Metadata } from "next";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";

export const metadata: Metadata = {
  title: "판매글 작성 가이드",
  description: "중고 거래 판매글을 더 신뢰감 있게 쓰기 위한 실전 가이드와 체크리스트입니다.",
};

export default function GuidePage() {
  return (
    <InfoPageShell
      eyebrow="Expert Guide"
      title="중고 거래 마스터를 위한 실전 가이드"
      description="단순히 글을 쓰는 것을 넘어, 더 빨리 팔리고 더 안전하게 거래하는 노하우를 공개합니다. Magic Seller가 분석한 데이터 기반 가이드입니다."
    >
      <InfoSection title="[Article 1] 신뢰받는 판매자의 3가지 제목 패턴">
        <p>
          중고 플랫폼에서 제목은 광고의 '카피'와 같습니다. 수천 개의 목록 중 사용자 클릭을 이끌어내는 제목에는 세 가지 공통점이 있습니다.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <h5 className="text-[#ffde00] font-bold mb-2">1. 스펙 중심형</h5>
            <p className="text-xs text-white/60">아이폰 14 프로 실버 256GB 풀박스 배터리 92%</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <h5 className="text-[#ffde00] font-bold mb-2">2. 상태 소구형</h5>
            <p className="text-xs text-white/60">미개봉 새상품 에어팟 맥스 스페이스 그레이 당일발송</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <h5 className="text-[#ffde00] font-bold mb-2">3. 가격 메리트형</h5>
            <p className="text-xs text-white/60">[급매] 다이슨 에어랩 롱배럴 포함 국내정품 최저가</p>
          </div>
        </div>
        <p className="mt-4">
          가장 권장하는 방식은 **[상태] + [정식 제품명] + [필수 스펙]**의 조합입니다.
          애매한 수식어보다는 숫자로 표현된 사양(GB, 배터리 효율, 연식 등)이 구매자의 신뢰를 훨씬 더 높여줍니다.
        </p>
      </InfoSection>

      <InfoSection title="[Article 2] 플랫폼별 맞춤형 판매 전략">
        <p>
          각 중고 플랫폼마다 유저들이 기대하는 '문체'와 '정보량'이 다릅니다. 이를 이해하면 판매 성공률이 비약적으로 상승합니다.
        </p>
        <div className="space-y-4 mt-4">
          <details className="p-4 bg-black/20 border border-white/10 rounded-2xl">
            <summary className="font-bold cursor-pointer">🥕 당근마켓: 감성적인 '나눔'과 '이웃'</summary>
            <p className="text-sm text-white/70 mt-3 leading-relaxed">
              당근마켓 유저는 같은 동네 이웃이라는 심리적 친밀감이 큽니다. "아이 성장에 맞춰 아쉽게 내놓아요", "이사하게 되어 급하게 처분합니다" 같은
              배경 설명을 곁들이면 훨씬 따뜻한 인상을 줍니다. 거래 장소는 구체적인 랜드마크를 언급하세요.
            </p>
          </details>
          <details className="p-4 bg-black/20 border border-white/10 rounded-2xl">
            <summary className="font-bold cursor-pointer">⚡ 번개장터: 힙한 태그와 속도감</summary>
            <p className="text-sm text-white/70 mt-3 leading-relaxed">
              가장 젊은 층이 이용하는 번개장터는 해시태그 활용이 핵심입니다. 관련 없는 태그를 남발하기보다 제품의 카테고리, 스타일,
              희귀 옵션 위주로 5~10개를 배치하세요. 상점의 신뢰도(판매 횟수, 별점)가 중요하므로 깔끔한 대응이 필수입니다.
            </p>
          </details>
          <details className="p-4 bg-black/20 border border-white/10 rounded-2xl">
            <summary className="font-bold cursor-pointer">📦 중고나라: 전문 업자 수준의 철저함</summary>
            <p className="text-sm text-white/70 mt-3 leading-relaxed">
              전국구 단위인 중고나라는 시스템화된 사양이 중요합니다. 스펙표를 텍스트로 깔끔하게 정리하고,
              안전결제(네이버페이 등) 지원 여부를 명시하세요. 비대면 택배 거래가 많으므로 포장 상태 사진을 미리 보여주는 것이 큰 장점이 됩니다.
            </p>
          </details>
        </div>
      </InfoSection>

      <InfoSection title="[Article 3] 팔리는 사진은 구도부터 다르다">
        <p>
          Magic Seller AI가 사진을 잘 분석하기 위해서도 사진 퀄리티는 중요합니다. 잘 팔리는 사진을 위한 3단계 팁입니다.
        </p>
        <ul className="space-y-4 pl-5 list-decimal text-sm leading-relaxed">
          <li>
            **자연광을 활용하세요**: 형광등 아래보다는 낮 시간 창가에서 찍은 사진이 제품 본연의 색감을 가장 잘 보여줍니다.
          </li>
          <li>
            **배경을 단순화하세요**: 화려한 이불이나 어지러운 책상보다는 깔끔한 단색 배경(식탁, 흰 벽 등)에서 제품이 돋보입니다.
          </li>
          <li>
            **하자 부위를 정직하게 찍으세요**: 나중에 분쟁을 겪는 것보다 미리 사진으로 하자를 보여주는 판매자가 훨씬 더 높은 신뢰를 얻습니다. AI도 이 사진을 보고 사과 문구와 가격 조정 근거를 알아서 작성해 드립니다.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="[Checklist] 최종 게시 전 확인해야 할 것">
        <div className="bg-gradient-to-r from-[#ff6f0f]/10 to-[#8c52ff]/10 p-6 rounded-[24px] border border-white/15">
          <ul className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm font-medium">
            <li className="flex gap-2">✅ 브랜드와 모델명이 제목에 있는가?</li>
            <li className="flex gap-2">✅ 가장 선명한 사진이 첫 번째인가?</li>
            <li className="flex gap-2">✅ 구성품(충전기, 케이스 등) 누락을 썼는가?</li>
            <li className="flex gap-2">✅ 거래 희망 위치와 시간이 명시되었는가?</li>
            <li className="flex gap-2">✅ 가격 제안(네고) 가능 여부를 썼는가?</li>
            <li className="flex gap-2">✅ 연락 가능한 수단(채팅, 안심번호)이 활성화되었는가?</li>
          </ul>
        </div>
      </InfoSection>

      <InfoSection title="운영자의 조언">
        <p>
          중고 거래의 끝은 입금이 아니라 '구매자의 구매 확정'입니다. Magic Seller를 통해 전문성 있는 글을 작성하셨다면,
          거래 과정에서도 매너 있는 채팅과 빠른 발송으로 기분 좋은 거래를 완성해 보세요. 당신의 평판이 쌓일수록 다음 물건은 더 비싼 가격에도 팔릴 수 있습니다.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
