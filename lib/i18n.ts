// Edge Runtime 호환 (Node.js 전용 API 없음)

export type Locale = "ko" | "en";

const translations = {
  ko: {
    // 헤더 / 인증
    "header.proVersion": "PRO VERSION",
    "header.tagline": "당신의 중고물품, 명품처럼 포장해 드립니다 🥕",
    "header.charge": "💳 충전",
    "header.storage": "📦 보관함",
    "header.logout": "로그아웃",
    "header.loginGoogle": "Google 로그인",
    "header.loginBenefit": "로그인하면 2회 ▶",
    "header.freeCountLoggedIn": (remaining: number, limit: number, credits: number | null) =>
      credits !== null
        ? `무료 ${remaining}/${limit}회 + 크레딧 ${credits}💎`
        : `무료 ${remaining}/${limit}회`,
    "header.freeCountGuest": (remaining: number, limit: number) =>
      `무료 ${remaining}/${limit}회`,

    // 페르소나(인스타 말투 학습) 섹션
    "persona.title": "[PRO] 나만의 인스타 말투 학습 (선택)",
    "persona.description":
      "내 인스타그램이나 평소 작성했던 글을 붙여넣으세요. AI가 말투, 이모지, 성향을 파악해 나만의 페르소나로 판매글을 적어줍니다.",
    "persona.placeholder":
      "최근에 쓴 인스타 게시글 본문 여러개를 복사해서 여기에 붙여넣어주세요 (50자 이상)",
    "persona.analyzing": "분석 중...",
    "persona.learnButton": "말투\n학습하기",
    "persona.alertLoginRequired":
      "커스텀 말투 학습은 로그인(PRO) 유저만 사용 가능합니다!",
    "persona.alertTooShort":
      "정확한 분석을 위해 게시글 내용을 50자 이상 입력해주세요!",
    "persona.alertSuccess":
      "✅ 말투 학습 완료! 이제 작성되는 글에 회원님만의 매력적인 말투가 묻어납니다.",

    // 폼 — 사진 업로드
    "form.photoLabel": "📸 제품 사진",
    "form.photoOptional": "옵션",
    "form.photoPreparingImage": (size: number) =>
      `사진을 ${size}x${size} 분석용 크기로 맞추는 중...`,
    "form.photoReady": (name: string, size: number) =>
      `${name} (${size}x${size} 분석용으로 자동 조정)`,
    "form.photoDefault": "사진을 업로드하면 AI가 상태를 파악해요",
    "form.photoHint": (size: number) =>
      `업로드한 사진은 작은 경우 키우고 큰 경우 줄여서 ${size}x${size} 분석용 크기로 자동 변환됩니다.`,
    "form.photoAlertHeic":
      "HEIC/HEIF 사진은 바로 분석하지 못합니다. JPG, PNG, WEBP 형식으로 변환 후 업로드해 주세요.",
    "form.photoAlertError":
      "사진 처리 중 오류가 발생했습니다. 다른 사진으로 다시 시도해 주세요.",

    // 폼 — 판매자 정보
    "form.sellerInfoLabel": "판매자 정보",
    "form.birthYearPlaceholder": "출생연도 (예: 1990)",
    "form.genderPlaceholder": "성별 선택",
    "form.genderMale": "남성",
    "form.genderFemale": "여성",

    // 폼 — 물품 정보
    "form.itemNameLabel": "판매할 물품명",
    "form.itemNamePlaceholder": "예: 다이슨 에어랩 컴플리트 롱",
    "form.itemDetailsLabel": "특징 및 장단점 솔직하게",
    "form.itemDetailsPlaceholder":
      "예: 3년 썼는데 케이스 씌워 써서 상태 좋습니다. 모서리 흠집 하나 있음.",

    // 폼 — 생성 버튼
    "form.generateButton": "마법처럼 판매글 생성하기",
    "form.alertFillAll": "Please fill in all seller and item fields.",
    "form.alertImagePreparing":
      "Image is still being resized for AI analysis. Please try again in a moment.",

    // 가챠(카드) 오버레이
    "gacha.tapPrompt": "👇 카드를 터치하여 결과를 확인하세요 👇",
    "gacha.generating": "🤖 AI가 당신만의 프리미엄 판매글을 작성 중입니다...",
    "gacha.cardAria": "카드 열기",
    "gacha.cardSecret": "SECRET",
    "gacha.cardTap": "Tap to Open",

    // 로딩 단계 메시지
    "loading.step0": "사진 데이터를 분석하는 중...",
    "loading.step1": "판매자의 말투 페르소나를 파악 중...",
    "loading.step2": "당근, 중고나라용 최적화 문구 구성 중...",
    "loading.step3": "마지막으로 완벽한 태그를 뽑는 중...",

    // 결과 섹션
    "result.title": "🎉 맞춤형 판매글 완성",
    "result.tabDaanggeun": "🥕 당근마켓",
    "result.tabJoonggonara": "📦 중고나라",
    "result.tabBungae": "⚡ 번개장터",
    "result.hashtagLabel": "추천 해시태그:",
    "result.errorFallback": "결과를 불러오지 못했습니다.",
    "result.copyButton": "내용 복사하기",
    "result.copiedButton": "복사 완료!",
    "result.shareButton": "공유하기",
    "result.shareTitle": "Magic Seller AI 프리미엄 판매글",

    // 룰렛 모달
    "roulette.limitExceeded": "무료 횟수를 다 썼어요!",
    "roulette.limitDescLoggedIn": (limit: number) =>
      `오늘 ${limit}회 모두 사용했습니다.`,
    "roulette.limitDescGuest": (limit: number) =>
      `비로그인 무료는 하루 ${limit}회입니다.`,
    "roulette.spinButton": "🎰 행운의 룰렛 돌리기!",
    "roulette.spinningButton": "룰렛 돌리는 중... 🌀",
    "roulette.winTitle": "당첨!",
    "roulette.winPrize": "로그인 보너스 +1회 이용권 🎁",
    "roulette.winDescLoggedIn": "내일 다시 무료 횟수가 초기화됩니다.",
    "roulette.winDescGuest": "구글 로그인하면 하루 2회로 늘어납니다!",
    "roulette.loginForFive": "Google로 로그인하고 2회 받기",
    "roulette.close": "닫기",
    "roulette.prizeLabel": "로그인 +1",
  },

  en: {
    // Header / auth
    "header.proVersion": "PRO VERSION",
    "header.tagline": "We package your used items like luxury goods 🥕",
    "header.charge": "💳 Top Up",
    "header.storage": "📦 History",
    "header.logout": "Sign out",
    "header.loginGoogle": "Sign in with Google",
    "header.loginBenefit": "Login for 5 uses ▶",
    "header.freeCountLoggedIn": (remaining: number, limit: number, credits: number | null) =>
      credits !== null
        ? `Free ${remaining}/${limit} + Credits ${credits}💎`
        : `Free ${remaining}/${limit}`,
    "header.freeCountGuest": (remaining: number, limit: number) =>
      `Free ${remaining}/${limit}`,

    // Persona (Instagram tone learning) section
    "persona.title": "[PRO] Learn My Writing Style (Optional)",
    "persona.description":
      "Paste your Instagram posts or any text you've written. The AI will learn your tone, emoji usage, and personality to write listings in your unique voice.",
    "persona.placeholder":
      "Paste several recent Instagram captions here (50+ characters)",
    "persona.analyzing": "Analyzing...",
    "persona.learnButton": "Learn\nStyle",
    "persona.alertLoginRequired":
      "Custom tone learning is only available for logged-in (PRO) users!",
    "persona.alertTooShort":
      "Please enter at least 50 characters for accurate analysis!",
    "persona.alertSuccess":
      "✅ Style learning complete! Your listings will now reflect your unique personality.",

    // Form — photo upload
    "form.photoLabel": "📸 Product Photo",
    "form.photoOptional": "Optional",
    "form.photoPreparingImage": (size: number) =>
      `Resizing photo to ${size}x${size} for AI analysis...`,
    "form.photoReady": (name: string, size: number) =>
      `${name} (auto-adjusted to ${size}x${size})`,
    "form.photoDefault": "Upload a photo so the AI can assess condition",
    "form.photoHint": (size: number) =>
      `Uploaded photos are automatically resized to ${size}x${size} for AI analysis.`,
    "form.photoAlertHeic":
      "HEIC/HEIF photos cannot be analyzed directly. Please convert to JPG, PNG, or WEBP first.",
    "form.photoAlertError":
      "An error occurred while processing the photo. Please try again with a different image.",

    // Form — seller info
    "form.sellerInfoLabel": "Seller Info",
    "form.birthYearPlaceholder": "Birth year (e.g. 1990)",
    "form.genderPlaceholder": "Select gender",
    "form.genderMale": "Male",
    "form.genderFemale": "Female",

    // Form — item info
    "form.itemNameLabel": "Item Name",
    "form.itemNamePlaceholder": "e.g. Dyson Airwrap Complete Long",
    "form.itemDetailsLabel": "Honest Features & Condition",
    "form.itemDetailsPlaceholder":
      "e.g. Used for 3 years with a case — good condition. One small scratch on the corner.",

    // Form — generate button
    "form.generateButton": "Generate Listing ✨",
    "form.alertFillAll": "Please fill in all seller and item fields.",
    "form.alertImagePreparing":
      "Image is still being resized for AI analysis. Please try again in a moment.",

    // Gacha (card) overlay
    "gacha.tapPrompt": "👇 Tap the card to reveal your result 👇",
    "gacha.generating": "🤖 AI is crafting your premium listing...",
    "gacha.cardAria": "Open card",
    "gacha.cardSecret": "SECRET",
    "gacha.cardTap": "Tap to Open",

    // Loading step messages
    "loading.step0": "Analyzing photo data...",
    "loading.step1": "Identifying seller tone and persona...",
    "loading.step2": "Composing optimized copy for each platform...",
    "loading.step3": "Generating the perfect hashtags...",

    // Result section
    "result.title": "🎉 Your Custom Listing is Ready",
    "result.tabDaanggeun": "🥕 Daanggeun",
    "result.tabJoonggonara": "📦 Joonggonara",
    "result.tabBungae": "⚡ Bungae",
    "result.hashtagLabel": "Recommended hashtags:",
    "result.errorFallback": "Failed to load result.",
    "result.copyButton": "Copy Text",
    "result.copiedButton": "Copied!",
    "result.shareButton": "Share",
    "result.shareTitle": "Magic Seller AI Premium Listing",

    // Roulette modal
    "roulette.limitExceeded": "You've used all your free tries!",
    "roulette.limitDescLoggedIn": (limit: number) =>
      `You've used all ${limit} free uses for today.`,
    "roulette.limitDescGuest": (limit: number) =>
      `Guests get ${limit} free use per day.`,
    "roulette.spinButton": "🎰 Spin the Wheel!",
    "roulette.spinningButton": "Spinning... 🌀",
    "roulette.winTitle": "You Won!",
    "roulette.winPrize": "Login Bonus +1 Use 🎁",
    "roulette.winDescLoggedIn": "Your free uses reset again tomorrow.",
    "roulette.winDescGuest": "Sign in with Google to get 2 free uses per day!",
    "roulette.loginForFive": "Sign in with Google and get 5 uses",
    "roulette.close": "Close",
    "roulette.prizeLabel": "Login +1",
  },
} as const;

export type TranslationKey = keyof typeof translations.ko;

type Translations = typeof translations.ko;

/**
 * Returns a type-safe `t(key)` translation function for the given locale.
 * Defaults to 'ko' when no locale is provided.
 *
 * Works in Edge Runtime — no Node.js-only APIs used.
 *
 * @example
 * const { t } = useTranslation('en');
 * t('form.generateButton'); // "Generate Listing ✨"
 */
export function useTranslation(locale: Locale = "ko"): { t: <K extends TranslationKey>(key: K) => Translations[K] } {
  const dict = translations[locale] as Translations;

  function t<K extends TranslationKey>(key: K): Translations[K] {
    return dict[key];
  }

  return { t };
}

/**
 * Standalone translation function — useful outside React components.
 *
 * @example
 * t('ko', 'result.title'); // "🎉 맞춤형 판매글 완성"
 */
export function t<K extends TranslationKey>(locale: Locale, key: K): Translations[K] {
  const dict = translations[locale] as Translations;
  return dict[key];
}

/**
 * Convenience helper that returns the four loading-step strings for a given locale.
 * Safe to call outside React components (no hook dependency).
 */
export function getLoadingSteps(locale: Locale = "ko"): [string, string, string, string] {
  const dict = translations[locale] as Translations;
  return [
    dict["loading.step0"] as string,
    dict["loading.step1"] as string,
    dict["loading.step2"] as string,
    dict["loading.step3"] as string,
  ];
}

export default translations;
