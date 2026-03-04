"use client";

import { useState, useRef } from "react";
import { Copy, Sparkles, CreditCard, Star, Share2 } from "lucide-react";
import { generateSellerCopy } from "./actions";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

type GachaState = "hidden" | "card_ready" | "card_flipped" | "result";

export default function Home() {
  const [formData, setFormData] = useState({
    birthYear: "",
    gender: "",
    itemName: "",
    itemDetails: "",
  });

  const [gachaState, setGachaState] = useState<GachaState>("hidden");
  const [resultText, setResultText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false); // API 호출 중 여부
  const [isCopied, setIsCopied] = useState(false);
  const apiResultRef = useRef<string | null>(null); // API 결과 임시 보관

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateClick = async () => {
    if (!formData.birthYear || !formData.gender || !formData.itemName || !formData.itemDetails) {
      alert("물품의 핵심 내용과 판매자 프로필을 모두 입력해주세요! 😎");
      return;
    }

    // 1. 즉시 카드 모달 오픈 + API 백그라운드 호출 동시 시작
    apiResultRef.current = null;
    setIsGenerating(true);
    setGachaState("card_ready");

    // API 호출은 백그라운드에서 진행
    generateSellerCopy({
      birthYear: Number(formData.birthYear),
      gender: formData.gender,
      itemName: formData.itemName,
      itemDetails: formData.itemDetails,
    }).then((res) => {
      apiResultRef.current = res.text || "에러 발생";
      setIsGenerating(false);
      // 이미 카드가 뒤집혀 있는 경우 바로 결과 표시
      setGachaState((prev) => {
        if (prev === "card_flipped") {
          setTimeout(() => showResult(res.text || "에러 발생"), 0);
        }
        return prev;
      });
    });
  };

  const throwConfetti = () => {
    const colors = ["#ff416c", "#8c52ff", "#ff6f0f", "#00c9ff", "#ffde00", "#00ff88", "#FFF", "#FFEAA7"];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;top:-20px;width:10px;height:10px;z-index:9999;left:${Math.random() * 100}vw;background:${colors[Math.floor(Math.random() * colors.length)]};animation:fall 3s linear ${Math.random() * 2}s forwards;border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`;
      document.body.appendChild(el);
      setTimeout(() => el.parentNode?.removeChild(el), 5000);
    }
  };

  const showResult = (text: string) => {
    // Add watermark
    const watermarkedText = `${text}\n\n---\n🪄 이 글은 Magic Seller AI가 작성했습니다\n👉 https://magic-seller.pages.dev`;

    // Initial big confetti for celebration
    triggerAwesomeConfetti();

    setTimeout(() => {
      setGachaState("result");
      setResultText(watermarkedText);
      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 600);
  };

  const triggerAwesomeConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff416c', '#8c52ff', '#ff6f0f', '#00c9ff', '#ffde00']
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ff416c', '#8c52ff', '#ff6f0f', '#00c9ff', '#ffde00']
      });
    }, 250);
  };

  const handleCardClick = () => {
    if (gachaState !== "card_ready") return;

    // 2. 카드 즉시 뒤집기
    setGachaState("card_flipped");

    // API가 이미 완료된 경우 바로 결과 표시
    if (!isGenerating && apiResultRef.current !== null) {
      showResult(apiResultRef.current);
    }
    // isGenerating이 true면 API 완료 후 위 .then()에서 처리됨
  };

  const copyToClipboard = () => {
    const doCopy = () => {
      setIsCopied(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#ff6f0f', '#ffde00', '#ffffff']
      });
      setTimeout(() => setIsCopied(false), 3000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(resultText).then(doCopy).catch(() => {
        // fallback
        const el = document.createElement("textarea");
        el.value = resultText;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        doCopy();
      });
    } else {
      // fallback for HTTP / old browsers
      const el = document.createElement("textarea");
      el.value = resultText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      doCopy();
    }
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Magic Seller AI 프리미엄 판매글",
          text: resultText,
        });
        // Confetti on successful share
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#8c52ff', '#00c9ff', '#ffffff']
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <main className="container mx-auto max-w-[650px] px-5 py-12 relative">
        <header className="text-center mb-10">
          <div className="inline-block bg-gradient-to-r from-[#ffb88c] to-[#ff6f0f] text-black text-xs font-black px-4 py-1.5 rounded-full mb-3 tracking-wider">
            PRO VERSION
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight font-outfit m-0">
            Magic <span className="bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] text-transparent bg-clip-text">Seller</span>
          </h1>
          <p className="text-[#b3b3b3] text-lg mt-3">당신의 중고물품, 명품처럼 포장해 드립니다 🥕</p>
        </header>

        <section className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] relative mt-5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="flex items-center text-white font-semibold mb-2 text-base">
                판매자 프로필
                <span className="bg-[#ff6f0f]/20 text-[#ff6f0f] border border-[#ff6f0f]/30 text-xs px-2.5 py-1 rounded-full ml-3 font-bold">신뢰도 상승용</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number" name="birthYear" value={formData.birthYear} onChange={handleInputChange}
                  className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans"
                  placeholder="출생연도 (예: 1990)" min="1940" max="2015"
                />
                <select
                  name="gender" value={formData.gender} onChange={handleInputChange}
                  className="w-full bg-black/25 border-[1.5px] border-white/10 text-white/70 p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans appearance-none"
                >
                  <option value="" disabled>성별 선택</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-white font-semibold mb-2 text-base">판매할 물품명</label>
              <input
                type="text" name="itemName" value={formData.itemName} onChange={handleInputChange}
                className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans"
                placeholder="예: 다이슨 에어랩 컴플리트 롱, 아이패드 미니"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white font-semibold mb-2 text-base">핵심 특징 및 상태 (장단점 솔직하게)</label>
              <textarea
                name="itemDetails" value={formData.itemDetails} onChange={handleInputChange}
                className="w-full h-[120px] resize-none bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans leading-relaxed"
                placeholder="예: 3년 썼는데 케이스 씌워 써서 상태 좋습니다. 모서리 미세 찍힘 하나 있음. 쿨거래 시 만원 네고."
              ></textarea>
            </div>

            <button
              type="button" onClick={handleGenerateClick}
              className="mt-4 relative overflow-hidden bg-gradient-to-br from-[#ff416c] to-[#ff6f0f] text-white p-5 rounded-2xl text-[1.15rem] font-extrabold cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(255,111,15,0.6)] shadow-[0_8px_25px_rgba(255,111,15,0.4)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                초프리미엄 판매글 생성하기 <Sparkles size={20} />
              </span>
              <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]"></div>
            </button>
          </div>
        </section>

        {/* 가챠 카드 모달 */}
        {(gachaState === "card_ready" || gachaState === "card_flipped") && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl"></div>

            <div className="relative z-50 flex flex-col items-center justify-center w-full max-w-sm perspective-1000">

              {/* 안내 텍스트 */}
              <div className="text-center mb-10 min-h-[60px]">
                {gachaState === "card_ready" && (
                  <div className="animate-[slideUp_0.4s_ease-out]">
                    <p className="text-white text-xl font-bold animate-bounce">👇 카드를 터치하여 결과를 확인하세요 👇</p>
                  </div>
                )}
                {gachaState === "card_flipped" && (
                  <div className="animate-[slideUp_0.4s_ease-out]">
                    <p className="text-[#ffde00] text-base font-semibold animate-pulse">🤖 AI가 당신만의 프리미엄 판매글을 작성 중입니다...</p>
                  </div>
                )}
              </div>

              {/* 3D 카드 */}
              <div
                className={`relative w-[280px] h-[400px] transform-style-3d transition-transform duration-[900ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${gachaState === "card_flipped" ? "rotate-y-180" : "cursor-pointer hover:scale-105 hover:rotate-[-2deg]"}`}
                onClick={handleCardClick}
              >
                {/* 뒷면 (탭 전) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-white/20 bg-gradient-to-br from-[#120e1f] to-[#1e1438] flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8c52ff]/20 to-transparent"></div>
                  {/* 테두리 빛 */}
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_3s_linear_infinite] z-[-1] blur-md opacity-30"></div>
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] flex justify-center items-center shadow-[0_0_30px_#ff6f0f] border-[3px] border-[#ffde00]/50">
                      <CreditCard size={40} className="text-white" />
                    </div>
                    <div className="text-[#ffde00] font-black text-2xl tracking-widest drop-shadow-[0_0_5px_currentColor]">SECRET</div>
                    <div className="text-white/50 text-xs tracking-widest uppercase font-mono border-t border-white/20 pt-2 w-[60%] text-center">Tap to Open</div>
                  </div>
                  <div className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]"></div>
                </div>

                {/* 앞면 (뒤집힌 후) — AI 로딩 스피너 */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] shadow-[0_0_60px_rgba(255,222,0,0.5)] border-[3px] border-[#ffde00] bg-gradient-to-br from-[#ffe066] via-[#ffde00] to-[#e6b800] flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-2 rounded-[16px] bg-gradient-to-b from-white/20 to-transparent flex flex-col items-center justify-center gap-5 p-6">
                    {/* 별 */}
                    <div className="flex gap-1 text-[#d48900]">
                      <Star fill="currentColor" size={20} />
                      <Star fill="currentColor" size={28} className="animate-pulse" />
                      <Star fill="currentColor" size={20} />
                    </div>
                    {/* 애플 스타일 스피너 */}
                    <div className="w-14 h-14 rounded-full border-[5px] border-[#b38e00]/30 border-t-[#5c4a00] animate-spin"></div>
                    <div className="text-center">
                      <p className="text-[#5c4a00] font-black text-lg leading-tight">AI 글쓰기 중...</p>
                      <p className="text-[#8a6e00] text-xs mt-1 font-medium">잠시만 기다려주세요 ✍️</p>
                    </div>
                    <div className="text-[#5c4a00]/60 text-[0.6rem] font-black tracking-[0.2em] font-mono">MAGIC SELLER</div>
                  </div>
                  {/* 빛 스윕 */}
                  <div className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-30deg] animate-[shine_2.5s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        <AnimatePresence>
          {gachaState === "result" && (
            <motion.section
              id="result-section"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="mt-10 bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
            >
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[#ffde00] text-2xl font-bold mt-0 mb-6 flex items-center gap-2"
              >
                🎉 당신만을 위한 스위트 세일즈 피치
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="bg-black/35 p-6 md:p-8 rounded-2xl text-[1.05rem] leading-[1.8] text-[#e6e6e6] font-light border-l-[5px] border-[#ffde00] whitespace-pre-wrap shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-bl from-white/5 to-transparent skew-x-[-20deg] translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000 ease-in-out"></div>
                {resultText}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 p-4 rounded-2xl font-bold text-[1.1rem] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] ${isCopied ? "bg-[#ff6f0f] text-white border-transparent shadow-[0_0_20px_rgba(255,111,15,0.5)]" : "bg-transparent border-2 border-[#ff6f0f]/50 text-[#ffa366] hover:bg-[#ff6f0f]/10 hover:border-[#ff6f0f] hover:text-white"}`}
                >
                  {isCopied ? "✅ 복사 완료! 당근에 붙여넣으세요" : <><Copy size={20} /> 복사해서 당근에 붙여넣기</>}
                </button>

                <button
                  onClick={shareResult}
                  className="flex-1 p-4 rounded-2xl font-bold text-[1.1rem] transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#8c52ff] to-[#00c9ff] text-white shadow-[0_5px_15px_rgba(140,82,255,0.4)] hover:shadow-[0_8px_25px_rgba(140,82,255,0.6)] transform hover:scale-[1.02] active:scale-[0.98] border-none"
                >
                  <Share2 size={20} /> 친구에게 자랑하기
                </button>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* 구글 애드센스 승인 및 SEO를 위한 고품질 텍스트 섹션 */}
      <section className="container mx-auto max-w-[800px] px-5 pb-20 pt-10">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-white/80">
          <h2 className="text-2xl font-bold mb-4 text-white">당근마켓과 중고거래, 이제 '매직 셀러'로 완벽하게 판매하세요</h2>
          <p className="mb-6 leading-relaxed text-sm">
            중고나라, 번개장터, 당근마켓 등 다양한 중고거래 플랫폼에서 물건을 판매할 때 가장 고민되는 것은 바로 <strong>'어떻게 글을 써야 물건이 제값에 잘 팔릴까?'</strong>입니다. 매직 셀러(Magic Seller)는 최신 AI 기술을 활용하여 당신의 평범한 중고 물품을 마치 명품 브랜드의 한정판처럼 매력적으로 포장해주는 <strong>프리미엄 중고거래 카피라이팅 자동 생성 서비스</strong>입니다.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-[#ffde00]">왜 매직 셀러를 사용해야 할까요?</h3>
          <ul className="list-disc pl-5 mb-6 space-y-2 text-sm">
            <li><strong>클릭률 상승:</strong> 구매자의 눈길을 사로잡는 마케팅 기반의 매력적인 제목과 도입부를 작성해 줍니다.</li>
            <li><strong>신뢰도 극대화:</strong> 단점을 숨기지 않으면서도 그것을 장점으로 승화시키는 '스위트 세일즈 피치(Sweet Sales Pitch)' 기법을 적용합니다.</li>
            <li><strong>시간 절약:</strong> 사진 상태나 연식, 모델명 몇 가지만 입력하면 3초 만에 완벽한 판매글이 생성됩니다.</li>
            <li><strong>맞춤형 페르소나:</strong> 판매자의 연령대와 성별에 맞춘 자연스럽고 신뢰감 있는 톤앤매너로 글을 작성하여 직거래 시의 어색함을 줄여줍니다.</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-[#ffde00]">어떻게 사용하나요? (사용 방법)</h3>
          <ol className="list-decimal pl-5 mb-6 space-y-2 text-sm">
            <li><strong>판매자 프로필 입력:</strong> 본인의 출생 연도와 성별을 선택해 주세요. AI가 이 정보를 바탕으로 가장 자연스럽고 신뢰감을 주는 문체를 설정합니다.</li>
            <li><strong>물품명 입력:</strong> 판매할 물건의 정확한 모델명이나 기기명을 입력합니다. (예: 아이폰 15 프로 256GB, 나이키 에어포스 1 등)</li>
            <li><strong>핵심 상태 작성:</strong> 물건의 장단점을 솔직하게 적어주세요. "액정에 미세한 기스가 있다"고 솔직히 적어도, AI가 구매자가 납득할 수 있는 감성적이고 정중한 표현으로 완화해 줍니다.</li>
            <li><strong>생성 버튼 클릭:</strong> '초프리미엄 판매글 생성하기' 버튼을 누르면 AI 카드가 등장하며 글이 완성됩니다. 완성된 글은 복사하여 당근 앱에 바로 붙여넣어 보세요!</li>
          </ol>

          <p className="text-xs text-white/50 border-t border-white/10 pt-4">
            * 매직 셀러는 누구나 무료로 이용할 수 있는 AI 기반 툴입니다. 지속적인 업데이트를 통해 향후 인스타그램 맞춤형 페르소나, 이미지 자동 판독(Vision AI) 등 다양한 B2C, B2B 마케팅 기능을 제공할 예정입니다. 본 서비스는 안전하고 따뜻한 중고거래 문화를 지향합니다.
          </p>
        </div>
      </section>
    </>
  );
}
