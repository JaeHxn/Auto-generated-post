import Link from "next/link";

const principles = [
  "제목만 강조하지 않고 상태, 거래 조건, 확인 포인트를 함께 정리합니다.",
  "사진이 있으면 보이는 사실만 설명하고, 보이지 않는 정보는 임의로 추가하지 않습니다.",
  "구매자에게 중요한 정보는 문단을 나눠 읽기 쉽게 배치합니다.",
  "과장 문구보다 신뢰를 높이는 표현을 우선합니다.",
];

const useCases = [
  {
    title: "당근마켓용 짧고 신뢰감 있는 글",
    description: "동네 직거래에 맞춰 빠르게 읽히는 문장, 거래 방식, 응답 유도 문장을 정리합니다.",
  },
  {
    title: "중고나라용 상세 설명형 글",
    description: "상태 설명, 구성품, 거래 조건을 더 길게 적고 싶을 때 구조화된 문장을 제공합니다.",
  },
  {
    title: "번개장터용 상품 포인트 강조",
    description: "검색 키워드와 핵심 장점을 살리되 허위 정보 없이 판매 포인트를 정리합니다.",
  },
];

const faqs = [
  {
    q: "사진을 올리면 어떤 식으로 반영되나요?",
    a: "업로드된 이미지는 분석용 크기로 자동 조정한 뒤 판매글에 반영합니다. 사진에서 실제로 확인되는 외관, 포장 상태, 구성품 여부 같은 정보만 본문에 넣도록 설계했습니다.",
  },
  {
    q: "Magic Seller가 직접 판매를 대신하나요?",
    a: "아닙니다. Magic Seller는 판매글 초안을 정리하는 도구입니다. 최종 게시 전에는 사용자가 실제 상태, 가격, 거래 조건을 반드시 다시 검토해야 합니다.",
  },
  {
    q: "왜 이런 설명 페이지가 필요한가요?",
    a: "도구형 사이트는 기능만 있으면 심사에서 저가치 페이지로 보일 수 있습니다. 서비스 목적, 사용 방식, 운영 정보, 정책을 명확히 공개해야 방문자와 광고 심사 모두에게 신뢰를 줄 수 있습니다.",
  },
];

export default function HomeEditorialSections() {
  return (
    <section className="mt-12 grid gap-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-[20px]">
        <div className="inline-flex rounded-full border border-[#00c9ff]/30 bg-[#00c9ff]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#8ee8ff]">
          서비스 설명
        </div>
        <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">Magic Seller가 해결하려는 문제</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-white/75 sm:text-base">
          <p>
            중고 거래에서 판매글은 단순한 문장 모음이 아니라 신뢰를 판단하는 첫 화면입니다. 상태 설명이 모호하거나,
            거래 조건이 빠져 있거나, 사진과 본문이 따로 놀면 조회수는 있어도 문의로 이어지지 않습니다.
          </p>
          <p>
            Magic Seller는 사용자가 입력한 상품명, 설명, 사진을 바탕으로 읽기 쉬운 판매글 초안을 구성합니다.
            플랫폼별 문체 차이를 반영하고, 허구 정보를 만들지 않도록 보이는 사실과 입력된 정보 중심으로 문장을 정리하는 것을 목표로 합니다.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-8 backdrop-blur-[20px]">
          <h3 className="text-xl font-bold text-white">좋은 판매글의 기본 원칙</h3>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/75 sm:text-base">
            {principles.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 text-[#ffde00]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-8 backdrop-blur-[20px]">
          <h3 className="text-xl font-bold text-white">운영 신뢰 정보</h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-white/75 sm:text-base">
            <p>서비스 소개, 이용약관, 개인정보 처리방침, 문의 페이지를 각각 분리해 공개합니다.</p>
            <p>Google 로그인, Paddle 결제, Supabase 저장소 사용 범위도 정책 페이지에서 명시합니다.</p>
            <p>문의 메일: <a href="mailto:luvsoul@kakao.com" className="text-[#ffde00] hover:underline">luvsoul@kakao.com</a></p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-[20px]">
        <h3 className="text-xl font-bold text-white">이 사이트에서 바로 확인할 수 있는 콘텐츠</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {useCases.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h4 className="text-base font-bold text-white">{item.title}</h4>
              <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-black/20 p-8 backdrop-blur-[20px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">가이드와 정책 페이지 바로가기</h3>
            <p className="mt-2 text-sm leading-7 text-white/70">
              광고 심사와 사용자 신뢰를 위해 서비스 설명, 정책, 문의 경로를 명확히 공개합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/guide" className="rounded-full border border-white/15 px-4 py-2 text-white/80 hover:border-[#ff6f0f]/50 hover:text-white">
              판매글 가이드
            </Link>
            <Link href="/about" className="rounded-full border border-white/15 px-4 py-2 text-white/80 hover:border-[#ff6f0f]/50 hover:text-white">
              서비스 소개
            </Link>
            <Link href="/contact" className="rounded-full border border-white/15 px-4 py-2 text-white/80 hover:border-[#ff6f0f]/50 hover:text-white">
              문의
            </Link>
            <Link href="/privacy" className="rounded-full border border-white/15 px-4 py-2 text-white/80 hover:border-[#ff6f0f]/50 hover:text-white">
              개인정보 처리방침
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-[20px]">
        <h3 className="text-xl font-bold text-white">자주 묻는 질문</h3>
        <div className="mt-5 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/75">
              <summary className="cursor-pointer list-none text-base font-bold text-white">{faq.q}</summary>
              <p className="mt-3 text-sm leading-7 sm:text-base">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
