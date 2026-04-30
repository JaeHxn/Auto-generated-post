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
            우리는 &lsquo;글쓰기의 귀찮음&rsquo; 때문에 좋은 물건이 가치를 인정받지 못하는 상황을 해결하고자 합니다.
            단순히 몇 줄의 문장을 자동 생성하는 것을 넘어, 판매자와 구매자 사이의 정보 비대칭을 줄이고
            서로가 기분 좋게 거래할 수 있는 &lsquo;신뢰의 골격&rsquo;을 만들어 드립니다.
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

      {/* 3.5. Rich Content Guide (AdSense SEO Optimization) */}
      <article className="rounded-[28px] border border-white/10 bg-gradient-to-b from-[#1a1030] to-black p-8 sm:p-12 backdrop-blur-[20px]">
        <header className="mb-8">
          <div className="inline-flex rounded-full border border-[#ff6f0f]/30 bg-[#ff6f0f]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#ffa366] mb-6">
            Expert Guide
          </div>
          <h2 className="text-2xl font-black text-white sm:text-3xl leading-tight mb-4">
            중고거래 전문가가 알려주는 100% 판매 성공 비법
          </h2>
          <p className="text-white/60">당근마켓, 중고나라, 번개장터에서 내 물건의 가치를 제대로 인정받는 실전 가이드</p>
        </header>
        
        <div className="space-y-10 text-white/80 leading-relaxed text-sm sm:text-base">
          <section>
            <h3 className="text-xl font-bold text-[#ffde00] mb-4">1. 첫인상을 결정하는 '사진 촬영'의 기술</h3>
            <p className="mb-3">온라인 중고거래에서 사진은 오프라인 매장의 쇼윈도와 같습니다. 구매자는 가장 먼저 사진의 퀄리티로 판매자의 신뢰도를 무의식중에 평가합니다.</p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong>자연광 활용하기:</strong> 실내 형광등 아래보다는 낮 시간대 창가에서 들어오는 자연광을 활용하세요. 제품의 실제 색상과 질감이 가장 정확하게 표현됩니다.</li>
              <li><strong>배경은 최대한 단순하게:</strong> 복잡한 방 내부가 배경으로 나오면 제품에 대한 집중도가 떨어집니다. 깨끗한 책상 위나 단색 배경지, 또는 깔끔한 바닥에서 촬영하세요.</li>
              <li><strong>하자 부위는 숨기지 말고 클로즈업:</strong> 기스나 찍힘 등 하자가 있는 부분은 솔직하게 확대해서 보여주세요. 오히려 '투명하게 공개하는 판매자'라는 인식을 주어 신뢰도가 급상승합니다.</li>
              <li><strong>구성품 전체 샷 필수:</strong> 박스, 영수증, 케이블 등 모든 구성품을 한 번에 모아놓고 찍은 '풀샷'이 첫 번째 사진으로 가장 좋습니다.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#ffde00] mb-4">2. 구매 확률을 3배 높이는 '본문 작성' 공식</h3>
            <p className="mb-3">글쓰기가 막막하다면 다음의 4단계 구조를 기억하세요. Magic Seller AI 역시 이 검증된 구조를 기반으로 작동합니다.</p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong>핵심 정보 전면 배치:</strong> 구매처, 구매 시기, 정품 여부, AS 잔여 기간을 글의 가장 상단에 배치하세요. 구매자가 가장 궁금해하는 정보입니다.</li>
              <li><strong>스토리텔링 결합:</strong> "돈이 필요해서 팝니다" 보다는 "새 모델로 기변하게 되어 소중히 쓰던 물건을 내놓습니다"가 낫습니다. 물건을 아껴 썼다는 인상을 줍니다.</li>
              <li><strong>명확한 거래 조건:</strong> 직거래 선호 지역(구체적인 지하철역이나 건물명), 택배 가능 여부, 네고(가격 절충) 가능 여부를 단호하되 정중하게 명시하세요. 불필요한 감정 소모를 줄여줍니다.</li>
              <li><strong>검색어 최적화(SEO):</strong> 본문 하단에는 제품명과 연관된 동의어나 오타(예: 에어팟, 에어팟프로, 에어팟 프로 2세대)를 자연스럽게 태그로 달아주어 검색 노출 확률을 높입니다.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#ffde00] mb-4">3. 플랫폼별 맞춤 타겟팅 전략</h3>
            <p className="mb-3">같은 물건이라도 플랫폼의 특성에 따라 접근 방식을 달리해야 합니다.</p>
            <div className="bg-white/5 rounded-xl p-6 mt-4 border border-white/10">
              <h4 className="font-bold text-[#ff6f0f] mb-2">🥕 당근마켓 (지역 기반)</h4>
              <p className="text-sm text-white/70 mb-4">친근함이 무기입니다. "동네 이웃분과 기분 좋게 거래하고 싶어요" 같은 멘트가 효과적입니다. 무거운 가구나 직거래가 필수인 제품 판매에 가장 적합합니다.</p>
              
              <h4 className="font-bold text-[#00c9ff] mb-2">📦 중고나라 (전국 기반, 방대한 트래픽)</h4>
              <p className="text-sm text-white/70 mb-4">정보의 정확성과 안전결제가 핵심입니다. 사기 피해를 걱정하는 구매자가 많으므로 '안전결제 환영', '직접 촬영한 인증샷', '과거 거래 내역' 등을 어필하는 것이 좋습니다.</p>
              
              <h4 className="font-bold text-[#8c52ff] mb-2">⚡ 번개장터 (MZ/Z세대, 취향 기반)</h4>
              <p className="text-sm text-white/70">전자기기, 패션, 스니커즈, 아이돌 굿즈 등 한정판이나 트렌디한 아이템 판매에 최적화되어 있습니다. 해시태그를 최대한 활용하고, 트렌디한 용어(미시착 새상품, 극미중고 등)를 적절히 섞어 쓰는 것이 유리합니다.</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#ffde00] mb-4">4. 가격 책정의 심리학</h3>
            <p className="mb-3">적절한 가격 책정이야말로 빠른 판매의 핵심입니다.</p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong>시세 하위 10% 공략:</strong> 빠른 처분이 목적이라면 현재 검색되는 동일 상태 제품들의 하위 10% 가격에 맞추세요. 당일 판매 확률이 압도적으로 높습니다.</li>
              <li><strong>네고 마진 포함하기:</strong> 구매자는 깎는 재미를 원합니다. 목표 가격이 10만 원이라면 11만 원에 올리고 "쿨거래 시 1만 원 네고해 드립니다"라고 제안하는 것이 심리적으로 더 큰 만족감을 줍니다.</li>
              <li><strong>끝자리 9의 마법:</strong> 100,000원 보다는 99,000원이 심리적으로 훨씬 저렴하게 느껴집니다. 대형 마트의 가격표 전략을 중고거래에도 적용해 보세요.</li>
            </ul>
          </section>

          <div className="mt-8 p-6 bg-gradient-to-r from-[#ff416c]/20 to-[#8c52ff]/20 rounded-xl border border-white/10">
            <p className="text-sm font-bold text-white mb-2">💡 Magic Seller를 활용한 초간단 팁</p>
            <p className="text-sm text-white/70">이 모든 복잡한 과정과 전략을 일일이 신경 쓰기 힘들다면? 제품 사진 한 장만 찍고 Magic Seller에게 맡겨보세요. AI가 위에서 언급한 모든 판매 심리학과 플랫폼별 특성을 반영하여 완벽한 초안을 단 10초 만에 작성해 드립니다.</p>
          </div>
        </div>
      </article>

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

