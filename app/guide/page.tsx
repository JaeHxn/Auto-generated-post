import type { Metadata } from "next";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";

export const metadata: Metadata = {
  title: "판매글 작성 가이드",
  description: "중고 거래 판매글을 더 신뢰감 있게 쓰기 위한 실전 가이드와 체크리스트입니다.",
};

export default function GuidePage() {
  return (
    <InfoPageShell
      eyebrow="Guide"
      title="중고 판매글 작성 가이드"
      description="조회수만 많은 글보다 문의로 이어지는 글이 중요합니다. 판매글을 더 잘 쓰기 위한 실전 원칙을 정리했습니다."
    >
      <InfoSection title="1. 제목은 정확하고 검색되게 써야 합니다">
        <p>
          제목에는 브랜드, 제품명, 핵심 상태를 넣는 것이 좋습니다. 예를 들어 “무선청소기 판매”보다 “다이슨 V8 무선청소기 배터리 정상 작동”처럼
          검색 키워드와 상태 정보를 함께 넣어야 클릭 이후 이탈이 줄어듭니다.
        </p>
      </InfoSection>

      <InfoSection title="2. 본문은 상태와 거래 조건을 분리해서 적는 편이 좋습니다">
        <p>
          구매자는 대부분 “왜 파는지”보다 “상태가 어떤지”, “구성품이 무엇인지”, “어디서 어떻게 거래하는지”를 먼저 봅니다.
          그래서 한 문단에 몰아 쓰지 말고 상태, 구성품, 거래 방식, 주의사항을 나눠 적는 편이 신뢰를 줍니다.
        </p>
      </InfoSection>

      <InfoSection title="3. 사진 설명은 보이는 사실만 넣어야 합니다">
        <p>
          사진에 보이는 포장 상태, 스크래치, 미개봉 여부, 색상, 구성품 유무는 본문에 적는 것이 좋습니다.
          다만 사진에 명확히 보이지 않는 구매 시기, 정품 여부, 사용 횟수까지 추정해서 적으면 오히려 분쟁 가능성이 커집니다.
        </p>
      </InfoSection>

      <InfoSection title="4. 잘 팔리는 글의 공통 체크리스트">
        <ul className="space-y-2 pl-5">
          <li>제품명과 핵심 키워드가 제목에 들어갔는가</li>
          <li>오염, 사용감, 하자 유무를 숨기지 않고 적었는가</li>
          <li>구성품과 누락품을 분리해서 적었는가</li>
          <li>직거래 가능 지역 또는 택배 가능 여부를 썼는가</li>
          <li>가격 제안 가능 여부를 적었는가</li>
          <li>사진과 본문이 서로 맞는가</li>
        </ul>
      </InfoSection>

      <InfoSection title="5. Magic Seller를 사용할 때도 최종 검수는 꼭 필요합니다">
        <p>
          AI 도구는 초안 정리에 강하지만, 실제 제품 상태를 가장 잘 아는 사람은 판매자 본인입니다.
          제품 하자, 사용 기간, 거래 위치, 가격 조건, 환불 불가 여부 등은 게시 전에 반드시 직접 확인해야 합니다.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
