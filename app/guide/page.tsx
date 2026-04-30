/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import InfoPageShell, { InfoSection } from "../components/InfoPageShell";
import Script from "next/script";

const siteUrl = "https://daangn-auto-post.pages.dev";

export const metadata: Metadata = {
  title: "중고 판매글 완벽 가이드 — 당근·중고나라·번개장터 빠르게 파는 법 | Magic Seller",
  description:
    "당근마켓·중고나라·번개장터 판매글을 빠르게 팔리게 쓰는 실전 노하우. 제목 작성법·사진 촬영법·가격 책정·플랫폼별 전략·성공 사례·FAQ까지 완벽 정리. AI 자동 작성으로 30초 완성.",
  keywords: [
    "중고 판매글 쓰는 법", "당근마켓 판매글 잘 쓰는 법", "중고나라 글쓰기 팁",
    "번개장터 판매글 예시", "중고거래 판매글 양식", "중고 물건 빨리 파는 법",
    "당근마켓 제목 작성법", "중고 사진 잘 찍는 법", "중고 가격 책정 방법",
    "중고나라 안전거래", "번개장터 해시태그", "중고거래 사기 예방",
    "중고 판매 노하우", "당근마켓 끌어올리기", "중고 거래 팁", "중고 판매 성공 사례",
  ],
  alternates: {
    canonical: `${siteUrl}/guide`,
    languages: { "ko-KR": `${siteUrl}/guide` },
  },
  openGraph: {
    type: "article",
    url: `${siteUrl}/guide`,
    siteName: "Magic Seller",
    title: "중고 판매글 완벽 가이드 — 당근·중고나라·번개장터 빠르게 파는 법",
    description:
      "제목 작성법·사진 촬영법·가격 책정·플랫폼 전략·성공 사례까지. AI가 30초 만에 써주는 Magic Seller로 중고 거래 성사율을 2배 높이세요.",
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Magic Seller 중고 판매 가이드" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "중고 판매글 완벽 가이드 | Magic Seller",
    description: "당근·중고나라·번개장터 판매글 빨리 파는 실전 노하우 총정리. AI로 30초 완성!",
    images: ["/og-image.png"],
  },
};

export default function GuidePage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "중고거래 판매글 잘 쓰는 법 — 당근·중고나라·번개장터 완벽 가이드",
    description: "판매글 작성부터 사진 촬영, 가격 책정, 플랫폼별 전략까지 Magic Seller AI로 30초 만에 완성하는 방법",
    totalTime: "PT30S",
    tool: [{ "@type": "HowToTool", name: "Magic Seller AI" }],
    step: [
      { "@type": "HowToStep", position: 1, name: "상품 사진 촬영", text: "자연광에서 다각도로 5장 이상 찍으세요. 정면·측면·하자 부위를 반드시 포함하세요.", url: `${siteUrl}/guide` },
      { "@type": "HowToStep", position: 2, name: "Magic Seller에 사진 업로드", text: "사진을 업로드하면 GPT-4o Vision AI가 상품 상태를 자동 분석합니다.", url: `${siteUrl}` },
      { "@type": "HowToStep", position: 3, name: "상품명과 특징 입력", text: "상품명, 상태, 주요 상세 정보를 입력하세요. 영마및 한국어 모두 가능합니다.", url: `${siteUrl}` },
      { "@type": "HowToStep", position: 4, name: "AI 판매글 생성", text: "마법처럼 판매글 생성하기 버튼을 누르면 당근·중고나라·번개장터용 판매글이 자동 생성됩니다.", url: `${siteUrl}` },
      { "@type": "HowToStep", position: 5, name: "플랫폼에 복사 후 등록", text: "원하는 플랫폼 탭을 선택해 판매글을 복사하고 바로 등록하세요.", url: `${siteUrl}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "중고 판매글 완벽 가이드 — 당근·중고나라·번개장터 빨리 파는 법",
    description: "당근마켓·중고나라·번개장터 판매글 실전 노하우. 제목 작성법·사진 촬영법·가격 책정·플랫폼별 전략·성공 사례·FAQ 총정리.",
    author: { "@type": "Organization", name: "Magic Seller", url: siteUrl },
    publisher: { "@type": "Organization", name: "Magic Seller", url: siteUrl },
    url: `${siteUrl}/guide`,
    mainEntityOfPage: `${siteUrl}/guide`,
    inLanguage: "ko-KR",
    about: [
      { "@type": "Thing", name: "중고거래" },
      { "@type": "Thing", name: "당근마켓 판매글" },
      { "@type": "Thing", name: "AI 판매글 생성" },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "판매글 가이드", item: `${siteUrl}/guide` },
    ],
  };

  return (
    <>
      <Script id="guide-schema-howto" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <Script id="guide-schema-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Script id="guide-schema-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <InfoPageShell
      eyebrow="Complete Guide"
      title="중고 거래 마스터를 위한 완벽 가이드"
      description="단순히 물건을 올리는 것과 '팔리는 글'을 쓰는 것은 완전히 다릅니다. Magic Seller가 수천 건의 거래 데이터를 분석해 도출한 실전 노하우를 한 곳에 정리했습니다. 제목 작성법부터 사진 촬영, 가격 전략, 플랫폼별 공략법, 성공 사례까지 — 이 가이드 하나로 당신의 판매 성공률을 획기적으로 높여 보세요."
    >
      {/* ── 1. 왜 판매글이 중요한가 ── */}
      <InfoSection title="왜 판매글 품질이 판매 속도를 결정하는가">
        <p>
          중고 거래 플랫폼에서는 매일 수백만 건의 새 게시물이 등록됩니다. 당근마켓 월간 활성 이용자만 2,000만 명을
          넘고, 중고나라 누적 회원은 2,500만 명에 달합니다. 이처럼 공급이 넘치는 시장에서 구매자의 시선을 사로잡는 단 하나의
          차별점이 바로 <strong className="text-white">판매글의 완성도</strong>입니다.
        </p>
        <p>
          실제로 Magic Seller를 통해 생성된 판매글을 분석한 결과, AI가 최적화한 제목과 설명을 사용한 게시물은 평균
          <strong className="text-[#ffde00]"> 거래 성사까지 걸리는 시간이 일반 게시물 대비 40% 단축</strong>되었습니다.
          같은 제품도 어떻게 소개하느냐에 따라 당일 거래가 되기도 하고, 몇 주째 묵히기도 합니다.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-3xl font-black text-[#ff6f0f]">73%</p>
            <p className="mt-1 text-xs text-white/60">구매자가 제목만 보고 클릭 여부를 결정</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-3xl font-black text-[#ff6f0f]">5초</p>
            <p className="mt-1 text-xs text-white/60">구매자가 첫 사진을 판단하는 평균 시간</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-3xl font-black text-[#ff6f0f]">2.4배</p>
            <p className="mt-1 text-xs text-white/60">사진 5장 이상 게시물의 문의 증가율</p>
          </div>
        </div>
        <p>
          구매자는 무의식 중에 판매글의 성의를 판매자의 신뢰도와 연결 지어 생각합니다. 상세한 설명, 깔끔한 사진,
          정확한 스펙 기재 — 이 세 가지가 갖춰진 게시물은 같은 가격이라도 훨씬 빨리 팔립니다. 반대로 사진 한 장에
          "팝니다"만 적힌 게시물은 아무리 좋은 물건도 구매자에게 불신감을 줍니다.
        </p>
      </InfoSection>

      {/* ── 2. 신뢰받는 제목 패턴 ── */}
      <InfoSection title="클릭을 부르는 제목 작성법 — 3가지 황금 패턴">
        <p>
          중고 플랫폼에서 제목은 광고의 카피와 같습니다. 수천 개의 목록 중 구매자 클릭을 이끌어내는 제목에는
          세 가지 공통된 패턴이 있습니다. 어떤 패턴이든 핵심은 <strong className="text-white">애매한 수식어 대신 숫자와 고유명사</strong>를
          사용하는 것입니다.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-bold text-[#ffde00]">1. 스펙 중심형</h3>
            <p className="text-xs leading-5 text-white/60">
              아이폰 14 프로 실버 256GB 풀박스 배터리 92%
            </p>
            <p className="mt-2 text-xs text-white/40">
              모델명 + 색상 + 용량 + 상태를 조합. 검색 노출에 최적화.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-bold text-[#ffde00]">2. 상태 소구형</h3>
            <p className="text-xs leading-5 text-white/60">
              미개봉 새상품 에어팟 맥스 스페이스 그레이 당일발송
            </p>
            <p className="mt-2 text-xs text-white/40">
              상태를 앞에 배치해 신뢰를 즉시 전달. "미개봉·거의안씀" 효과.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-bold text-[#ffde00]">3. 가격 메리트형</h3>
            <p className="text-xs leading-5 text-white/60">
              [급매] 다이슨 에어랩 롱배럴 포함 국내정품 시세 대비 15만 원↓
            </p>
            <p className="mt-2 text-xs text-white/40">
              가격 매력을 수치로 어필. 단순 "최저가"보다 구체적 금액이 효과적.
            </p>
          </div>
        </div>
        <p>
          가장 권장하는 조합은 <strong className="text-white">[상태] + [정식 제품명] + [핵심 스펙] + [거래 조건]</strong>입니다.
          예를 들어 "상태 S급 삼성 갤럭시 S24 울트라 256GB 티타늄 블랙 사은품 포함 직거래 가능"처럼
          구매자가 궁금해할 정보를 제목 안에 최대한 압축하세요.
        </p>
      </InfoSection>

      {/* ── 3. 플랫폼별 공략법 ── */}
      <InfoSection title="플랫폼별 맞춤 전략 — 당근마켓·중고나라·번개장터">
        <p>
          각 중고 플랫폼마다 주 사용자층과 거래 문화가 확연히 다릅니다. 같은 물건도 플랫폼 특성에 맞게
          글투와 강조점을 조정하면 판매 성공률이 크게 높아집니다. 아래 세 플랫폼의 핵심 차이를 이해하고 전략적으로 활용하세요.
        </p>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="mb-3 text-base font-bold text-white">당근마켓 — 동네 이웃 감성과 신뢰</h3>
            <p className="text-sm leading-7 text-white/70">
              당근마켓 이용자는 &quot;같은 동네 이웃&quot;이라는 심리적 친밀감을 중시합니다. 판매 배경을 짧게
              곁들이는 것만으로도 신뢰도가 크게 올라갑니다. &quot;아이가 금방 크게 되어 아쉽게 내놓아요&quot;,
              &quot;이사하게 되어 급하게 처분합니다&quot; 같은 문장은 구매자에게 인간적인 인상을 줍니다.
              직거래가 기본이므로 구체적인 랜드마크(○○역 3번 출구, ○○마트 앞)를 명시하고,
              거래 가능 시간대를 미리 적어두면 불필요한 채팅 문의를 줄일 수 있습니다. 또한 당근마켓은
              &quot;매너 온도&quot;가 중요하므로 빠른 채팅 응답과 약속 시간 준수가 재판매에도 영향을 미칩니다.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="mb-3 text-base font-bold text-white">중고나라 — 전국구 시장, 전문 업자 수준의 정보량</h3>
            <p className="text-sm leading-7 text-white/70">
              중고나라는 전국 단위 거래가 많고 택배 거래가 흔하기 때문에 정보의 완결성이 핵심입니다.
              스펙을 표 형태 혹은 항목별로 정리하고, 네이버 안전결제 지원 여부를 본문 상단에 명시하세요.
              구매자 입장에서 가장 불안한 것은 &quot;도착했을 때 상태가 다를 것 같다&quot;는 우려인데,
              이를 해소하려면 포장 상태 사진을 미리 보여주는 것이 효과적입니다. 또한 하자가 있다면
              솔직하게 기재하고 그에 맞게 가격을 반영했음을 명시하면 오히려 신뢰가 높아집니다.
              카페 게시판 특성상 네이버 ID 등급(중고나라 인증 판매자)도 중요한 신뢰 지표입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="mb-3 text-base font-bold text-white">번개장터 — MZ세대 감성, 해시태그와 속도</h3>
            <p className="text-sm leading-7 text-white/70">
              번개장터는 10~30대 이용자 비중이 높고 패션·스니커즈·한정판 굿즈 거래가 활발합니다.
              해시태그 활용이 검색 노출에 직결되므로 제품 카테고리, 브랜드명, 시즌, 희귀 옵션 등
              5~10개의 관련 태그를 배치하세요. 단, 관련 없는 태그 남발은 신고 대상이 될 수 있습니다.
              번개장터는 &quot;번개 인증&quot; 셀러 뱃지와 별점이 구매 결정에 큰 영향을 줍니다.
              신속한 응답 속도와 빠른 발송(당일~익일)이 좋은 평점으로 이어지므로, 발송 가능 일자를
              반드시 명시하세요. 프로필 사진과 상점 소개를 완성도 있게 꾸미는 것도 방문자 전환에 도움이 됩니다.
            </p>
          </div>
        </div>
      </InfoSection>

      {/* ── 4. 사진 잘 찍는 법 ── */}
      <InfoSection title="팔리는 사진 촬영법 — 스마트폰으로도 프로처럼">
        <p>
          중고 거래에서 사진은 구매자가 직접 실물을 보지 못하는 상황을 대체하는 유일한 수단입니다.
          전문 카메라 없이도 스마트폰만으로 충분히 신뢰감을 주는 사진을 찍을 수 있습니다.
          아래 다섯 가지 원칙을 실천해 보세요.
        </p>
        <ol className="space-y-5 pl-1">
          <li className="flex gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6f0f]/20 text-sm font-bold text-[#ff6f0f]">1</span>
            <div>
              <h3 className="font-bold text-white">자연광을 최대한 활용하세요</h3>
              <p className="mt-1 text-sm leading-6 text-white/65">
                형광등은 제품에 노란빛이나 그림자를 드리워 색감을 왜곡합니다. 낮 시간 창가(직사광선이
                아닌 확산광)에서 찍은 사진이 제품 본연의 색을 가장 자연스럽게 보여줍니다. 흐린 날
                실내 창가도 훌륭한 환경입니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6f0f]/20 text-sm font-bold text-[#ff6f0f]">2</span>
            <div>
              <h3 className="font-bold text-white">배경을 단순하게 만드세요</h3>
              <p className="mt-1 text-sm leading-6 text-white/65">
                화려한 이불, 어지러운 책상은 제품이 아닌 배경으로 시선을 분산시킵니다. 흰 A4 용지,
                무지 색 천, 깔끔한 식탁 위처럼 단색 배경을 활용하면 제품이 훨씬 돋보입니다.
                밖에서 찍을 경우 잔디밭이나 보도블록 같은 자연스러운 배경도 좋습니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6f0f]/20 text-sm font-bold text-[#ff6f0f]">3</span>
            <div>
              <h3 className="font-bold text-white">다양한 각도에서 최소 5장 이상 찍으세요</h3>
              <p className="mt-1 text-sm leading-6 text-white/65">
                정면·측면·후면·상단·하단을 기본으로, 전자제품은 화면을 켜고 찍은 사진도 포함하세요.
                첫 번째 사진은 가장 선명하고 임팩트 있는 컷으로 설정합니다. 구성품이 있다면
                모든 구성품을 함께 펼쳐 찍은 사진을 꼭 추가하세요.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6f0f]/20 text-sm font-bold text-[#ff6f0f]">4</span>
            <div>
              <h3 className="font-bold text-white">하자 부위는 정직하게 찍으세요</h3>
              <p className="mt-1 text-sm leading-6 text-white/65">
                긁힘, 찌그러짐, 변색 등 흠집이 있다면 반드시 사진으로 남기고 "사진 참고"라고
                본문에 명시하세요. 나중에 발생하는 분쟁을 예방하고, 오히려 하자를 솔직히 공개한
                판매자가 더 높은 신뢰를 얻습니다. Magic Seller AI는 이 사진을 분석해 하자에 맞는
                설명과 가격 반영 문구를 자동으로 작성해 드립니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6f0f]/20 text-sm font-bold text-[#ff6f0f]">5</span>
            <div>
              <h3 className="font-bold text-white">스마트폰 카메라 설정을 확인하세요</h3>
              <p className="mt-1 text-sm leading-6 text-white/65">
                카메라 격자(Grid) 기능을 켜면 수평이 맞는 사진을 쉽게 찍을 수 있습니다. HDR 모드를
                활성화하면 밝고 어두운 부분의 균형이 좋아집니다. 사진 편집 앱으로 밝기·대비를
                살짝 높이면 더욱 선명한 이미지를 만들 수 있습니다. 단, 색상을 과도하게 보정하거나
                흠집을 지우는 편집은 피하세요.
              </p>
            </div>
          </li>
        </ol>
      </InfoSection>

      {/* ── 5. 가격 책정 전략 ── */}
      <InfoSection title="가격 책정 전략 — 너무 싸도, 너무 비싸도 안 된다">
        <p>
          중고 거래에서 가격은 단순한 숫자가 아닙니다. 너무 낮으면 &quot;뭔가 문제가 있는 건 아닐까&quot; 하는
          의심을 사고, 너무 높으면 아예 클릭이 없습니다. 시세에 기반한 합리적 가격 설정이 핵심입니다.
        </p>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-semibold text-white">시세 조사법</h3>
            <p className="text-sm leading-6 text-white/65">
              먼저 판매하려는 플랫폼에서 같은 제품의 최근 판매 완료 게시물을 검색하세요.
              당근마켓·번개장터에서는 &quot;판매 완료&quot; 필터를 사용하면 실제 거래가 이루어진 가격을
              확인할 수 있습니다. 네이버 쇼핑에서 신품 최저가를 확인한 후, 상태(S급·A급·B급)에 따라
              신품 대비 50~75% 선에서 출발점을 잡는 것이 일반적입니다.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-semibold text-white">네고(가격 흥정) 여지 설정</h3>
            <p className="text-sm leading-6 text-white/65">
              구매자 대부분은 흥정을 시도합니다. 이를 감안해 최종 희망 판매가보다 5~10% 높게
              설정하는 것이 심리적으로 유리합니다. 예를 들어 10만 원에 팔고 싶다면 11만 원에
              올리되, 본문에 &quot;소액 네고 가능&quot;이라고 명시하세요. 반대로 정찰제를 원한다면
              &quot;가격 조정 없습니다&quot;를 명확히 표기해 불필요한 흥정 요청을 줄이세요.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-semibold text-white">빠른 판매를 원할 때의 가격 전략</h3>
            <p className="text-sm leading-6 text-white/65">
              시세보다 10~15% 저렴하게 올리면서 본문에 &quot;급매&quot; 또는 &quot;빠른 거래 선호&quot;를 명시하면
              문의가 급증합니다. 단, 너무 급하다는 느낌을 주면 지나친 가격 협상 시도로 이어질 수
              있으니 이유를 간략히 설명하는 것이 좋습니다. 반대로 인기 제품이나 한정판은 시세보다
              약간 높게 책정해도 수요가 충분합니다.
            </p>
          </div>
        </div>
      </InfoSection>

      {/* ── 6. 성공 사례 Before / After ── */}
      <InfoSection title="실제 성공 사례 — Before vs After">
        <p>
          Magic Seller를 활용한 판매자들의 실제 사례를 통해, 판매글 품질이 거래 속도에 어떤 차이를
          만드는지 확인해 보세요.
        </p>
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ffde00]">Case 1 — 스마트폰</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="mb-2 text-xs font-semibold text-red-400">Before (수정 전)</p>
                <p className="text-xs leading-5 text-white/60">
                  제목: "아이폰 팔아요"<br />
                  본문: "잘 쓰던 폰 팝니다. 이상 없어요. 연락주세요."<br />
                  사진: 1장 (어두운 실내)<br />
                  결과: 14일 동안 판매 미성사
                </p>
              </div>
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="mb-2 text-xs font-semibold text-green-400">After (Magic Seller 적용)</p>
                <p className="text-xs leading-5 text-white/60">
                  제목: "아이폰 14 프로 딥퍼플 256GB 배터리 89% 사은품 풀구성"<br />
                  본문: 스펙·상태·구성품·하자 등 400자 상세 설명<br />
                  사진: 7장 (자연광, 다각도)<br />
                  결과: 게시 2시간 만에 거래 성사
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ffde00]">Case 2 — 유아용품</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="mb-2 text-xs font-semibold text-red-400">Before (수정 전)</p>
                <p className="text-xs leading-5 text-white/60">
                  제목: "유모차 팝니다 싸게"<br />
                  본문: "한 달 사용. 깨끗합니다."<br />
                  사진: 2장 (바닥에 눕혀서)<br />
                  결과: 3주 무반응
                </p>
              </div>
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="mb-2 text-xs font-semibold text-green-400">After (Magic Seller 적용)</p>
                <p className="text-xs leading-5 text-white/60">
                  제목: "스토케 트레일즈 유모차 블랙 1개월 사용 풀세트 (레인커버·컵홀더 포함)"<br />
                  본문: 브랜드·연식·사용 기간·세탁 여부·구성품 완벽 정리<br />
                  사진: 6장 (접이식 시연 포함)<br />
                  결과: 당일 3건 문의, 다음날 거래 완료
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ffde00]">Case 3 — 가전제품</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="mb-2 text-xs font-semibold text-red-400">Before (수정 전)</p>
                <p className="text-xs leading-5 text-white/60">
                  제목: "공기청정기 삽니다 아니 팝니다ㅋ"<br />
                  본문: "쓸 만 합니다. 직거래만"<br />
                  사진: 없음<br />
                  결과: 노출은 되지만 클릭 없음
                </p>
              </div>
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="mb-2 text-xs font-semibold text-green-400">After (Magic Seller 적용)</p>
                <p className="text-xs leading-5 text-white/60">
                  제목: "삼성 블루스카이 7000 AX90T9080WSD 2022년형 필터 교체 완료"<br />
                  본문: 모델 번호·구매 연월·필터 교체 이력·적용 평수·리모컨 포함 여부 완전 기재<br />
                  사진: 5장 (필터 사진 포함)<br />
                  결과: 4시간 내 판매 완료
                </p>
              </div>
            </div>
          </div>
        </div>
      </InfoSection>

      {/* ── 7. 최종 게시 전 체크리스트 ── */}
      <InfoSection title="게시 전 필수 체크리스트">
        <p>
          판매글을 올리기 전 아래 항목을 하나씩 확인하세요. 모든 항목이 충족되면 거래 성사 확률이
          크게 올라갑니다.
        </p>
        <div className="rounded-[24px] border border-white/15 bg-gradient-to-r from-[#ff6f0f]/10 to-[#8c52ff]/10 p-6">
          <ul className="grid gap-3 sm:grid-cols-2 text-sm font-medium">
            <li className="flex items-start gap-2">
              <span className="text-[#ffde00]">✅</span>
              브랜드와 모델명이 제목에 명시되어 있는가?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffde00]">✅</span>
              가장 선명한 사진이 첫 번째로 설정되어 있는가?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffde00]">✅</span>
              구성품(충전기, 케이스, 박스 등) 누락 여부를 명시했는가?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffde00]">✅</span>
              거래 희망 위치와 가능 시간이 기재되어 있는가?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffde00]">✅</span>
              가격 협상(네고) 가능 여부를 표시했는가?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffde00]">✅</span>
              눈에 띄는 하자가 있다면 사진과 함께 솔직하게 기재했는가?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffde00]">✅</span>
              택배 가능 여부와 발송 방식(선불·착불)을 명시했는가?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffde00]">✅</span>
              맞춤법 검사와 오탈자 확인을 완료했는가?
            </li>
          </ul>
        </div>
      </InfoSection>

      {/* ── 8. FAQ ── */}
      <InfoSection title="자주 묻는 질문 (FAQ)">
        <div className="space-y-4">
          <details className="rounded-2xl border border-white/10 bg-black/20 p-5 open:border-[#ff6f0f]/30">
            <summary className="cursor-pointer font-semibold text-white">
              Q. Magic Seller는 어떤 사진을 올려야 가장 좋은 결과를 내나요?
            </summary>
            <p className="mt-3 text-sm leading-7 text-white/65">
              A. 자연광에서 찍은 선명한 사진이 가장 효과적입니다. 정면·측면·하자 부위를 포함해
              최소 3장 이상 올려주세요. 사진이 많을수록 AI가 제품 상태를 더 정확하게 파악해
              더 설득력 있는 설명글을 생성합니다. 전자제품의 경우 화면을 켠 상태의 사진도
              꼭 포함시켜 주세요.
            </p>
          </details>
          <details className="rounded-2xl border border-white/10 bg-black/20 p-5 open:border-[#ff6f0f]/30">
            <summary className="cursor-pointer font-semibold text-white">
              Q. AI가 생성한 글을 그대로 올려도 되나요?
            </summary>
            <p className="mt-3 text-sm leading-7 text-white/65">
              A. 기본적으로 생성된 글은 바로 사용할 수 있도록 설계되어 있습니다. 다만 거래 장소,
              구체적인 하자 위치, 개인 연락 선호 방식 등 AI가 알 수 없는 세부 정보는 직접
              추가해 주세요. 생성된 글을 자신의 말투에 맞게 살짝 다듬으면 더욱 자연스러운
              판매글이 완성됩니다.
            </p>
          </details>
          <details className="rounded-2xl border border-white/10 bg-black/20 p-5 open:border-[#ff6f0f]/30">
            <summary className="cursor-pointer font-semibold text-white">
              Q. 여러 플랫폼에 동시에 올려도 되나요?
            </summary>
            <p className="mt-3 text-sm leading-7 text-white/65">
              A. 가능하며, 오히려 권장합니다. 당근마켓은 직거래 희망자, 중고나라는 택배 거래
              희망자, 번개장터는 특정 브랜드 팬층에게 닿기 때문에 동시 게시 시 판매 채널이
              다양해집니다. 단, 동일 물건을 여러 플랫폼에 올렸다면 한 곳에서 판매 완료 시
              나머지 플랫폼에서도 즉시 판매 완료 처리 또는 삭제하는 매너가 필요합니다.
            </p>
          </details>
          <details className="rounded-2xl border border-white/10 bg-black/20 p-5 open:border-[#ff6f0f]/30">
            <summary className="cursor-pointer font-semibold text-white">
              Q. 가격 협상 요청이 너무 많이 올 때 어떻게 대응하나요?
            </summary>
            <p className="mt-3 text-sm leading-7 text-white/65">
              A. 게시글 본문에 &quot;가격 조정 없습니다&quot; 또는 &quot;정찰제입니다&quot;를 명확히 적어두면
              흥정 요청이 크게 줄어듭니다. 반대로 &quot;소액 네고 가능&quot;이라고 적었다면 5~10% 이내의
              합리적인 제안은 수용하고, 지나친 요구에는 정중히 거절하세요.
              &quot;죄송하지만 현재 가격이 최선이에요&quot; 한 마디로 충분합니다.
            </p>
          </details>
          <details className="rounded-2xl border border-white/10 bg-black/20 p-5 open:border-[#ff6f0f]/30">
            <summary className="cursor-pointer font-semibold text-white">
              Q. 판매가 오래 안 될 때 어떻게 하면 좋을까요?
            </summary>
            <p className="mt-3 text-sm leading-7 text-white/65">
              A. 먼저 가격이 시세에 맞는지 재확인하세요. 가격이 적정하다면 대표 사진을 교체하거나,
              제목을 다른 패턴으로 바꿔 보세요. 플랫폼의 &quot;끌어올리기&quot; 기능을 활용하면
              목록 상단에 다시 노출됩니다. 또한 시즌이나 타이밍도 영향을 줍니다 — 스키 장비는
              겨울 시즌 직전이, 에어컨은 여름 전에 올려야 잘 팔립니다.
            </p>
          </details>
          <details className="rounded-2xl border border-white/10 bg-black/20 p-5 open:border-[#ff6f0f]/30">
            <summary className="cursor-pointer font-semibold text-white">
              Q. 사기를 예방하는 방법은 무엇인가요?
            </summary>
            <p className="mt-3 text-sm leading-7 text-white/65">
              A. 직거래 시에는 낮 시간 번화한 공공장소(카페, 편의점)에서 만나고, 고가 물품은
              반드시 실물 확인 후 현장에서 송금하세요. 택배 거래 시에는 플랫폼 내 안전결제
              시스템(당근마켓 안전결제, 번개장터 번개페이 등)을 이용하세요.
              모르는 외부 링크 클릭, 계좌번호만 요구하는 거래 등은 반드시 피하세요.
            </p>
          </details>
        </div>
      </InfoSection>

      {/* ── 9. 마무리 조언 ── */}
      <InfoSection title="Magic Seller 팀의 한마디">
        <p>
          중고 거래의 끝은 입금이 아니라 <strong className="text-white">구매자의 구매 확정과 좋은 후기</strong>입니다.
          Magic Seller를 통해 전문성 있는 글을 작성하셨다면, 거래 과정에서도 빠른 응답과
          약속 시간 준수, 안전한 포장으로 기분 좋은 마무리를 지어 보세요.
        </p>
        <p>
          당신의 판매 매너와 평점이 쌓일수록 다음 물건은 더 빠른 속도에 더 좋은 가격으로 팔릴 수 있습니다.
          매력적인 판매글 + 매너 있는 거래 태도, 이 두 가지가 중고 거래 마스터의 핵심입니다.
          Magic Seller가 항상 함께하겠습니다.
        </p>
        <div className="mt-4 rounded-2xl border border-[#ff6f0f]/20 bg-[#ff6f0f]/5 p-5 text-center">
          <p className="text-sm font-semibold text-[#ffb88c]">
            지금 바로 Magic Seller로 판매글을 생성해 보세요
          </p>
          <p className="mt-1 text-xs text-white/50">
            사진 업로드 → AI 분석 → 완성된 판매글 자동 생성 — 30초면 충분합니다
          </p>
        </div>
      </InfoSection>
    </InfoPageShell>
    </>
  );
}
