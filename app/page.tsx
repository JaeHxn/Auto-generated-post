"use client";
export const runtime = "edge";
export const dynamic = "force-dynamic";

import NextImage from "next/image";
import { useState, useRef, useEffect } from "react";
import { Copy, Sparkles, CreditCard, Star, Share2, Camera, Instagram, Youtube, X } from "lucide-react";
import { generateSellerCopy, generateSocialPost, analyzeAndSavePersona } from "./actions";
import type { GenerateResult, SocialPlatform, SocialPostInput, SocialPostResult } from "./actions";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import HistoryModal from "./HistoryModal";
import HomeEditorialSections from "./components/HomeEditorialSections";
import PaymentModal from "./components/PaymentModal";
import InquiryModal from "./components/InquiryModal";
import CoupangBanner from "./components/CoupangBanner";
import SiteHeader from "./components/SiteHeader";
import { Locale, useDict, getStoredLocale } from "./i18n";
import { trackEvent } from "@/lib/analytics";
import { logAccess } from "@/lib/accessLog";
import ShareBar from "./components/ShareBar";

type GachaState = "hidden" | "card_ready" | "card_flipped" | "result";
type ContentMode = "seller" | "instagram" | "youtube";
type MarketplacePlatform = "danggeun" | "joonggonara" | "bungae";
type SellerCopyData = NonNullable<GenerateResult["data"]>;
type SocialPostData = NonNullable<SocialPostResult["data"]>;
type GeneratedResultData =
  | { mode: "seller"; data: SellerCopyData }
  | { mode: SocialPlatform; data: SocialPostData };

const GUEST_DAILY_LIMIT = 1;
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

function RouletteModal({ isLoggedIn, onClose, onLogin, locale }: { isLoggedIn: boolean; onClose: () => void; onLogin: () => void; locale: Locale }) {
  const t = useDict(locale);
  const prizes = [t.rouletteLoginBonus, t.rouletteLoginBonus, t.rouletteLoginBonus, t.rouletteLoginBonus, t.rouletteLoginBonus, t.rouletteLoginBonus];
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
      trackEvent("roulette_spin", { prize: prizes[winSlice] });
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
              <h2 className="text-white text-xl font-black">{t.rouletteTitle}</h2>
              <p className="text-white/60 text-sm mt-1">{isLoggedIn ? t.rouletteDescLoggedIn : t.rouletteDesc}</p>
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
              {spinning ? t.rouletteSpinning : t.rouletteSpin}
            </button>
          </>
        ) : (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-5 text-center">
            <div className="text-6xl">🎉</div>
            <div>
              <div className="text-[#ffde00] text-2xl font-black">{t.rouletteWin}</div>
              <div className="text-white text-lg font-bold mt-1">{t.rouletteLoginBonus}</div>
              <p className="text-white/60 text-sm mt-2">{isLoggedIn ? t.rouletteNextDay : t.rouletteLoginUpgrade}</p>
            </div>
            {!isLoggedIn && (
              <button onClick={onLogin} className="w-full py-4 rounded-2xl font-black text-lg bg-[#4285F4] text-white hover:scale-105 transition-transform shadow-[0_5px_20px_rgba(66,133,244,0.4)]">{t.rouletteLoginBtn}</button>
            )}
            <button onClick={onClose} className="text-white/40 text-sm hover:text-white">{t.rouletteClose}</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [locale, setLocale] = useState<Locale>("ko");
  useEffect(() => { setLocale(getStoredLocale()); }, []);
  useEffect(() => {
    logAccess(window.location.pathname, session?.user?.email ?? undefined);
  }, [session]);
  const t = useDict(locale);

  const [formData, setFormData] = useState({
    birthYear: "",
    gender: "",
    itemName: "",
    itemDetails: "",
  });
  const [socialFormData, setSocialFormData] = useState({
    instagramBrief: "",
    youtubeVideoUrl: "",
    youtubeDetails: "",
  });

  // 새롭게 추가되는 상태들 (이미지, 인스타 말투 학습, 멀티플랫폼 결과)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);

  const [instagramTexts, setInstagramTexts] = useState("");
  const [isAnalyzingPersona, setIsAnalyzingPersona] = useState(false);
  const [personaSaved, setPersonaSaved] = useState(false);

  const [gachaState, setGachaState] = useState<GachaState>("hidden");
  const [contentMode, setContentMode] = useState<ContentMode>("seller");
  const [resultData, setResultData] = useState<GeneratedResultData | null>(null);
  const [activeTab, setActiveTab] = useState<MarketplacePlatform>("danggeun");
  const [errorText, setErrorText] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isHashtagCopied, setIsHashtagCopied] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    t.loadingStep0,
    t.loadingStep1,
    t.loadingStep2,
    t.loadingStep3
  ];


  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [creditsCount, setCreditsCount] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(() => getGuestCount());

  const apiResultRef = useRef<GeneratedResultData | null>(null);

  const activeModeLabel =
    contentMode === "seller" ? "당근용" : contentMode === "instagram" ? "인스타용" : "유튜브용";
  const generateButtonLabel =
    contentMode === "seller"
      ? "당근용 판매글 생성하기"
      : contentMode === "instagram"
        ? "인스타 게시물 생성하기"
        : "유튜브 게시물 생성하기";

  // 이미지 첨부 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    if (fileType.includes("heic") || fileType.includes("heif")) {
      alert(t.heicError);
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

  const handleSocialInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSocialFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    const currentGuestCount = getGuestCount();
    const selectedMode = contentMode;

    if (selectedMode === "seller" && (!formData.birthYear || !formData.gender || !formData.itemName || !formData.itemDetails)) {
      alert(t.fillAllFields);
      return;
    }

    if (selectedMode === "instagram" && !imagePreview && !socialFormData.instagramBrief.trim()) {
      alert("인스타용은 사진이나 게시물 내용 요약을 입력해주세요.");
      return;
    }

    if (selectedMode === "youtube" && !socialFormData.youtubeVideoUrl.trim() && !socialFormData.youtubeDetails.trim()) {
      alert("유튜브용은 영상 URL이나 영상 내용 메모를 입력해주세요.");
      return;
    }

    if (selectedMode !== "youtube" && isPreparingImage) {
      alert(t.imageStillResizing);
      return;
    }

    if (!isLoggedIn && currentGuestCount >= GUEST_DAILY_LIMIT) {
      setShowRoulette(true);
      return;
    }

    apiResultRef.current = null;
    setResultData(null);
    setErrorText("");
    setIsGenerating(true);
    setGachaState("card_ready");
    setLoadingStep(0);
    trackEvent("generate_click", {
      mode: selectedMode,
      subject:
        selectedMode === "seller"
          ? formData.itemName
          : selectedMode === "instagram"
            ? socialFormData.instagramBrief.slice(0, 80)
            : (socialFormData.youtubeVideoUrl || socialFormData.youtubeDetails).slice(0, 80),
    });

    if (!isLoggedIn) {
      const newCount = incrementGuestCount();
      setGuestCount(newCount);
    }

    const base64Image = imagePreview || undefined;

    try {
      if (selectedMode === "seller") {
        const requestParams = {
          birthYear: Number(formData.birthYear),
          gender: formData.gender,
          itemName: formData.itemName,
          itemDetails: formData.itemDetails,
          imageUrl: base64Image,
        };
        const res = await generateSellerCopy(requestParams, currentGuestCount);

        if (res.remainingCount !== undefined) setRemainingCount(res.remainingCount);
        if (res.currentCredits !== undefined) setCreditsCount(res.currentCredits);

        if (res.isLimitReached) {
          setGachaState("hidden");
          setShowPayment(true);
          return;
        }

        if (res.success && res.data) {
          apiResultRef.current = { mode: "seller", data: res.data };
        } else {
          apiResultRef.current = null;
          setErrorText(res.text || "AI writing failed.");
        }
      } else {
        const socialInput: SocialPostInput =
          selectedMode === "instagram"
            ? {
                platform: "instagram",
                imageUrl: base64Image,
                postBrief: socialFormData.instagramBrief.trim(),
              }
            : {
                platform: "youtube",
                videoUrl: socialFormData.youtubeVideoUrl.trim() || undefined,
                videoDetails: socialFormData.youtubeDetails.trim() || undefined,
              };
        const res = await generateSocialPost(socialInput, currentGuestCount);

        if (res.remainingCount !== undefined) setRemainingCount(res.remainingCount);
        if (res.currentCredits !== undefined) setCreditsCount(res.currentCredits);

        if (res.isLimitReached) {
          setGachaState("hidden");
          setShowPayment(true);
          return;
        }

        if (res.success && res.data) {
          apiResultRef.current = { mode: selectedMode, data: res.data };
        } else {
          apiResultRef.current = null;
          setErrorText(res.text || "AI writing failed.");
        }
      }
    } catch {
      apiResultRef.current = null;
      setErrorText("AI request failed. Please check the input and try again.");
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

  // 단계별 메시지를 위한 타이머 (isGenerating 동안)
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating, loadingSteps.length]);

  const showResult = (data: GeneratedResultData | null) => {
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
      if (data.mode === "seller") setActiveTab("danggeun");
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

  const getDisplayResultText = () => {
    if (!resultData) return errorText;
    if (resultData.mode === "seller") {
      return resultData.data[activeTab];
    }

    const { content, title, description } = resultData.data;
    if (resultData.mode === "youtube") {
      return [
        title ? `제목: ${title}` : null,
        description ? `설명:\n${description}` : null,
        `본문:\n${content}`,
      ].filter(Boolean).join("\n\n");
    }

    return content;
  };

  const getCurrentHashtags = () => {
    if (!resultData) return [];
    return resultData.mode === "seller" ? resultData.data.seo_tags : resultData.data.hashtags;
  };

  const getCurrentResultText = () => {
    if (!resultData) return errorText;
    const text = getDisplayResultText();
    if (resultData.mode === "seller") {
      return `${text}\n\n---\n🪄 Magic Seller AI 자동 작성 (https://daangn-auto-post.pages.dev/)`;
    }
    const hashtags = getCurrentHashtags()
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(" ");
    return `${text}${hashtags ? `\n\n${hashtags}` : ""}`;
  };

  const copyToClipboard = () => {
    const textToCopy = getCurrentResultText();
    const doCopy = () => {
      setIsCopied(true);
      trackEvent("copy_click", { platform: resultData?.mode === "seller" ? activeTab : resultData?.mode });
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

  const copyHashtagsToClipboard = () => {
    const tags = getCurrentHashtags();
    if (!tags.length) return;
    // 유튜브: 쉼표+공백 구분, # 없음 / 그 외: #태그 스페이스 구분
    const textToCopy = resultData?.mode === "youtube"
      ? tags.map((t) => t.replace(/^#+/, "")).join(", ")
      : tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
    const doCopy = () => {
      setIsHashtagCopied(true);
      trackEvent("hashtag_copy_click", { platform: resultData?.mode });
      setTimeout(() => setIsHashtagCopied(false), 2500);
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
        const shareModeLabel =
          resultData?.mode === "seller"
            ? "당근용"
            : resultData?.mode === "instagram"
              ? "인스타용"
              : resultData?.mode === "youtube"
                ? "유튜브용"
                : activeModeLabel;
        await navigator.share({ title: `Magic Seller AI ${shareModeLabel}`, text: textToShare });
        trackEvent("share_click", { platform: resultData?.mode === "seller" ? activeTab : resultData?.mode });
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 }, colors: ["#8c52ff", "#00c9ff", "#ffffff"] });
      } catch { }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <main className="container mx-auto max-w-[650px] px-5 py-12 relative min-h-[960px]">
        <SiteHeader
          locale={locale}
          onLocaleChange={setLocale}
          remainingCount={remainingCount}
          creditsCount={creditsCount}
          guestCount={guestCount}
          onOpenPayment={() => { setShowPayment(true); trackEvent("payment_modal_open"); }}
          onOpenHistory={() => setShowHistory(true)}
          onOpenInquiry={() => setShowInquiry(true)}
        />

        {isLoggedIn && !personaSaved && (
          <div className="bg-gradient-to-r from-[#8c52ff]/20 to-[#ff416c]/20 border border-[#8c52ff]/40 rounded-2xl p-5 mb-5 shadow-[0_0_25px_rgba(140,82,255,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity"><Instagram size={60} /></div>
            <h3 className="text-white font-bold flex items-center gap-2 mb-2 text-sm"><Sparkles size={16} className="text-[#ffde00]" /> {t.proPersonaTitle}</h3>
            <p className="text-white/60 text-xs mb-3 leading-relaxed">{t.proPersonaDesc}</p>
            <div className="flex gap-2">
              <textarea
                value={instagramTexts}
                onChange={e => setInstagramTexts(e.target.value)}
                placeholder={t.proPersonaPlaceholder}
                className="w-full bg-black/40 border border-white/20 p-3 rounded-xl text-white text-xs h-[60px] resize-none focus:outline-none focus:border-[#8c52ff]"
              />
              <button
                onClick={handleAnalyzePersona}
                className="cursor-pointer bg-[#8c52ff] hover:bg-[#7b42f5] text-white px-4 rounded-xl text-xs font-bold whitespace-nowrap disabled:opacity-50 transition-colors shadow-[0_4px_15px_rgba(140,82,255,0.4)]"
              >
                {isAnalyzingPersona ? t.proPersonaAnalyzing : <span className="whitespace-pre-line">{t.proPersonaBtn}</span>}
              </button>
            </div>
          </div>
        )}

        <section className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] relative min-h-[710px] sm:min-h-[690px]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/25 p-1.5">
                {[
                  { id: "seller", label: "당근용", desc: "중고거래", icon: Sparkles },
                  { id: "instagram", label: "인스타용", desc: "게시물+태그", icon: Instagram },
                  { id: "youtube", label: "유튜브용", desc: "제목+설명", icon: Youtube },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = contentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setContentMode(mode.id as ContentMode);
                        setIsCopied(false);
                      }}
                      className={`min-h-[72px] rounded-xl px-2.5 py-3 text-center transition-all ${
                        isActive
                          ? "bg-[#ff6f0f] text-white shadow-[0_8px_22px_rgba(255,111,15,0.35)]"
                          : "text-white/55 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5 text-sm font-black">
                        <Icon size={16} />
                        {mode.label}
                      </span>
                      <span className="mt-1 block text-[11px] font-semibold opacity-75">{mode.desc}</span>
                    </button>
                  );
                })}
              </div>
              <p className="px-1 text-xs leading-relaxed text-white/45">
                {contentMode === "seller"
                  ? "중고거래 앱에 바로 붙여넣을 판매글과 검색 태그를 만듭니다."
                  : contentMode === "instagram"
                    ? "사진과 설명을 바탕으로 인스타 게시물 본문과 노출용 해시태그를 만듭니다."
                    : "유튜브 쇼츠·커뮤니티에 쓸 제목, 설명, 본문, 해시태그를 함께 만듭니다."}
              </p>
            </div>

            {contentMode !== "youtube" && (
              <div className="flex flex-col">
                <label className="flex items-center text-white font-semibold mb-2 text-base">
                  {contentMode === "instagram" ? "인스타 사진" : t.photoLabel}
                  <span className="bg-[#00c9ff]/20 text-[#00c9ff] border border-[#00c9ff]/30 text-xs px-2.5 py-1 rounded-full ml-3 font-bold">{t.photoOptional}</span>
                </label>
                <label className="cursor-pointer bg-black/25 hover:bg-black/40 border-[1.5px] border-white/10 border-dashed text-white/70 p-4 rounded-2xl flex items-center justify-center gap-2 flex-1 transition-all">
                  <Camera size={20} />
                  <span className="cursor-pointer text-sm font-semibold">
                    {isPreparingImage
                      ? t.photoResizing
                      : imageFile
                        ? `${imageFile.name} (${AI_IMAGE_SIZE}x${AI_IMAGE_SIZE} ${t.photoAutoAdjust})`
                        : t.photoUploadHint}
                  </span>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden cursor-pointer" onChange={handleImageChange} />
                </label>
                <p className="mt-2 text-xs text-white/45">
                  {contentMode === "instagram"
                    ? "사진을 올리고 대충 어떤 게시물인지 적으면 캡션과 해시태그를 만듭니다."
                    : `업로드한 사진은 작은 경우 키우고 큰 경우 줄여서 ${AI_IMAGE_SIZE}x${AI_IMAGE_SIZE} 분석용 크기로 자동 변환됩니다.`}
                </p>
                <div className="mt-3 min-h-16">
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-xl border border-white/20 overflow-hidden relative shadow-[0_0_15px_rgba(0,201,255,0.2)]">
                      <NextImage
                        src={imagePreview}
                        alt="preview"
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                      <button onClick={() => { setImageFile(null); setImagePreview(null); setIsPreparingImage(false); }} className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-white">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {contentMode === "seller" && (
              <>
                <div className="flex flex-col">
                  <label className="flex items-center text-white font-semibold mb-2 text-base">{t.sellerInfo}</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="number" name="birthYear" value={formData.birthYear} onChange={handleInputChange} className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans" placeholder={t.birthYearPlaceholder} min="1940" max="2015" />
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="cursor-pointer w-full bg-black/25 border-[1.5px] border-white/10 text-white/70 p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans appearance-none">
                      <option value="" disabled>{t.genderSelect}</option>
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-white font-semibold mb-2 text-base">{t.itemName}</label>
                  <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans" placeholder={t.itemNamePlaceholder} />
                </div>

                <div className="flex flex-col">
                  <label className="text-white font-semibold mb-2 text-base">{t.itemDetails}</label>
                  <textarea name="itemDetails" value={formData.itemDetails} onChange={handleInputChange} className="w-full h-[100px] resize-none bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans leading-relaxed" placeholder={t.itemDetailsPlaceholder} />
                </div>
              </>
            )}

            {contentMode === "instagram" && (
              <div className="flex flex-col">
                <label className="text-white font-semibold mb-2 text-base">게시물 내용 요약</label>
                <textarea
                  name="instagramBrief"
                  value={socialFormData.instagramBrief}
                  onChange={handleSocialInputChange}
                  className="w-full h-[140px] resize-none bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans leading-relaxed"
                  placeholder="예: 오늘 카페에서 찍은 사진. 따뜻하고 조용한 분위기, 주말 기록 느낌으로 자연스럽게 써줘."
                />
              </div>
            )}

            {contentMode === "youtube" && (
              <>
                <div className="flex flex-col">
                  <label className="text-white font-semibold mb-2 text-base">유튜브 영상 URL</label>
                  <input
                    type="url"
                    name="youtubeVideoUrl"
                    value={socialFormData.youtubeVideoUrl}
                    onChange={handleSocialInputChange}
                    className="w-full bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-white font-semibold mb-2 text-base">영상 내용 메모</label>
                  <textarea
                    name="youtubeDetails"
                    value={socialFormData.youtubeDetails}
                    onChange={handleSocialInputChange}
                    className="w-full h-[150px] resize-none bg-black/25 border-[1.5px] border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#ff6f0f] focus:bg-black/40 transition-all font-sans leading-relaxed"
                    placeholder="URL이 없거나 보충하고 싶은 영상 내용을 적어주세요. 예: 핵심 장면, 다룬 주제, 시청자가 얻을 정보."
                  />
                </div>
              </>
            )}

            <button type="button" disabled={contentMode !== "youtube" && isPreparingImage} onClick={handleGenerateClick} className="mt-2 relative overflow-hidden bg-gradient-to-br from-[#ff416c] to-[#ff6f0f] text-white p-5 rounded-2xl text-[1.15rem] font-extrabold cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(255,111,15,0.6)] shadow-[0_8px_25px_rgba(255,111,15,0.4)] disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100">
              <span className="relative z-10 flex items-center justify-center gap-2">{generateButtonLabel} <Sparkles size={20} /></span>
              <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
            </button>
          </div>
        </section>

        {(gachaState === "card_ready" || gachaState === "card_flipped") && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <div className="relative z-50 flex flex-col items-center justify-center w-full max-w-sm perspective-1000">
              <div className="text-center mb-10 min-h-[60px]">
                {gachaState === "card_ready" && <div className="animate-[slideUp_0.4s_ease-out]"><p className="text-white text-xl font-bold animate-bounce">{t.tapCard}</p></div>}
                {gachaState === "card_flipped" && <div className="animate-[slideUp_0.4s_ease-out]"><p className="text-[#ffde00] text-base font-semibold animate-pulse">{t.aiWriting}</p></div>}
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
                  <p className="text-[#5c4a00] font-black text-lg">{loadingSteps[loadingStep]}</p>
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
                    <h2 className="text-[#ffde00] text-xl font-bold m-0">
                      {resultData.mode === "seller"
                        ? t.resultTitle
                        : resultData.mode === "instagram"
                          ? "🎉 인스타 게시물 완성"
                          : "🎉 유튜브 게시물 완성"}
                    </h2>
                  </div>

                  {resultData.mode === "seller" && (
                    <div className="flex bg-black/40 rounded-xl p-1 mb-5">
                      {[
                        { id: "danggeun", label: t.danggeun },
                        { id: "joonggonara", label: t.joonggonara },
                        { id: "bungae", label: t.bungae }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as MarketplacePlatform)}
                          className={`cursor-pointer flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id ? "bg-[#ff6f0f] text-white shadow-md transform scale-[1.02]" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="bg-black/35 p-6 rounded-2xl text-[1.05rem] leading-[1.8] text-[#e6e6e6] font-light border-l-[4px] border-[#ffde00] whitespace-pre-wrap min-h-[150px]">
                    {getDisplayResultText()}
                  </div>

                  {getCurrentHashtags().length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/40 text-xs font-bold">{t.hashtagLabel}</span>
                        <button
                          onClick={copyHashtagsToClipboard}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                            isHashtagCopied
                              ? "bg-[#00c9ff]/30 text-[#00c9ff] border border-[#00c9ff]/50"
                              : "bg-white/5 border border-white/15 text-white/60 hover:bg-[#00c9ff]/10 hover:text-[#00c9ff] hover:border-[#00c9ff]/30"
                          }`}
                        >
                          <Copy size={12} />
                          {isHashtagCopied
                            ? "복사됨 ✓"
                            : resultData?.mode === "youtube"
                              ? "태그 전체 복사 (쉼표 구분)"
                              : "태그 전체 복사"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getCurrentHashtags().map((tag, idx) => (
                          <div key={idx} className="bg-[#00c9ff]/10 border border-[#00c9ff]/30 text-[#00c9ff] text-xs px-2.5 py-1 rounded-full">
                            {typeof tag === "string" && tag.startsWith("#") ? tag : `#${tag}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 판매글 완성 후 통합 공유 마케팅 바 */}
                  <div className="mt-5">
                    <ShareBar
                      compact
                      customText={
                        resultData.mode === "seller"
                          ? "당근·중고나라·번개장터 판매글 AI가 10초에 써줌 😮 사진만 올리면 완성! 무료로 써봐"
                          : "인스타·유튜브 게시물 본문과 해시태그를 AI가 바로 써줌 📸 무료로 써봐"
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="text-center p-5 text-white/70">{errorText || "결과를 불러오지 못했습니다."}</div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={copyToClipboard} className={`flex-1 p-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${isCopied ? "bg-[#ff6f0f] text-white border-transparent" : "border-2 border-[#ff6f0f]/50 text-[#ffa366] hover:bg-[#ff6f0f]/10"}`}>
                  {isCopied ? t.copyDone : <><Copy size={18} /> {t.copyBtn}</>}
                </button>
                <button onClick={shareResult} className="flex-1 p-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#8c52ff] to-[#00c9ff] text-white shadow-lg shadow-[#8c52ff]/30 hover:scale-[1.02]">
                  <Share2 size={18} /> {t.shareBtn}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <div className="mx-auto w-full max-w-[650px] px-5 pb-4 min-h-[186px]">
        <CoupangBanner />
      </div>

      {/* 마케팅 공유 바 — 사이트 전파 유도 */}
      <div className="mx-auto w-full max-w-[650px] px-5 pb-6">
        <ShareBar />
      </div>

      <div className="mx-auto w-full max-w-[650px] px-5 pb-12">
        <HomeEditorialSections />
      </div>

      <AnimatePresence>
        {showRoulette && <RouletteModal locale={locale} isLoggedIn={isLoggedIn} onClose={() => setShowRoulette(false)} onLogin={() => { setShowRoulette(false); signIn("google"); }} />}
      </AnimatePresence>
      <AnimatePresence>{showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}</AnimatePresence>
      <AnimatePresence>{showPayment && <PaymentModal onClose={() => { setShowPayment(false); }} />}</AnimatePresence>
      <AnimatePresence>{showInquiry && <InquiryModal isOpen={showInquiry} onClose={() => setShowInquiry(false)} userEmail={session?.user?.email ?? null} userName={session?.user?.name ?? null} />}</AnimatePresence>
    </>
  );
}
