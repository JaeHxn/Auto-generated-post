"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Sparkles, CreditCard, Star, Share2, LogIn, LogOut, Zap } from "lucide-react";
import { generateSellerCopy } from "./actions";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import HistoryModal from "./HistoryModal";
import PaymentModal from "./components/PaymentModal";

type GachaState = "hidden" | "card_ready" | "card_flipped" | "result";

const GUEST_DAILY_LIMIT = 1;
const USER_DAILY_LIMIT = 2;
const GUEST_COUNT_KEY = "magic_seller_guest_count";
const GUEST_DATE_KEY = "magic_seller_guest_date";

// localStorage에서 오늘 비로그인 사용 횟수 가져오기
function getGuestCount(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().split("T")[0];
  const savedDate = localStorage.getItem(GUEST_DATE_KEY);
  if (savedDate !== today) {
    localStorage.setItem(GUEST_DATE_KEY, today);
    localStorage.setItem(GUEST_COUNT_KEY, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(GUEST_COUNT_KEY) || "0", 10);
}

function incrementGuestCount(): number {
  const next = getGuestCount() + 1;
  localStorage.setItem(GUEST_COUNT_KEY, String(next));
  return next;
}

// -------- 룰렛 모달 컴포넌트 --------
function RouletteModal({
  isLoggedIn,
  onClose,
  onLogin,
}: {
  isLoggedIn: boolean;
  onClose: () => void;
  onLogin: () => void;
}) {
  const prizes = ["5회 추가권", "10회 추가권", "😢 꽝", "로그인 상품", "5회 추가권", "🎁 특별상"];
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setRevealed(false);
    const extraSpins = 5;
    const winSlice = 3; // "로그인 상품" 칸으로 항상 당첨
    const sliceAngle = 360 / prizes.length;
    const targetAngle = 360 * extraSpins + sliceAngle * winSlice + sliceAngle / 2;
    setAngle((prev) => prev + targetAngle);
    setTimeout(() => {
      setSpinning(false);
      setRevealed(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative z-10 bg-gradient-to-br from-[#1a1030] to-[#0d0720] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_80px_rgba(140,82,255,0.4)] flex flex-col items-center gap-5"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-white/40 hover:text-white text-2xl">×</button>

        {!revealed ? (
          <>
            <div className="text-center">
              <div className="text-4xl mb-2">🎰</div>
              <h2 className="text-white text-xl font-black">무료 횟수를 다 썼어요!</h2>
              <p className="text-white/60 text-sm mt-1">
                {isLoggedIn
                  ? `오늘 ${USER_DAILY_LIMIT}회 모두 사용했습니다.`
                  : `비로그인 무료는 하루 ${GUEST_DAILY_LIMIT}회입니다.`}
              </p>
            </div>

            {/* 룰렛 원판 */}
            <div className="relative w-48 h-48">
              {/* 화살표 */}
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10 text-[#ffde00] text-2xl drop-shadow-[0_0_5px_currentColor]">▼</div>
              <motion.div
                className="w-48 h-48 rounded-full border-4 border-[#ffde00] overflow-hidden"
                style={{ originX: "50%", originY: "50%" }}
                animate={{ rotate: angle }}
                transition={{ duration: 3, ease: [0.17, 0.67, 0.35, 1.0] }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {prizes.map((prize, i) => {
                    const sliceAngle = 360 / prizes.length;
                    const startAngle = (i * sliceAngle * Math.PI) / 180;
                    const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;
                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);
                    const colors = ["#ff416c", "#8c52ff", "#333", "#ff6f0f", "#ff416c", "#00c9ff"];
                    const midAngle = ((i + 0.5) * sliceAngle * Math.PI) / 180;
                    const tx = 50 + 32 * Math.cos(midAngle);
                    const ty = 50 + 32 * Math.sin(midAngle);
                    return (
                      <g key={i}>
                        <path
                          d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`}
                          fill={colors[i]}
                        />
                        <text
                          x={tx} y={ty}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="4.5"
                          fill="white"
                          fontWeight="bold"
                          transform={`rotate(${(i + 0.5) * sliceAngle + 90}, ${tx}, ${ty})`}
                        >
                          {prize}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="50" cy="50" r="8" fill="#ffde00" />
                </svg>
              </motion.div>
            </div>

            <button
              onClick={spin}
              disabled={spinning}
              className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-[#ff416c] to-[#8c52ff] text-white hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_5px_20px_rgba(140,82,255,0.5)]"
            >
              {spinning ? "룰렛 돌리는 중... 🌀" : "🎰 행운의 룰렛 돌리기!"}
            </button>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <div className="text-6xl">🎉</div>
            <div>
              <div className="text-[#ffde00] text-2xl font-black">당첨!</div>
              <div className="text-white text-lg font-bold mt-1">
                {isLoggedIn ? "내일 5회 추가 무료 이용권" : "로그인 보너스 +3회 이용권"}
              </div>
              <p className="text-white/60 text-sm mt-2">
                {isLoggedIn
                  ? "내일 자정에 초기화되어 5회가 지급됩니다."
                  : "구글 로그인하면 하루 5회로 바로 늘어납니다!"}
              </p>
            </div>
            {!isLoggedIn && (
              <button
                onClick={onLogin}
                className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-[#4285F4] to-[#0F9D58] text-white hover:scale-105 transition-transform shadow-[0_5px_20px_rgba(66,133,244,0.4)] flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google로 로그인하고 5회 받기
              </button>
            )}
            <button onClick={onClose} className="text-white/40 text-sm hover:text-white">닫기</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// -------- 메인 컴포넌트 --------
export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";

  const [formData, setFormData] = useState({
    birthYear: "",
    gender: "",
    itemName: "",
    itemDetails: "",
  });

  const [gachaState, setGachaState] = useState<GachaState>("hidden");
  const [resultText, setResultText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [creditsCount, setCreditsCount] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const apiResultRef = useRef<string | null>(null);

  // 비로그인 카운트 초기화
  useEffect(() => {
    setGuestCount(getGuestCount());
  }, []);

  const currentLimit = isLoggedIn ? USER_DAILY_LIMIT : GUEST_DAILY_LIMIT;
  const currentRemaining =
    remainingCount !== null
      ? remainingCount
      : isLoggedIn
        ? USER_DAILY_LIMIT
        : Math.max(0, GUEST_DAILY_LIMIT - guestCount);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateClick = async () => {
    if (!formData.birthYear || !formData.gender || !formData.itemName || !formData.itemDetails) {
      alert("물품의 핵심 내용과 판매자 프로필을 모두 입력해주세요! 😎");
      return;
    }

    // 비로그인 서버 측 제한 체크
    const currentGuestCount = getGuestCount();
    if (!isLoggedIn && currentGuestCount >= GUEST_DAILY_LIMIT) {
      setShowRoulette(true);
      return;
    }

    apiResultRef.current = null;
    setIsGenerating(true);
    setGachaState("card_ready");

    // 비로그인이면 로컬 카운트 먼저 증가
    if (!isLoggedIn) {
      const newCount = incrementGuestCount();
      setGuestCount(newCount);
    }

    generateSellerCopy(
      {
        birthYear: Number(formData.birthYear),
        gender: formData.gender,
        itemName: formData.itemName,
        itemDetails: formData.itemDetails,
      },
      currentGuestCount
    ).then((res) => {
      setIsGenerating(false);
      if (res.remainingCount !== undefined) {
        setRemainingCount(res.remainingCount);
      }
      if (res.currentCredits !== undefined) {
        setCreditsCount(res.currentCredits);
      }
      if (res.isLimitReached) {
        setGachaState("hidden");
        setShowPayment(true); // 무료 횟수/크레딧 모두 소진 시 결제창 표출
        return;
      }
      apiResultRef.current = res.text || "에러 발생";
      setGachaState((prev) => {
        if (prev === "card_flipped") {
          setTimeout(() => showResult(res.text || "에러 발생"), 0);
        }
        return prev;
      });
    });
  };

  const showResult = (text: string) => {
    const watermarkedText = `${text}\n\n---\n🪄 이 글은 Magic Seller AI가 작성했습니다\n👉 https://magic-seller.pages.dev`;
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
    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ["#ff416c", "#8c52ff", "#ff6f0f", "#00c9ff", "#ffde00"] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ["#ff416c", "#8c52ff", "#ff6f0f", "#00c9ff", "#ffde00"] });
    }, 250);
  };

  const handleCardClick = () => {
    if (gachaState !== "card_ready") return;
    setGachaState("card_flipped");
    if (!isGenerating && apiResultRef.current !== null) {
      showResult(apiResultRef.current);
    }
  };

  const copyToClipboard = () => {
    const doCopy = () => {
      setIsCopied(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 }, colors: ["#ff6f0f", "#ffde00", "#ffffff"] });
      setTimeout(() => setIsCopied(false), 3000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(resultText).then(doCopy).catch(() => {
        const el = document.createElement("textarea");
        el.value = resultText;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        doCopy();
      });
    } else {
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
        await navigator.share({ title: "Magic Seller AI 프리미엄 판매글", text: resultText });
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 }, colors: ["#8c52ff", "#00c9ff", "#ffffff"] });
      } catch { }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <main className="container mx-auto max-w-[650px] px-5 py-12 relative">
        {/* 헤더 + 로그인 버튼 */}
        <header className="text-center mb-10 relative">
          {/* 로그인 상태 우측 상단 */}
          <div className="absolute right-0 top-0">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                {session?.user?.image && (
                  <img src={session.user.image} alt="profile" className="w-7 h-7 rounded-full" />
                )}
                <span className="text-white/80 text-xs font-semibold hidden sm:block">
                  {session?.user?.name?.split(" ")[0]}
                </span>
                <span className="text-[#ffde00] font-bold text-xs ml-2 cursor-pointer hover:underline" onClick={() => setShowPayment(true)}>
                  💳 충전
                </span>
                <button
                  onClick={() => setShowHistory(true)}
                  className="text-white/70 hover:text-[#ffde00] transition-colors ml-2 mr-1"
                  title="보관함"
                >
                  📦 보관함
                </button>
                <button
                  onClick={() => signOut()}
                  className="text-white/40 hover:text-white transition-colors ml-1"
                  title="로그아웃"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-full transition-all hover:scale-105"
              >
                <LogIn size={14} />
                Google 로그인
              </button>
            )}
          </div>

          <div className="inline-block bg-gradient-to-r from-[#ffb88c] to-[#ff6f0f] text-black text-xs font-black px-4 py-1.5 rounded-full mb-3 tracking-wider">
            PRO VERSION
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight font-outfit m-0">
            Magic <span className="bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] text-transparent bg-clip-text">Seller</span>
          </h1>
          <p className="text-[#b3b3b3] text-lg mt-3">당신의 중고물품, 명품처럼 포장해 드립니다 🥕</p>

          {/* 남은 횟수 뱃지 */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${currentRemaining === 0 && (creditsCount || 0) === 0
              ? "bg-red-500/20 border-red-500/50 text-red-400"
              : isLoggedIn
                ? "bg-[#00c9ff]/10 border-[#00c9ff]/30 text-[#00c9ff]"
                : "bg-white/10 border-white/20 text-white/70"
              }`}>
              <Zap size={14} />
              {isLoggedIn ? `로그인 · 무료 ${currentRemaining}/${currentLimit}회 ${creditsCount !== null ? `+ 크레딧 ${creditsCount}💎` : ''}` : `비로그인 · 무료 ${currentRemaining}/${currentLimit}회`}
            </div>
            {!isLoggedIn && (
              <button
                onClick={() => signIn("google")}
                className="text-xs text-[#ffde00] hover:underline font-semibold"
              >
                로그인하면 5회 ▶
              </button>
            )}
          </div>
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
              />
            </div>

            <button
              type="button" onClick={handleGenerateClick}
              className="mt-4 relative overflow-hidden bg-gradient-to-br from-[#ff416c] to-[#ff6f0f] text-white p-5 rounded-2xl text-[1.15rem] font-extrabold cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(255,111,15,0.6)] shadow-[0_8px_25px_rgba(255,111,15,0.4)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                초프리미엄 판매글 생성하기 <Sparkles size={20} />
              </span>
              <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
            </button>
          </div>
        </section>

        {/* 가챠 카드 모달 */}
        {(gachaState === "card_ready" || gachaState === "card_flipped") && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <div className="relative z-50 flex flex-col items-center justify-center w-full max-w-sm perspective-1000">
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

              <div
                className={`relative w-[280px] h-[400px] transform-style-3d transition-transform duration-[900ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${gachaState === "card_flipped" ? "rotate-y-180" : "cursor-pointer hover:scale-105 hover:rotate-[-2deg]"}`}
                onClick={handleCardClick}
              >
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-white/20 bg-gradient-to-br from-[#120e1f] to-[#1e1438] flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8c52ff]/20 to-transparent" />
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_3s_linear_infinite] z-[-1] blur-md opacity-30" />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] flex justify-center items-center shadow-[0_0_30px_#ff6f0f] border-[3px] border-[#ffde00]/50">
                      <CreditCard size={40} className="text-white" />
                    </div>
                    <div className="text-[#ffde00] font-black text-2xl tracking-widest drop-shadow-[0_0_5px_currentColor]">SECRET</div>
                    <div className="text-white/50 text-xs tracking-widest uppercase font-mono border-t border-white/20 pt-2 w-[60%] text-center">Tap to Open</div>
                  </div>
                  <div className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
                </div>

                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] shadow-[0_0_60px_rgba(255,222,0,0.5)] border-[3px] border-[#ffde00] bg-gradient-to-br from-[#ffe066] via-[#ffde00] to-[#e6b800] flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-2 rounded-[16px] bg-gradient-to-b from-white/20 to-transparent flex flex-col items-center justify-center gap-5 p-6">
                    <div className="flex gap-1 text-[#d48900]">
                      <Star fill="currentColor" size={20} />
                      <Star fill="currentColor" size={28} className="animate-pulse" />
                      <Star fill="currentColor" size={20} />
                    </div>
                    <div className="w-14 h-14 rounded-full border-[5px] border-[#b38e00]/30 border-t-[#5c4a00] animate-spin" />
                    <div className="text-center">
                      <p className="text-[#5c4a00] font-black text-lg leading-tight">AI 글쓰기 중...</p>
                      <p className="text-[#8a6e00] text-xs mt-1 font-medium">잠시만 기다려주세요 ✍️</p>
                    </div>
                    <div className="text-[#5c4a00]/60 text-[0.6rem] font-black tracking-[0.2em] font-mono">MAGIC SELLER</div>
                  </div>
                  <div className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-30deg] animate-[shine_2.5s_infinite]" />
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
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="text-[#ffde00] text-2xl font-bold mt-0 mb-6 flex items-center gap-2"
              >
                🎉 당신만을 위한 스위트 세일즈 피치
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
                className="bg-black/35 p-6 md:p-8 rounded-2xl text-[1.05rem] leading-[1.8] text-[#e6e6e6] font-light border-l-[5px] border-[#ffde00] whitespace-pre-wrap shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-bl from-white/5 to-transparent skew-x-[-20deg] translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000 ease-in-out" />
                {resultText}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
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

      {/* 룰렛 모달 */}
      <AnimatePresence>
        {showRoulette && (
          <RouletteModal
            isLoggedIn={isLoggedIn}
            onClose={() => setShowRoulette(false)}
            onLogin={() => {
              setShowRoulette(false);
              signIn("google");
            }}
          />
        )}
      </AnimatePresence>

      {/* 히스토리 모달 */}
      <AnimatePresence>
        {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
      </AnimatePresence>

      {/* 결제 모달 (Paddle Checkout) */}
      <AnimatePresence>
        {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
      </AnimatePresence>

      {/* SEO 섹션 */}
      <section className="container mx-auto max-w-[800px] px-5 pb-20 pt-10">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-white/80">
          <h2 className="text-2xl font-bold mb-4 text-white">당근마켓과 중고거래, 이제 &apos;매직 셀러&apos;로 완벽하게 판매하세요</h2>
          <p className="mb-6 leading-relaxed text-sm">
            중고나라, 번개장터, 당근마켓 등 다양한 중고거래 플랫폼에서 물건을 판매할 때 가장 고민되는 것은 바로 <strong>&apos;어떻게 글을 써야 물건이 제값에 잘 팔릴까?&apos;</strong>입니다. 매직 셀러(Magic Seller)는 최신 AI 기술을 활용하여 당신의 평범한 중고 물품을 마치 명품 브랜드의 한정판처럼 매력적으로 포장해주는 <strong>프리미엄 중고거래 카피라이팅 자동 생성 서비스</strong>입니다.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-[#ffde00]">왜 매직 셀러를 사용해야 할까요?</h3>
          <ul className="list-disc pl-5 mb-6 space-y-2 text-sm">
            <li><strong>클릭률 상승:</strong> 구매자의 눈길을 사로잡는 마케팅 기반의 매력적인 제목과 도입부를 작성해 줍니다.</li>
            <li><strong>신뢰도 극대화:</strong> 단점을 숨기지 않으면서도 그것을 장점으로 승화시키는 &apos;스위트 세일즈 피치(Sweet Sales Pitch)&apos; 기법을 적용합니다.</li>
            <li><strong>시간 절약:</strong> 사진 상태나 연식, 모델명 몇 가지만 입력하면 3초 만에 완벽한 판매글이 생성됩니다.</li>
            <li><strong>맞춤형 페르소나:</strong> 판매자의 연령대와 성별에 맞춘 자연스럽고 신뢰감 있는 톤앤매너로 글을 작성하여 직거래 시의 어색함을 줄여줍니다.</li>
          </ul>

          <p className="text-xs text-white/50 border-t border-white/10 pt-4">
            * 매직 셀러는 구글 계정으로 로그인하면 하루 5회 무료로 이용 가능한 AI 기반 툴입니다. 비로그인 시 하루 2회 무료. 향후 인스타그램 맞춤형 페르소나, 이미지 자동 판독(Vision AI) 등 다양한 B2C, B2B 마케팅 기능을 제공할 예정입니다.
          </p>
        </div>
      </section>
    </>
  );
}
