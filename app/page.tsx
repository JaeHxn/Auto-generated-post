"use client";
export const runtime = "edge";
export const dynamic = "force-dynamic";

import Image from "next/image";
import { useState, useRef } from "react";
import { Copy, Sparkles, CreditCard, Star, Share2, LogIn, LogOut, Zap, Camera, Instagram, X } from "lucide-react";
import { generateSellerCopy, analyzeAndSavePersona } from "./actions";
import type { GenerateResult } from "./actions";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import HistoryModal from "./HistoryModal";
import HomeEditorialSections from "./components/HomeEditorialSections";
import PaymentModal from "./components/PaymentModal";
type GachaState = "hidden" | "card_ready" | "card_flipped" | "result";
type Platform = "danggeun" | "joonggonara" | "bungae";
type SellerCopyData = NonNullable<GenerateResult["data"]>;

const GUEST_DAILY_LIMIT = 1;
const USER_DAILY_LIMIT = 2;
const GUEST_COUNT_KEY = "magic_seller_guest_count";
const GUEST_DATE_KEY = "magic_seller_guest_date";
const AI_IMAGE_SIZE = 1400;
const AI_IMAGE_TYPE = "image/jpeg";
const AI_IMAGE_QUALITY = 0.9;

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

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image_decode_failed"));
    };
    image.src = objectUrl;
  });
}

async function normalizeImageForAI(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("image_resize_unavailable");
  }

  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = AI_IMAGE_SIZE;
  canvas.height = AI_IMAGE_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("image_context_unavailable");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, AI_IMAGE_SIZE, AI_IMAGE_SIZE);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const scale = Math.min(AI_IMAGE_SIZE / image.width, AI_IMAGE_SIZE / image.height);
  const drawWidth = Math.round(image.width * scale);
  const drawHeight = Math.round(image.height * scale);
  const offsetX = Math.round((AI_IMAGE_SIZE - drawWidth) / 2);
  const offsetY = Math.round((AI_IMAGE_SIZE - drawHeight) / 2);

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  return canvas.toDataURL(AI_IMAGE_TYPE, AI_IMAGE_QUALITY);
}

function RouletteModal({ isLoggedIn, onClose, onLogin }: { isLoggedIn: boolean; onClose: () => void; onLogin: () => void; }) {
  const prizes = ["로그인 +1", "로그인 +1", "로그인 +1", "로그인 +1", "로그인 +1", "로그인 +1"];
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setRevealed(false);
    const extraSpins = 5;
    const winSlice = 3;
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl clickable" onClick={onClose} />
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative z-10 bg-gradient-to-br from-[#1a1030] to-[#0d0720] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_80px_rgba(140,82,255,0.4)] flex flex-col items-center gap-5">
        <button onClick={onClose} className="absolute top-5 right-5 text-white/40 hover:text-white text-2xl">×</button>
        {!revealed ? (
          <>
            <div className="text-center">
              <div className="text-4xl mb-2">🎰</div>
              <h2 className="text-white text-xl font-black">무료 횟수를 다 썼어요!</h2>
              <p className="text-white/60 text-sm mt-1">{isLoggedIn ? `오늘 ${USER_DAILY_LIMIT}회 모두 사용했습니다.` : `비로그인 무료는 하루 ${GUEST_DAILY_LIMIT}회입니다.`}</p>
            </div>
            <div className="relative w-48 h-48">
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10 text-[#ffde00] text-2xl drop-shadow-[0_0_5px_currentColor]">▼</div>
              <motion.div className="w-48 h-48 rounded-full border-4 border-[#ffde00] overflow-hidden" animate={{ rotate: angle }} transition={{ duration: 3, ease: [0.17, 0.67, 0.35, 1.0] }}>
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
                        <path d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`} fill={colors[i]} />
                        <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="4.5" fill="white" fontWeight="bold" transform={`rotate(${(i + 0.5) * sliceAngle + 90}, ${tx}, ${ty})`}>{prize}</text>
                      </g>
                    );
                  })}
                  <circle cx="50" cy="50" r="8" fill="#ffde00" />
                </svg>
              </motion.div>
            </div>
            <button onClick={spin} disabled={spinning} className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-[#ff416c] to-[#8c52ff] text-white hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_5px_20px_rgba(140,82,255,0.5)]">
              {spinning ? "룰렛 돌리는 중... 🌀" : "🎰 행운의 룰렛 돌리기!"}
            </button>
          </>
        ) : (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-5 text-center">
            <div className="text-6xl">🎉</div>
            <div>
              <div className="text-[#ffde00] text-2xl font-black">당첨!</div>
              <div className="text-white text-lg font-bold mt-1">{isLoggedIn ? "로그인 보너스 +1회 이용권 🎁" : "로그인 보너스 +1회 이용권 🎁"}</div>
              <p className="text-white/60 text-sm mt-2">{isLoggedIn ? "내일 다시 무료 횟수가 초기화됩니다." : "구글 로그인하면 하루 2회로 늘어납니다!"}</p>
            </div>
            {!isLoggedIn && (
              <button onClick={onLogin} className="w-full py-4 rounded-2xl font-black text-lg bg-[#4285F4] text-white hover:scale-105 transition-transform shadow-[0_5px_20px_rgba(66,133,244,0.4)]">Google로 로그인하고 5회 받기</button>
            )}
            <button onClick={onClose} className="text-white/40 text-sm hover:text-white">닫기</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

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

  // 새롭게 추가되는 상태들 (이미지, 인스타 말투 학습, 멀티플랫폼 결과)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);

  const [instagramTexts, setInstagramTexts] = useState("");
  const [isAnalyzingPersona, setIsAnalyzingPersona] = useState(false);
  const [personaSaved, setPersonaSaved] = useState(false);

  const [gachaState, setGachaState] = useState<GachaState>("hidden");
  // 단일 텍스트에서 플랫폼/태그 데이터 객체로 변경
  const [resultData, setResultData] = useState<{
    danggeun: string;
    joonggonara: string;
    bungae: string;
    seo_tags: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<Platform>("danggeun");
  const [errorText, setErrorText] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [creditsCount, setCreditsCount] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(() => getGuestCount());

  const apiResultRef = useRef<SellerCopyData | null>(null); // 이제 JSON 결과 객체를 담음

  const currentLimit = isLoggedIn ? USER_DAILY_LIMIT : GUEST_DAILY_LIMIT;
  const currentRemaining = remainingCount !== null ? remainingCount : isLoggedIn ? USER_DAILY_LIMIT : Math.max(0, GUEST_DAILY_LIMIT - guestCount);

  // 이미지 첨부 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    if (fileType.includes("heic") || fileType.includes("heif")) {
      alert("HEIC/HEIF 사진은 바로 분석하지 못합니다. JPG, PNG, WEBP 형식으로 변환 후 업로드해 주세요.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setIsPreparingImage(true);

    void normalizeImageForAI(file)
      .then((normalizedDataUrl) => {
        setImagePreview(normalizedDataUrl);
      })
      .catch(() => {
        alert("사진 처리 중 오류가 발생했습니다. 다른 사진으로 다시 시도해 주세요.");
        setImageFile(null);
        setImagePreview(null);
      })
      .finally(() => {
        setIsPreparingImage(false);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 인스타 말투 학습 핸들러
  const handleAnalyzePersona = async () => {
    if (!isLoggedIn) {
      alert("커스텀 말투 학습은 로그인(PRO) 유저만 사용 가능합니다!");
      return;
    }
    if (instagramTexts.length < 50) {
      alert("정확한 분석을 위해 게시글 내용을 50자 이상 입력해주세요!");
      return;
    }

    setIsAnalyzingPersona(true);
    const result = await analyzeAndSavePersona([instagramTexts]);
    setIsAnalyzingPersona(false);

    if (result.success) {
      setPersonaSaved(true);
      alert("✅ 말투 학습 완료! 이제 작성되는 글에 회원님만의 매력적인 말투가 묻어납니다.");
      setInstagramTexts(""); // 초기화
    } else {
      alert(result.error);
    }
  };

  const handleGenerateClick = async () => {
    if (!formData.birthYear || !formData.gender || !formData.itemName || !formData.itemDetails) {
      alert("Please fill in all seller and item fields.");
      return;
    }

    if (isPreparingImage) {
      alert("Image is still being resized for AI analysis. Please try again in a moment.");
      return;
    }

    const currentGuestCount = getGuestCount();
    if (!isLoggedIn && currentGuestCount >= GUEST_DAILY_LIMIT) {
      setShowRoulette(true);
      return;
    }

    apiResultRef.current = null;
    setErrorText("");
    setIsGenerating(true);
    setGachaState("card_ready");

    if (!isLoggedIn) {
      const newCount = incrementGuestCount();
      setGuestCount(newCount);
    }

    const base64Image = imagePreview || undefined;

    try {
      const res = await generateSellerCopy(
        {
          birthYear: Number(formData.birthYear),
          gender: formData.gender,
          itemName: formData.itemName,
          itemDetails: formData.itemDetails,
          imageUrl: base64Image,
        },
        currentGuestCount,
      );

      if (res.remainingCount !== undefined) setRemainingCount(res.remainingCount);
      if (res.currentCredits !== undefined) setCreditsCount(res.currentCredits);

      if (res.isLimitReached) {
        setGachaState("hidden");
        setShowPayment(true);
        return;
      }

      if (res.success && res.data) {
        apiResultRef.current = res.data;
      } else {
        apiResultRef.current = null;
        setErrorText(res.text || "AI writing failed.");
      }
    } catch {
      apiResultRef.current = null;
      setErrorText("AI request failed. Please re-upload the image and try again.");
    } finally {
      setIsGenerating(false);
      setGachaState((prev) => {
        if (prev === "card_flipped") {
          setTimeout(() => showResult(apiResultRef.current), 0);
        }
        return prev;
      });
    }
  };

  const showResult = (data: SellerCopyData | null) => {
    if (!data) {
      // 에러 처리
      triggerAwesomeConfetti();
      setTimeout(() => {
        setGachaState("result");
        setResultData(null);
      }, 600);
      return;
    }

    triggerAwesomeConfetti();
    setTimeout(() => {
      setGachaState("result");
      setResultData(data);
      setActiveTab("danggeun"); // 기본 탭
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
    if (!isGenerating) {
      showResult(apiResultRef.current);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const getCurrentResultText = () => {
    if (!resultData) return errorText;
    const text = resultData[activeTab];
    return `${text}\n\n---\n🪄 Magic Seller AI 자동 작성 (https://daangn-auto-post.pages.dev/)`;
  };

  const copyToClipboard = () => {
    const textToCopy = getCurrentResultText();
    const doCopy = () => {
      setIsCopied(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 }, colors: ["#ff6f0f", "#ffde00", "#ffffff"] });
      setTimeout(() => setIsCopied(false), 3000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).then(doCopy).catch(() => {
        const el = document.createElement("textarea");
        el.value = textToCopy;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        doCopy();
      });
    } else {
      const el = document.createElement("textarea");
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      doCopy();
    }
  };

  const shareResult = async () => {
    const textToShare = getCurrentResultText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Magic Seller AI 프리미엄 판매글", text: textToShare });
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 }, colors: ["#8c52ff", "#00c9ff", "#ffffff"] });
      } catch { }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <main className="container mx-auto max-w-[650px] px-5 py-12 relative">
        <header className="text-center mb-10 relative">
          <div className="absolute right-0 top-0">
            {isLoading ? <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" /> : isLoggedIn ? (
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/20">
                {session?.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="profile"
                    width={28}
                    height={28}
                    unoptimized
                    className="w-7 h-7 rounded-full border border-white/30"
                  />
                )}
                <span className="text-white/80 text-xs font-semibold hidden sm:block">{session?.user?.name?.split(" ")[0]}</span>
                <button type="button" onClick={() => setShowPayment(true)} className="text-[#ffde00] font-bold text-xs ml-2 hover:underline bg-transparent border-0 p-0">💳 충전</button>
                <button onClick={() => setShowHistory(true)} className="text-white/70 hover:text-[#ffde00] transition-colors ml-2 mr-1" title="보관함">📦 보관함</button>
                <button onClick={() => signOut()} className="text-white/40 hover:text-white transition-colors ml-1" title="로그아웃"><LogOut size={14} /></button>
              </div>
            ) : (
              <button onClick={() => signIn("google")} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-full transition-all hover:scale-105 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                <LogIn size={14} /> Google 로그인
              </button>
            )}
          </div>

          <div className="inline-block bg-gradient-to-r from-[#ffb88c] to-[#ff6f0f] text-black text-xs font-black px-4 py-1.5 rounded-full mb-3 tracking-wider shadow-[0_0_15px_rgba(255,111,15,0.4)]">PRO VERSION</div>
          <h1 className="text-5xl font-extrabold tracking-tight font-outfit m-0">Magic <span className="bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] text-transparent bg-clip-text">Seller</span></h1>
          <p className="text-[#b3b3b3] text-lg mt-3">당신의 중고물품, 명품처럼 포장해 드립니다 🥕</p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${currentRemaining === 0 && (creditsCount || 0) === 0 ? "bg-red-500/20 border-red-500/50 text-red-400" : isLoggedIn ? "bg-[#00c9ff]/10 border-[#00c9ff]/30 text-[#00c9ff]" : "bg-white/10 border-white/20 text-white/70"}`}>
              <Zap size={14} />
              {isLoggedIn ? `무료 ${currentRemaining}/${currentLimit}회 ${creditsCount !== null ? `+ 크레딧 ${creditsCount}💎` : ''}` : `무료 ${currentRemaining}/${currentLimit}회`}
            </div>
            {!isLoggedIn && <button onClick={() => signIn("google")} className="text-xs text-[#ffde00] hover:underline font-semibold">로그인하면 5회 ▶</button>}
          </div>
        </header>

        {isLoggedIn && !personaSaved && (
          <div className="bg-gradient-to-r from-[#8c52ff]/20 to-[#ff416c]/20 border border-[#8c52ff]/40 rounded-2xl p-5 mb-5 shadow-[0_0_25px_rgba(140,82,255,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity"><Instagram size={60} /></div>
            <h3 className="text-white font-bold flex items-center gap-2 mb-2 text-sm"><Sparkles size={16} className="text-[#ffde00]" /> [PRO] 나만의 인스타 말투 학습 (선택)</h3>
            <p className="text-white/60 text-xs mb-3 leading-relaxed">내 인스타그램이나 평소 작성했던 글을 붙여넣으세요. AI가 말투, 이모지, 성향을 파악해 나만의 페르소나로 판매글을 적어줍니다.</p>
            <div className="flex gap-2">
              <textarea
                value={instagramTexts}
                onChange={e => setInstagramTexts(e.target.value)}
                placeholder="최근에 쓴 인스타 게시글 본문 여러개를 복사해서 여기에 붙여넣어주세요 (50자 이상)"
                className="w-full bg-black/40 border border-white/20 p-3 rounded-xl text-white text-xs h-[60px] resize-none focus:outline-none focus:border-[#8c52ff]"
              />
              <button
                onClick={handleAnalyzePersona}
                className="cursor-pointer bg-[#8c52ff] hover:bg-[#7b42f5] text-white px-4 rounded-xl text-xs font-bold whitespace-nowrap disabled:opacity-50 transition-colors shadow-[0_4px_15px_rgba(140,82,255,0.4)]"
              >
                {isAnalyzingPersona ? "분석 중..." : "말투\n학습하기"}
              </button>
            </div>
          </div>
        )}

        <section className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] relative">
          <div className="flex flex-col gap-6">

            {/* Vision AI 파일 업로드 */}
            <div className="flex flex-col">
              <label className="flex items-center text-white font-semibold mb-2 text-base">
                📸 제품 사진 <span className="bg-[#00c9ff]/20 text-[#00c9ff] border border-[#00c9ff]/30 text-xs px-2.5 py-1 rounded-full ml-3 font-bold">옵션</span>
              </label>
              <label className="cursor-pointer bg-black/25 hover:bg-black/40 border-[1.5px] border-white/10 border-dashed text-white/70 p-4 rounded-2xl flex items-center justify-center gap-2 flex-1 transition-all">
                <Camera size={20} />
                <span className="cursor-pointer text-sm font-semibold">
                  {isPreparingImage
                    ? `사진을 ${AI_IMAGE_SIZE}x${AI_IMAGE_SIZE} 분석용 크기로 맞추는 중...`
                    : imageFile
                      ? `${imageFile.name} (${AI_IMAGE_SIZE}x${AI_IMAGE_SIZE} 분석용으로 자동 조정)`
                      : "사진을 업로드하면 AI가 상태를 파악해요"}
                </span>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden cursor-pointer" onChange={handleImageChange} />
              </label>
              <p className="mt-2 text-xs text-white/45">
                업로드한 사진은 작은 경우 키우고 큰 경우 줄여서 {AI_IMAGE_SIZE}x{AI_IMAGE_SIZE} 분석용 크기로 자동 변환됩니다.
              </p>
              {imagePreview && (
                <div className="w-16 h-16 rounded-xl border border-white/20 overflow-hidden relative shadow-[0_0_15px_rgba(0,201,255,0.2)]">
                  <Image
                    src={imagePreview}
                    alt="preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); setIsPreparingImage(false); }} className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-white">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="flex items-center text-white font-semibold mb-2 text-base">판매자 정보</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="number" name="birthYear" value={formData.birthYear} onChange={handleInputChange} className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans" placeholder="출생연도 (예: 1990)" min="1940" max="2015" />
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="cursor-pointer w-full bg-black/25 border-[1.5px] border-white/10 text-white/70 p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans appearance-none">
                  <option value="" disabled>성별 선택</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-white font-semibold mb-2 text-base">판매할 물품명</label>
              <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans" placeholder="예: 다이슨 에어랩 컴플리트 롱" />
            </div>

            <div className="flex flex-col">
              <label className="text-white font-semibold mb-2 text-base">특징 및 장단점 솔직하게</label>
              <textarea name="itemDetails" value={formData.itemDetails} onChange={handleInputChange} className="w-full h-[100px] resize-none bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans leading-relaxed" placeholder="예: 3년 썼는데 케이스 씌워 써서 상태 좋습니다. 모서리 흠집 하나 있음." />
            </div>

            <button type="button" disabled={isPreparingImage} onClick={handleGenerateClick} className="mt-2 relative overflow-hidden bg-gradient-to-br from-[#ff416c] to-[#ff6f0f] text-white p-5 rounded-2xl text-[1.15rem] font-extrabold cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(255,111,15,0.6)] shadow-[0_8px_25px_rgba(255,111,15,0.4)] disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100">
              <span className="relative z-10 flex items-center justify-center gap-2">마법처럼 판매글 생성하기 <Sparkles size={20} /></span>
              <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
            </button>
          </div>
        </section>

        {(gachaState === "card_ready" || gachaState === "card_flipped") && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <div className="relative z-50 flex flex-col items-center justify-center w-full max-w-sm perspective-1000">
              <div className="text-center mb-10 min-h-[60px]">
                {gachaState === "card_ready" && <div className="animate-[slideUp_0.4s_ease-out]"><p className="text-white text-xl font-bold animate-bounce">👇 카드를 터치하여 결과를 확인하세요 👇</p></div>}
                {gachaState === "card_flipped" && <div className="animate-[slideUp_0.4s_ease-out]"><p className="text-[#ffde00] text-base font-semibold animate-pulse">🤖 AI가 당신만의 프리미엄 판매글을 작성 중입니다...</p></div>}
              </div>
              <div
                role="button"
                tabIndex={0}
                aria-label="카드 열기"
                className={`clickable relative w-[280px] h-[400px] transform-style-3d transition-transform duration-[900ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${gachaState === "card_flipped" ? "rotate-y-180" : "hover:scale-105 hover:rotate-[-2deg]"}`}
                onClick={handleCardClick}
                onKeyDown={handleCardKeyDown}
              >
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-white/20 bg-gradient-to-br from-[#120e1f] to-[#1e1438] flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_3s_linear_infinite] z-[-1] blur-md opacity-30" />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6f0f] to-[#ffa366] flex justify-center items-center shadow-[0_0_30px_#ff6f0f] border-[3px] border-[#ffde00]/50"><CreditCard size={40} className="text-white" /></div>
                    <div className="text-[#ffde00] font-black text-2xl tracking-widest">SECRET</div>
                    <div className="text-white/50 text-xs tracking-widest uppercase font-mono border-t border-white/20 pt-2 w-[60%] text-center">Tap to Open</div>
                  </div>
                </div>
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] border-[3px] border-[#ffde00] bg-gradient-to-br from-[#ffe066] via-[#ffde00] to-[#e6b800] flex flex-col items-center justify-center">
                  <div className="flex gap-1 text-[#d48900] mb-5"><Star fill="currentColor" size={20} /><Star fill="currentColor" size={28} className="animate-pulse" /><Star fill="currentColor" size={20} /></div>
                  <div className="w-14 h-14 rounded-full border-[5px] border-[#b38e00]/30 border-t-[#5c4a00] animate-spin mb-3" />
                  <p className="text-[#5c4a00] font-black text-lg">AI 글쓰기 중...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {gachaState === "result" && (
            <motion.section id="result-section" initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", damping: 20 }} className="mt-10 bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-[28px] p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
              {resultData ? (
                <>
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-[#ffde00] text-xl font-bold m-0">🎉 맞춤형 판매글 완성</h2>
                  </div>

                  {/* 플랫폼 탭 */}
                  <div className="flex bg-black/40 rounded-xl p-1 mb-5">
                    {[
                      { id: "danggeun", label: "🥕 당근마켓" },
                      { id: "joonggonara", label: "📦 중고나라" },
                      { id: "bungae", label: "⚡ 번개장터" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Platform)}
                        className={`cursor-pointer flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id ? "bg-[#ff6f0f] text-white shadow-md transform scale-[1.02]" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-black/35 p-6 rounded-2xl text-[1.05rem] leading-[1.8] text-[#e6e6e6] font-light border-l-[4px] border-[#ffde00] whitespace-pre-wrap min-h-[150px]">
                    {getCurrentResultText()}
                  </div>

                  {/* SEO 태그 뱃지 */}
                  {resultData.seo_tags && resultData.seo_tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="text-white/40 text-xs font-bold py-1 mr-2">추천 해시태그:</span>
                      {resultData.seo_tags.map((tag, idx) => (
                        <div key={idx} className="bg-[#00c9ff]/10 border border-[#00c9ff]/30 text-[#00c9ff] text-xs px-2.5 py-1 rounded-full">{typeof tag === 'string' && tag.startsWith('#') ? tag : `#${tag}`}</div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-5 text-white/70">{errorText || "결과를 불러오지 못했습니다."}</div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={copyToClipboard} className={`flex-1 p-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${isCopied ? "bg-[#ff6f0f] text-white border-transparent" : "border-2 border-[#ff6f0f]/50 text-[#ffa366] hover:bg-[#ff6f0f]/10"}`}>
                  {isCopied ? "복사 완료!" : <><Copy size={18} /> 내용 복사하기</>}
                </button>
                <button onClick={shareResult} className="flex-1 p-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#8c52ff] to-[#00c9ff] text-white shadow-lg shadow-[#8c52ff]/30 hover:scale-[1.02]">
                  <Share2 size={18} /> 공유하기
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <div className="mx-auto w-full max-w-[650px] px-5 pb-12">
        <HomeEditorialSections />
      </div>

      <AnimatePresence>
        {showRoulette && <RouletteModal isLoggedIn={isLoggedIn} onClose={() => setShowRoulette(false)} onLogin={() => { setShowRoulette(false); signIn("google"); }} />}
      </AnimatePresence>
      <AnimatePresence>{showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}</AnimatePresence>
      <AnimatePresence>{showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}</AnimatePresence>
    </>
  );
}
