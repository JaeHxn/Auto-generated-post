import Link from "next/link";

const principles = [
  "제목은 인위적인 수식어보다 브랜드, 모델명, 핵심 상태(예: 미개봉, 풀박스)를 명확히 포함하는 것을 원칙으로 합니다.",
  "제품 사진 속 데이터와 본문 정보가 일치하도록 검증하며, 사진만으로는 알 수 없는 하자나 특이사항은 사용자가 직접 입력한 정보를 최우선으로 반영합니다.",
  "구매자의 가독성을 위해 상태 설명, 거래 방식, 환불 정책 등을 논리적인 문단으로 구분하여 인지 부하를 줄입니다.",
  "단순한 자극적 문구보다 '신뢰할 수 있는 이웃'의 언어로 다가가도록 유도하며, 과장된 표현은 AI 단계에서 필터링을 시도합니다.",
];

const useCases = [
  {
    title: "당근마켓: 지역 기반 신뢰 거래",
    description: "동네 이웃 간의 따뜻하고 정직한 거래를 위해 친절한 말투와 직거래 위치, 매너 있는 문구를 강조합니다. 짧지만 핵심적인 정보가 모두 담긴 폼을 제공합니다.",
  },
  {
    title: "중고나라: 방대한 데이터와 상세 설명",
    description: "전국 단위 거래가 이루어지는 만큼 택배 거래 안전결제 유무, 상세한 제품 사양, 구성품 목록을 구조화하여 구매자가 질문하지 않아도 될 만큼의 정보를 제공합니다.",
  },
  {
    title: "번개장터: 트렌디한 타겟과 검색 최적화",
    description: "Z세대와 MZ세대의 감성에 맞는 핵심 장점 강조와 함께, 검색 엔진 노출을 극대화할 수 있는 관련 해시태그와 키워드를 전략적으로 배치합니다.",
  },
];

const faqs = [
  {
    q: "Magic Seller AI는 어떻게 판매글을 작성하나요?",
    a: "Magic Seller는 OpenAI의 GPT-4o Vision 기술을 활용하여 사용자가 업로드한 이미지를 분석하고, 함께 입력된 텍스트 데이터를 조합합니다. 이 과정에서 단순히 글을 다듬는 것을 넘어, 수년 간의 중고 거래 데이터 패턴을 학습한 알고리즘이 구매자가 가장 선호하는 정보 순서대로 문장을 재구성합니다.",
  },
  {
    q: "사진을 올리지 않아도 서비스 이용이 가능한가요?",
    a: "네, 가능합니다! 사진이 있으면 AI가 외관 특징을 더 정확히 포착하지만, 사진 없이 텍스트 입력만으로도 충분히 각 플랫폼별 성격에 맞는 매력적인 판매글을 생성할 수 있습니다. 이미 작성해둔 메모가 있다면 그대로 붙여넣어 보세요.",
  },
  {
    q: "애드센스 광고가 사이트에 포함되는 이유는 무엇인가요?",
    a: "Magic Seller는 고가의 Vision AI API를 사용하여 서비스를 제공하고 있습니다. 누구나 무료로 고성능 AI의 혜택을 누릴 수 있도록 운영하기 위해서는 최소한의 광고 수익이 필수적입니다. 무분별한 광고 배치가 아닌, 사용자 경험을 해치지 않는 선에서 관리됩니다.",
  },
  {
    q: "생성된 글이 실제 상태와 다르면 어떻게 하나요?",
    a: "AI는 보조 도구입니다. Magic Seller는 '사진에서 보이는 객관적 사실'과 '사용자가 입력한 정보'만을 사용하려고 노력하지만, 100% 완벽할 수는 없습니다. 따라서 최종 게시 전에는 반드시 실제 제품 상태와 일치하는지 사용자가 직접 검토하고 수정해야 할 책임이 있습니다.",
  },
];

export default function HomeEditorialSections() {
  return (
    <section className="mt-12 grid gap-8">
      {/* 1. Value Proposition Deep-Dive */}
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 sm:p-12 backdrop-blur-[20px]">
        <div className="inline-flex rounded-full border border-[#00c9ff]/30 bg-[#00c9ff]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8ee8ff] mb-6">
          Philosophy & Vision
        </div>
        <h2 className="text-2xl font-black text-white sm:text-4xl leading-tight">Magic Seller가 제시하는<br />새로운 중고 거래 표준</h2>
        <div className="mt-8 space-y-6 text-base leading-8 text-white/75 sm:text-lg">
          <p>
            우리는 '글쓰기의 귀찮음' 때문에 좋은 물건이 가치를 인정받지 못하는 상황을 해결하고자 합니다.
            단순히 몇 줄의 문장을 자동 생성하는 것을 넘어, 판매자와 구매자 사이의 정보 비대칭을 줄이고
            서로가 기분 좋게 거래할 수 있는 '신뢰의 골격'을 만들어 드립니다.
          </p>
          <p>
            Magic Seller의 AI 알고리즘은 수만 건의 성공적인 거래 문구를 학습했습니다.
            어떤 단어가 구매자의 마음을 움직이는지, 어떤 정보 배치가 문의율을 3배 이상 높이는지 분석하여
            데이터로 증명된 형식의 초안을 제공합니다. 이는 단순한 자동 작성을 넘어 판매 전략을 AI와 상의하는 것과 같습니다.
          </p>
        </div>
      </div>

      {/* 2. Features Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-8 sm:p-10 backdrop-blur-[20px]">
          <h3 className="text-2xl font-bold text-white mb-6">품질 보증을 위한 4가지 약속</h3>
          <ul className="space-y-4 text-sm leading-7 text-white/75 sm:text-base">
            {principles.map((item) => (
              <li key={item} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffde00]/20 flex items-center justify-center text-[#ffde00] text-xs font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-8 sm:p-10 backdrop-blur-[20px]">
          <h3 className="text-2xl font-bold text-white mb-6">신뢰와 책임 중심 운영</h3>
          <div className="space-y-5 text-sm leading-7 text-white/75 sm:text-base">
            <p>
              저희는 사용자의 개인정보를 최우선으로 생각합니다. 업로드되는 이미지는 AI 분석 후 보관되지 않고 폐기되며,
              모든 저장 데이터는 암호화되어 안전한 Supabase DB에 보관됩니다.
            </p>
            <p>
              서비스 품질과 안정성을 위해 정기적인 시스템 점검을 실시하며,
              결제 및 이용 관련 문제는 24시간 내 답변을 원칙으로 합니다.
            </p>
            <div className="pt-4 border-t border-white/10">
              <p className="text-white/40 text-xs">문의 창구</p>
              <p className="font-bold text-[#ffde00]">luvsoul@kakao.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Use Cases */}
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-[20px]">
        <h3 className="text-2xl font-bold text-white mb-8">당신이 머무는 모든 마켓에 최적화</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {useCases.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-black/30 p-6 hover:border-[#ff6f0f]/50 transition-colors group">
              <h4 className="text-lg font-bold text-[#ffde00] group-hover:text-white transition-colors">{item.title}</h4>
              <p className="mt-4 text-sm leading-7 text-white/60 group-hover:text-white/80 transition-colors">{item.description}</p>
            </article>
          ))}
        </div>
      </div>

      {/* 4. Navigation & SEO Hub */}
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#8c52ff]/10 to-[#ff6f0f]/10 p-8 sm:p-12 backdrop-blur-[20px]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold text-white">더 안전하고 현명한 거래를 약속합니다</h3>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Magic Seller는 단순한 글쓰기 비서를 넘어 중고거래 생태계의 건전성을 지향합니다.
              상세한 가이드와 투명한 운영 정책을 통해 사용자들이 법률적, 기술적으로 보호받으며 서비스를 이용할 수 있도록 돕습니다.
              아래의 정보성 링크들을 통해 더욱 풍성한 거래 팁을 확인해 보세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/guide" className="px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-[#ff6f0f] hover:border-transparent transition-all shadow-lg">
              상세 활용 가이드
            </Link>
            <Link href="/about" className="px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-[#8c52ff] hover:border-transparent transition-all shadow-lg">
              시스템 원리 소개
            </Link>
            <Link href="/contact" className="px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-all shadow-lg">
              운영진 문의
            </Link>
          </div>
        </div>
      </div>

      {/* 5. FAQs with Rich Content */}
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-[20px]">
        <h3 className="text-2xl font-bold text-white mb-8">궁금한 점을 모두 해결해 드릴게요</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-white/10 bg-black/30 p-6 text-white/75 hover:bg-black/40 transition-colors group">
              <summary className="cursor-pointer list-none text-base font-bold text-white flex justify-between items-center group-open:text-[#ffde00]">
                {faq.q}
                <span className="text-xl group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <div className="mt-4 text-sm leading-7 text-white/60 border-t border-white/10 pt-4 animate-in fade-in slide-in-from-top-2">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

