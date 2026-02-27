"use client";

import { useState } from "react";
import { Copy, Sparkles, AlertCircle, CreditCard, Star } from "lucide-react";
import { generateSellerCopy } from "./actions";

export default function Home() {
  const [formData, setFormData] = useState({
    birthYear: "",
    gender: "",
    itemName: "",
    itemDetails: "",
  });

  // Gacha states: hidden -> generating -> ready -> opened
  const [gachaState, setGachaState] = useState<"hidden" | "generating" | "ready" | "opened">("hidden");

  const [resultText, setResultText] = useState("");
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [tempResult, setTempResult] = useState(""); // Holds API result before card opens

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenerateClick = async () => {
    if (!formData.birthYear || !formData.gender || !formData.itemName || !formData.itemDetails) {
      alert("물품의 핵심 내용과 판매자 프로필을 모두 입력해주세요! 😎");
      return;
    }

    // 모달 오픈 -> 로딩 (흔들리는 모션)
    setGachaState("generating");

    // API 호출 (가챠 대기 시간)
    const res = await generateSellerCopy({
      birthYear: Number(formData.birthYear),
      gender: formData.gender,
      itemName: formData.itemName,
      itemDetails: formData.itemDetails,
    });

    if (res.success && res.text) {
      setTempResult(res.text);
    } else {
      setTempResult(res.text || "에러 발생");
    }

    // 약간의 딜레이를 더 주어 가챠 기대감을 높임
    setTimeout(() => {
      setGachaState("ready");
    }, 1200);
  };

  const throwConfetti = () => {
    const colors = ["#ff416c", "#8c52ff", "#ff6f0f", "#00c9ff", "#ffde00", "#00ff88", "#FFF", "#FFEAA7"];
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("fixed", "top-[-20px]", "w-3", "h-3", "z-[9999]", "animate-[fall_3s_linear_forwards]", "rounded-sm");
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDelay = Math.random() * 2 + "s";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      if (Math.random() > 0.5) confetti.style.borderRadius = "50%";
      document.body.appendChild(confetti);
      setTimeout(() => {
        if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
      }, 5000);
    }
  };

  const handleCardOpen = () => {
    if (gachaState !== "ready") return;

    setGachaState("opened");
    throwConfetti();

    // 카드가 뒤집어지는 동안 대기 후 화면 모달 닫고 결과 표시
    setTimeout(() => {
      setGachaState("hidden");
      setResultText(tempResult);
      setIsResultVisible(true);

      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 2800); // 카드가 뒤집히고 결과를 보여주는 충분한 딜레이 부여
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  return (
    <main className="container mx-auto max-w-[650px] px-5 py-12 relative">
      <header className="text-center mb-10">
        <div className="inline-block bg-gradient-to-r from-[#ffb88c] to-[#ff6f0f] text-black text-xs font-black px-4 py-1.5 rounded-full mb-3 tracking-wider">
          PRO VERSION
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight font-outfit m-0">
          Magic <span className="bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] text-transparent bg-clip-text">Seller</span>
        </h1>
        <p className="text-[#b3b3b3] text-lg mt-3">
          당신의 중고물품, 명품처럼 포장해 드립니다 🥕
        </p>
      </header>

      <section className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] relative mt-5">
        <div className="flex flex-col gap-6">

          <div className="flex flex-col">
            <label className="flex items-center text-white font-semibold mb-2 text-base">
              판매자 프로필 <span className="bg-[#ff6f0f]/20 text-[#ff6f0f] border border-[#ff6f0f]/30 text-xs px-2.5 py-1 rounded-full ml-3 font-bold">신뢰도 상승용</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number" name="birthYear" value={formData.birthYear} onChange={handleInputChange}
                className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans"
                placeholder="출생연도 (예: 1990)" min="1940" max="2015" required
              />
              <select
                name="gender" value={formData.gender} onChange={handleInputChange}
                className="w-full bg-black/25 border-[1.5px] border-white/10 text-white/70 p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans appearance-none"
                required
              >
                <option value="" disabled>성별 선택</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="flex items-center text-white font-semibold mb-2 text-base">판매할 물품명</label>
            <input
              type="text" name="itemName" value={formData.itemName} onChange={handleInputChange}
              className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans"
              placeholder="예: 다이슨 에어랩 컴플리트 롱, 아이패드 미니" required
            />
          </div>

          <div className="flex flex-col">
            <label className="flex items-center text-white font-semibold mb-2 text-base">핵심 특징 및 상태 (장단점 솔직하게)</label>
            <textarea
              name="itemDetails" value={formData.itemDetails} onChange={handleInputChange}
              className="w-full h-[120px] resize-none bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans leading-relaxed"
              placeholder="예: 3년 썼는데 케이스 씌워 써서 상태 좋습니다. 모서리 아주 미세한 찍힘 하나 있음. 쿨거래 시 만원 네고해드려요." required
            ></textarea>
          </div>

          <button
            type="button"
            onClick={handleGenerateClick}
            className="mt-4 relative overflow-hidden bg-gradient-to-br from-[#ff416c] to-[#ff6f0f] text-white p-5 rounded-2xl text-[1.15rem] font-extrabold cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(255,111,15,0.6)] shadow-[0_8px_25px_rgba(255,111,15,0.4)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              초프리미엄 판매글 생성하기 <Sparkles size={20} />
            </span>
            <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]"></div>
          </button>
        </div>
      </section>

      {/* 가챠 화이트 번쩍임 이펙트 레이어 */}
      {gachaState === "opened" && (
        <>
          <div className="fixed inset-0 z-[100] pointer-events-none animate-gacha-flash"></div>
          <div className="fixed top-1/2 left-1/2 -ml-[250px] -mt-[250px] w-[500px] h-[500px] bg-gradient-to-tr from-[#ffe600] to-transparent rounded-full opacity-0 z-[40] animate-sunburst pointer-events-none mix-blend-screen"></div>
        </>
      )}

      {/* 가챠 카드 드로우 모달 */}
      {gachaState !== "hidden" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl"></div>

          <div className="relative z-50 flex flex-col items-center justify-center w-full max-w-sm perspective-1000">

            {/* 상단 텍스트 영역 */}
            <div className="text-center mb-10 min-h-[80px]">
              {gachaState === "generating" && (
                <div className="animate-pulse">
                  <h2 className="text-[#ffde00] text-2xl font-black drop-shadow-[0_0_10px_rgba(255,222,0,0.8)] mb-2 inline-flex items-center gap-2">
                    <Sparkles size={24} /> AI가 카피를 깎는 중...
                  </h2>
                  <p className="text-white/60 text-sm font-light mt-2">마법의 주문을 외우고 있어요. 잠시만 기다려주세요 🧙‍♂️</p>
                </div>
              )}

              {gachaState === "ready" && (
                <div className="animate-[slideUp_0.5s_ease-out]">
                  <h2 className="text-[#00ff88] text-3xl font-black drop-shadow-[0_0_15px_rgba(0,255,136,0.8)] mb-2 animate-pulse">
                    카피 작성 완료! ✨
                  </h2>
                  <p className="text-white text-lg font-bold mt-2 animate-bounce">
                    👇 카드를 터치하여 결과를 확인하세요 👇
                  </p>
                </div>
              )}
            </div>

            {/* 카드 3D 래퍼 */}
            <div
              className={`relative w-[280px] h-[400px] cursor-pointer transform-style-3d transition-transform duration-[1200ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${gachaState === 'opened' ? 'rotate-y-180 scale-[1.15]' : (gachaState === 'generating' ? 'animate-card-shake' : 'hover:scale-105')}`}
              onClick={handleCardOpen}
            >
              {/* 카드 뒷면 (뽑기 전) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-white/20 bg-gradient-to-br from-[#120e1f] to-[#1e1438] flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8c52ff]/20 to-transparent"></div>

                <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] flex justify-center items-center shadow-[0_0_30px_#ff6f0f] mb-4 border-[3px] border-[#ffde00]/50">
                  <CreditCard size={40} className="text-white" />
                </div>
                <div className="text-[#ffde00] font-black text-2xl tracking-widest drop-shadow-[0_0_5px_currentColor]">SECRET</div>
                <div className="text-white/50 text-xs tracking-widest mt-2 uppercase font-mono border-t border-white/20 pt-2 w-[60%] text-center">Tap to Open</div>

                {/* 대기 중일 때 테두리 도는 빛 효과 */}
                {(gachaState === 'ready' || gachaState === 'generating') && (
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_3s_linear_infinite] z-[-1] blur-md opacity-30"></div>
                )}
              </div>

              {/* 카드 앞면 (결과 짠) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] shadow-[0_0_80px_rgba(255,222,0,0.6)] border-[3px] border-[#ffde00] bg-gradient-to-br from-[#ffe066] via-[#ffde00] to-[#e6b800] flex flex-col items-center justify-center overflow-hidden">

                {/* 카드 앞면 내부 디자인 */}
                <div className="absolute inset-2 border border-[#856b00]/30 rounded-[16px] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white/20 to-transparent">
                  <div className="flex gap-1 mb-4 text-[#d48900]">
                    <Star fill="currentColor" size={24} className="animate-spin-slow" />
                    <Star fill="currentColor" size={32} className="animate-pulse" />
                    <Star fill="currentColor" size={24} className="animate-spin-slow" />
                  </div>
                  <h3 className="text-[#5c4a00] font-black text-3xl font-outfit text-center leading-tight drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)]">
                    VIP<br /><span className="text-[1.8rem]">PREMIUM</span>
                  </h3>
                  <div className="bg-[#b38e00] w-full h-[1px] my-5 opacity-40"></div>
                  <p className="text-[#5c4a00] font-bold text-lg text-center font-sans tracking-tight">
                    상위 1% 감성<br />판매글 확정!
                  </p>

                  <div className="mt-6 text-[#5c4a00]/70 text-[0.65rem] font-black tracking-[0.2em] font-mono">
                    MAGIC SELLER
                  </div>
                </div>

                {/* 빛 반사 스윕 빔 */}
                <div className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-30deg] animate-[shine_2.5s_infinite]"></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 결과 화면 섹션 */}
      {isResultVisible && (
        <section id="result-section" className="mt-10 bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-slideUp">
          <h2 className="text-[#ffde00] text-2xl font-bold mt-0 mb-6 flex items-center gap-2">
            🎉 당신만을 위한 스위트 세일즈 피치
          </h2>
          <div className="bg-black/35 p-6 md:p-8 rounded-2xl text-[1.05rem] leading-[1.8] text-[#e6e6e6] font-light border-l-[5px] border-[#ffde00] whitespace-pre-wrap shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
            {resultText}
          </div>
          <button
            onClick={copyToClipboard}
            className={`mt-6 w-full p-4 rounded-2xl font-bold text-[1.1rem] transition-all flex items-center justify-center gap-2 ${isCopied ? "bg-[#ff6f0f] text-white border-none" : "bg-transparent border-2 border-[#ff6f0f]/50 text-[#ffa366] hover:bg-[#ff6f0f]/10 hover:border-[#ff6f0f] hover:text-white"
              }`}
          >
            {isCopied ? "✅ 복사 완료! 당근 앱에 붙여넣으세요" : <><Copy size={20} /> 복사해서 당근마켓에 붙여넣기</>}
          </button>
        </section>
      )}

    </main>
  );
}
