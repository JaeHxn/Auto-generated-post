export type Locale = "ko" | "en" | "nl" | "id" | "de" | "lt";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "lt", label: "Lietuvių", flag: "🇱🇹" },
];

type Dict = {
  tagline: string;
  subtitle: string;
  proVersion: string;
  loginGoogle: string;
  logout: string;
  charge: string;
  storage: string;
  freeCount: string;
  loginBonus: string;
  photoLabel: string;
  photoOptional: string;
  photoUploadHint: string;
  photoResizing: string;
  photoAutoAdjust: string;
  sellerInfo: string;
  birthYearPlaceholder: string;
  genderSelect: string;
  male: string;
  female: string;
  itemName: string;
  itemNamePlaceholder: string;
  itemDetails: string;
  itemDetailsPlaceholder: string;
  generateBtn: string;
  proPersonaTitle: string;
  proPersonaDesc: string;
  proPersonaPlaceholder: string;
  proPersonaBtn: string;
  proPersonaAnalyzing: string;
  tapCard: string;
  aiWriting: string;
  loadingStep0: string;
  loadingStep1: string;
  loadingStep2: string;
  loadingStep3: string;
  resultTitle: string;
  danggeun: string;
  joonggonara: string;
  bungae: string;
  hashtagLabel: string;
  copyBtn: string;
  copyDone: string;
  shareBtn: string;
  rouletteTitle: string;
  rouletteDesc: string;
  rouletteDescLoggedIn: string;
  rouletteSpin: string;
  rouletteSpinning: string;
  rouletteWin: string;
  rouletteLoginBonus: string;
  rouletteNextDay: string;
  rouletteLoginUpgrade: string;
  rouletteLoginBtn: string;
  rouletteClose: string;
  fillAllFields: string;
  imageStillResizing: string;
  heicError: string;
  coupangDisclosure: string;
};

const ko: Dict = {
  tagline: "당신의 중고물품, 명품처럼 포장해 드립니다 🥕",
  subtitle: "Magic Seller",
  proVersion: "PRO VERSION",
  loginGoogle: "Google 로그인",
  logout: "로그아웃",
  charge: "💳 충전",
  storage: "📦 보관함",
  freeCount: "무료 {remaining}/{limit}회",
  loginBonus: "로그인하면 2회 ▶",
  photoLabel: "📸 제품 사진",
  photoOptional: "옵션",
  photoUploadHint: "사진을 업로드하면 AI가 상태를 파악해요",
  photoResizing: "사진을 분석용 크기로 맞추는 중...",
  photoAutoAdjust: "분석용으로 자동 조정",
  sellerInfo: "판매자 정보",
  birthYearPlaceholder: "출생연도 (예: 1990)",
  genderSelect: "성별 선택",
  male: "남성",
  female: "여성",
  itemName: "판매할 물품명",
  itemNamePlaceholder: "예: 다이슨 에어랩 컴플리트 롱",
  itemDetails: "특징 및 장단점 솔직하게",
  itemDetailsPlaceholder: "예: 3년 썼는데 케이스 씌워 써서 상태 좋습니다.",
  generateBtn: "마법처럼 판매글 생성하기 ✨",
  proPersonaTitle: "[PRO] 나만의 인스타 말투 학습 (선택)",
  proPersonaDesc: "내 인스타그램이나 평소 작성했던 글을 붙여넣으세요. AI가 말투를 파악해 나만의 페르소나로 판매글을 적어줍니다.",
  proPersonaPlaceholder: "최근에 쓴 인스타 게시글 본문을 복사해서 붙여넣어주세요 (50자 이상)",
  proPersonaBtn: "말투\n학습하기",
  proPersonaAnalyzing: "분석 중...",
  tapCard: "👇 카드를 터치하여 결과를 확인하세요 👇",
  aiWriting: "🤖 AI가 당신만의 프리미엄 판매글을 작성 중입니다...",
  loadingStep0: "사진 데이터를 분석하는 중...",
  loadingStep1: "판매자의 말투 페르소나를 파악 중...",
  loadingStep2: "당근, 중고나라용 최적화 문구 구성 중...",
  loadingStep3: "마지막으로 완벽한 태그를 뽑는 중...",
  resultTitle: "🎉 맞춤형 판매글 완성",
  danggeun: "🥕 당근마켓",
  joonggonara: "📦 중고나라",
  bungae: "⚡ 번개장터",
  hashtagLabel: "추천 해시태그:",
  copyBtn: "내용 복사하기",
  copyDone: "복사 완료!",
  shareBtn: "공유하기",
  rouletteTitle: "무료 횟수를 다 썼어요!",
  rouletteDesc: "비로그인 무료는 하루 1회입니다.",
  rouletteDescLoggedIn: "오늘 2회 모두 사용했습니다.",
  rouletteSpin: "🎰 행운의 룰렛 돌리기!",
  rouletteSpinning: "룰렛 돌리는 중... 🌀",
  rouletteWin: "당첨!",
  rouletteLoginBonus: "로그인 보너스 +1회 이용권 🎁",
  rouletteNextDay: "내일 다시 무료 횟수가 초기화됩니다.",
  rouletteLoginUpgrade: "구글 로그인하면 하루 2회로 늘어납니다!",
  rouletteLoginBtn: "Google로 로그인하고 받기",
  rouletteClose: "닫기",
  fillAllFields: "판매자 정보와 물품 정보를 모두 입력해 주세요.",
  imageStillResizing: "이미지 처리 중입니다. 잠시 후 다시 시도해 주세요.",
  heicError: "HEIC/HEIF 사진은 JPG, PNG, WEBP로 변환 후 업로드해 주세요.",
  coupangDisclosure: "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.",
};

const en: Dict = {
  tagline: "Turn your secondhand items into premium listings 🥕",
  subtitle: "Magic Seller",
  proVersion: "PRO VERSION",
  loginGoogle: "Sign in with Google",
  logout: "Sign Out",
  charge: "💳 Credits",
  storage: "📦 History",
  freeCount: "{remaining}/{limit} free uses",
  loginBonus: "Sign in for 5 uses ▶",
  photoLabel: "📸 Product Photo",
  photoOptional: "Optional",
  photoUploadHint: "Upload a photo and AI will analyze the condition",
  photoResizing: "Preparing image for AI analysis...",
  photoAutoAdjust: "auto-adjusted for analysis",
  sellerInfo: "Seller Info",
  birthYearPlaceholder: "Birth Year (e.g. 1990)",
  genderSelect: "Select Gender",
  male: "Male",
  female: "Female",
  itemName: "Item Name",
  itemNamePlaceholder: "e.g. Dyson Airwrap Complete Long",
  itemDetails: "Honest Description & Condition",
  itemDetailsPlaceholder: "e.g. Used for 3 years with a case, great condition. One small scratch on corner.",
  generateBtn: "Generate Listing by Magic ✨",
  proPersonaTitle: "[PRO] Learn My Writing Style (Optional)",
  proPersonaDesc: "Paste your Instagram captions or past posts. AI will learn your tone and write listings in your unique voice.",
  proPersonaPlaceholder: "Paste your recent posts here (50+ characters)",
  proPersonaBtn: "Learn\nStyle",
  proPersonaAnalyzing: "Analyzing...",
  tapCard: "👇 Tap the card to reveal your listing 👇",
  aiWriting: "🤖 AI is crafting your premium listing...",
  loadingStep0: "Analyzing photo data...",
  loadingStep1: "Identifying seller persona...",
  loadingStep2: "Crafting optimized copy...",
  loadingStep3: "Generating perfect hashtags...",
  resultTitle: "🎉 Your Listing is Ready",
  danggeun: "🥕 Danggeun",
  joonggonara: "📦 Joonggonara",
  bungae: "⚡ Bungae",
  hashtagLabel: "Suggested hashtags:",
  copyBtn: "Copy Text",
  copyDone: "Copied!",
  shareBtn: "Share",
  rouletteTitle: "You've used all free tries!",
  rouletteDesc: "Free guests get 1 use per day.",
  rouletteDescLoggedIn: "You've used both free tries today.",
  rouletteSpin: "🎰 Spin the Lucky Wheel!",
  rouletteSpinning: "Spinning... 🌀",
  rouletteWin: "Winner!",
  rouletteLoginBonus: "Login Bonus +1 Use 🎁",
  rouletteNextDay: "Your free uses reset tomorrow.",
  rouletteLoginUpgrade: "Sign in with Google for 2 free uses daily!",
  rouletteLoginBtn: "Sign in with Google",
  rouletteClose: "Close",
  fillAllFields: "Please fill in all seller and item fields.",
  imageStillResizing: "Image is still being prepared. Please try again in a moment.",
  heicError: "HEIC/HEIF format not supported. Please convert to JPG, PNG, or WEBP first.",
  coupangDisclosure: "This post is part of the Coupang Partners program and may earn a commission.",
};

const nl: Dict = {
  tagline: "Zet jouw tweedehands items om in premium advertenties 🥕",
  subtitle: "Magic Seller",
  proVersion: "PRO VERSIE",
  loginGoogle: "Inloggen met Google",
  logout: "Uitloggen",
  charge: "💳 Credits",
  storage: "📦 Geschiedenis",
  freeCount: "{remaining}/{limit} gratis gebruik",
  loginBonus: "Log in voor 5 pogingen ▶",
  photoLabel: "📸 Productfoto",
  photoOptional: "Optioneel",
  photoUploadHint: "Upload een foto en AI analyseert de staat",
  photoResizing: "Foto voorbereiden voor AI-analyse...",
  photoAutoAdjust: "automatisch aangepast",
  sellerInfo: "Verkopersinformatie",
  birthYearPlaceholder: "Geboortejaar (bijv. 1990)",
  genderSelect: "Selecteer geslacht",
  male: "Man",
  female: "Vrouw",
  itemName: "Artikelnaam",
  itemNamePlaceholder: "bijv. Dyson Airwrap Complete Long",
  itemDetails: "Eerlijke beschrijving & staat",
  itemDetailsPlaceholder: "bijv. 3 jaar gebruikt met hoesje, goede staat. Klein krasje op hoek.",
  generateBtn: "Genereer advertentie ✨",
  proPersonaTitle: "[PRO] Leer mijn schrijfstijl (Optioneel)",
  proPersonaDesc: "Plak je Instagram-teksten of eerdere berichten. AI leert je toon kennen.",
  proPersonaPlaceholder: "Plak hier je recente berichten (50+ tekens)",
  proPersonaBtn: "Stijl\nLeren",
  proPersonaAnalyzing: "Analyseren...",
  tapCard: "👇 Tik op de kaart om te onthullen 👇",
  aiWriting: "🤖 AI schrijft jouw premium advertentie...",
  loadingStep0: "Fotogegevens analyseren...",
  loadingStep1: "Verkoperspersona bepalen...",
  loadingStep2: "Geoptimaliseerde tekst opstellen...",
  loadingStep3: "Perfecte hashtags genereren...",
  resultTitle: "🎉 Jouw advertentie is klaar",
  danggeun: "🥕 Danggeun",
  joonggonara: "📦 Joonggonara",
  bungae: "⚡ Bungae",
  hashtagLabel: "Aanbevolen hashtags:",
  copyBtn: "Tekst kopiëren",
  copyDone: "Gekopieerd!",
  shareBtn: "Delen",
  rouletteTitle: "Je gratis pogingen zijn op!",
  rouletteDesc: "Gasten krijgen 1 gratis gebruik per dag.",
  rouletteDescLoggedIn: "Je hebt vandaag beide pogingen gebruikt.",
  rouletteSpin: "🎰 Draai het gelukswiel!",
  rouletteSpinning: "Draaien... 🌀",
  rouletteWin: "Gewonnen!",
  rouletteLoginBonus: "Inlogbonus +1 gebruik 🎁",
  rouletteNextDay: "Morgen worden gratis pogingen gereset.",
  rouletteLoginUpgrade: "Log in met Google voor 2 gratis pogingen per dag!",
  rouletteLoginBtn: "Inloggen met Google",
  rouletteClose: "Sluiten",
  fillAllFields: "Vul alle velden in.",
  imageStillResizing: "Afbeelding wordt nog verwerkt. Probeer het over een moment opnieuw.",
  heicError: "HEIC/HEIF-formaat niet ondersteund. Converteer naar JPG, PNG of WEBP.",
  coupangDisclosure: "Dit bericht maakt deel uit van het Coupang Partners-programma en kan een commissie verdienen.",
};

const id: Dict = {
  tagline: "Ubah barang bekas Anda menjadi listing premium 🥕",
  subtitle: "Magic Seller",
  proVersion: "VERSI PRO",
  loginGoogle: "Masuk dengan Google",
  logout: "Keluar",
  charge: "💳 Kredit",
  storage: "📦 Riwayat",
  freeCount: "{remaining}/{limit} penggunaan gratis",
  loginBonus: "Masuk untuk 5 penggunaan ▶",
  photoLabel: "📸 Foto Produk",
  photoOptional: "Opsional",
  photoUploadHint: "Upload foto dan AI akan menganalisis kondisinya",
  photoResizing: "Mempersiapkan gambar untuk analisis AI...",
  photoAutoAdjust: "disesuaikan otomatis",
  sellerInfo: "Info Penjual",
  birthYearPlaceholder: "Tahun Lahir (misal: 1990)",
  genderSelect: "Pilih Jenis Kelamin",
  male: "Laki-laki",
  female: "Perempuan",
  itemName: "Nama Barang",
  itemNamePlaceholder: "misal: Dyson Airwrap Complete Long",
  itemDetails: "Deskripsi & Kondisi Jujur",
  itemDetailsPlaceholder: "misal: Dipakai 3 tahun dengan case, kondisi bagus. Satu goresan kecil di sudut.",
  generateBtn: "Buat Listing dengan Sihir ✨",
  proPersonaTitle: "[PRO] Pelajari Gaya Menulis Saya (Opsional)",
  proPersonaDesc: "Tempel caption Instagram atau postingan lama Anda. AI akan mempelajari nada dan gaya Anda.",
  proPersonaPlaceholder: "Tempel postingan terbaru Anda di sini (50+ karakter)",
  proPersonaBtn: "Pelajari\nGaya",
  proPersonaAnalyzing: "Menganalisis...",
  tapCard: "👇 Ketuk kartu untuk melihat hasilnya 👇",
  aiWriting: "🤖 AI sedang membuat listing premium Anda...",
  loadingStep0: "Menganalisis data foto...",
  loadingStep1: "Mengidentifikasi persona penjual...",
  loadingStep2: "Menyusun teks yang dioptimalkan...",
  loadingStep3: "Menghasilkan hashtag sempurna...",
  resultTitle: "🎉 Listing Anda Siap",
  danggeun: "🥕 Danggeun",
  joonggonara: "📦 Joonggonara",
  bungae: "⚡ Bungae",
  hashtagLabel: "Hashtag yang disarankan:",
  copyBtn: "Salin Teks",
  copyDone: "Disalin!",
  shareBtn: "Bagikan",
  rouletteTitle: "Anda telah menggunakan semua percobaan gratis!",
  rouletteDesc: "Tamu mendapat 1 penggunaan gratis per hari.",
  rouletteDescLoggedIn: "Anda telah menggunakan kedua percobaan hari ini.",
  rouletteSpin: "🎰 Putar Roda Keberuntungan!",
  rouletteSpinning: "Memutar... 🌀",
  rouletteWin: "Menang!",
  rouletteLoginBonus: "Bonus Login +1 Penggunaan 🎁",
  rouletteNextDay: "Percobaan gratis Anda direset besok.",
  rouletteLoginUpgrade: "Masuk dengan Google untuk 2 penggunaan gratis sehari!",
  rouletteLoginBtn: "Masuk dengan Google",
  rouletteClose: "Tutup",
  fillAllFields: "Harap isi semua kolom penjual dan barang.",
  imageStillResizing: "Gambar masih diproses. Coba lagi sebentar.",
  heicError: "Format HEIC/HEIF tidak didukung. Konversi ke JPG, PNG, atau WEBP terlebih dahulu.",
  coupangDisclosure: "Postingan ini adalah bagian dari program Coupang Partners dan dapat menghasilkan komisi.",
};

const de: Dict = {
  tagline: "Verwandle deine Gebrauchtwaren in Premium-Anzeigen 🥕",
  subtitle: "Magic Seller",
  proVersion: "PRO VERSION",
  loginGoogle: "Mit Google anmelden",
  logout: "Abmelden",
  charge: "💳 Credits",
  storage: "📦 Verlauf",
  freeCount: "{remaining}/{limit} kostenlose Nutzungen",
  loginBonus: "Anmelden für 5 Nutzungen ▶",
  photoLabel: "📸 Produktfoto",
  photoOptional: "Optional",
  photoUploadHint: "Lade ein Foto hoch und die KI analysiert den Zustand",
  photoResizing: "Bild für KI-Analyse vorbereiten...",
  photoAutoAdjust: "automatisch angepasst",
  sellerInfo: "Verkäuferinformationen",
  birthYearPlaceholder: "Geburtsjahr (z.B. 1990)",
  genderSelect: "Geschlecht wählen",
  male: "Männlich",
  female: "Weiblich",
  itemName: "Artikelname",
  itemNamePlaceholder: "z.B. Dyson Airwrap Complete Long",
  itemDetails: "Ehrliche Beschreibung & Zustand",
  itemDetailsPlaceholder: "z.B. 3 Jahre mit Hülle benutzt, guter Zustand. Ein kleiner Kratzer an der Ecke.",
  generateBtn: "Anzeige magisch erstellen ✨",
  proPersonaTitle: "[PRO] Meinen Schreibstil lernen (Optional)",
  proPersonaDesc: "Füge deine Instagram-Texte oder früheren Beiträge ein. Die KI lernt deinen Ton kennen.",
  proPersonaPlaceholder: "Füge deine neuesten Beiträge hier ein (50+ Zeichen)",
  proPersonaBtn: "Stil\nLernen",
  proPersonaAnalyzing: "Analysiere...",
  tapCard: "👇 Karte antippen, um zu enthüllen 👇",
  aiWriting: "🤖 KI erstellt deine Premium-Anzeige...",
  loadingStep0: "Fotodaten analysieren...",
  loadingStep1: "Verkäuferpersona ermitteln...",
  loadingStep2: "Optimierten Text erstellen...",
  loadingStep3: "Perfekte Hashtags generieren...",
  resultTitle: "🎉 Deine Anzeige ist fertig",
  danggeun: "🥕 Danggeun",
  joonggonara: "📦 Joonggonara",
  bungae: "⚡ Bungae",
  hashtagLabel: "Empfohlene Hashtags:",
  copyBtn: "Text kopieren",
  copyDone: "Kopiert!",
  shareBtn: "Teilen",
  rouletteTitle: "Alle kostenlosen Versuche aufgebraucht!",
  rouletteDesc: "Gäste erhalten 1 kostenlose Nutzung pro Tag.",
  rouletteDescLoggedIn: "Du hast heute beide Versuche genutzt.",
  rouletteSpin: "🎰 Glücksrad drehen!",
  rouletteSpinning: "Drehe... 🌀",
  rouletteWin: "Gewonnen!",
  rouletteLoginBonus: "Login-Bonus +1 Nutzung 🎁",
  rouletteNextDay: "Kostenlose Nutzungen werden morgen zurückgesetzt.",
  rouletteLoginUpgrade: "Mit Google anmelden für 2 kostenlose Nutzungen täglich!",
  rouletteLoginBtn: "Mit Google anmelden",
  rouletteClose: "Schließen",
  fillAllFields: "Bitte alle Felder ausfüllen.",
  imageStillResizing: "Bild wird noch verarbeitet. Bitte erneut versuchen.",
  heicError: "HEIC/HEIF-Format nicht unterstützt. Bitte in JPG, PNG oder WEBP konvertieren.",
  coupangDisclosure: "Dieser Beitrag ist Teil des Coupang-Partnerprogramms und kann eine Provision verdienen.",
};

const lt: Dict = {
  tagline: "Paversk savo daiktus į premiumo skelbimus 🥕",
  subtitle: "Magic Seller",
  proVersion: "PRO VERSIJA",
  loginGoogle: "Prisijungti su Google",
  logout: "Atsijungti",
  charge: "💳 Kreditai",
  storage: "📦 Istorija",
  freeCount: "{remaining}/{limit} nemokamas naudojimas",
  loginBonus: "Prisijunk ir gauk 5 bandymus ▶",
  photoLabel: "📸 Produkto nuotrauka",
  photoOptional: "Neprivaloma",
  photoUploadHint: "Įkelk nuotrauką ir DI įvertins būklę",
  photoResizing: "Paruošiama nuotrauka DI analizei...",
  photoAutoAdjust: "automatiškai pritaikyta",
  sellerInfo: "Pardavėjo informacija",
  birthYearPlaceholder: "Gimimo metai (pvz. 1990)",
  genderSelect: "Pasirinkti lytį",
  male: "Vyras",
  female: "Moteris",
  itemName: "Prekės pavadinimas",
  itemNamePlaceholder: "pvz. Dyson Airwrap Complete Long",
  itemDetails: "Sąžiningas aprašymas ir būklė",
  itemDetailsPlaceholder: "pvz. Naudotas 3 metus su dėklu, gera būklė. Mažas įbrėžimas kampe.",
  generateBtn: "Sukurti skelbimą magiškai ✨",
  proPersonaTitle: "[PRO] Išmok mano rašymo stilių (Neprivaloma)",
  proPersonaDesc: "Įklijuok savo Instagram tekstus. DI išmoks tavo toną.",
  proPersonaPlaceholder: "Įklijuok naujausius įrašus čia (50+ simbolių)",
  proPersonaBtn: "Išmok\nStilių",
  proPersonaAnalyzing: "Analizuojama...",
  tapCard: "👇 Palieskite kortelę, kad pamatytumėte 👇",
  aiWriting: "🤖 DI kuria tavo premium skelbimą...",
  loadingStep0: "Analizuojami nuotraukos duomenys...",
  loadingStep1: "Nustatoma pardavėjo persona...",
  loadingStep2: "Kuriamas optimizuotas tekstas...",
  loadingStep3: "Generuojami tobuli hashtagai...",
  resultTitle: "🎉 Tavo skelbimas paruoštas",
  danggeun: "🥕 Danggeun",
  joonggonara: "📦 Joonggonara",
  bungae: "⚡ Bungae",
  hashtagLabel: "Rekomenduojami hashtagai:",
  copyBtn: "Kopijuoti tekstą",
  copyDone: "Nukopijuota!",
  shareBtn: "Dalintis",
  rouletteTitle: "Panaudoti visi nemokami bandymai!",
  rouletteDesc: "Svečiai gauna 1 nemokamą naudojimą per dieną.",
  rouletteDescLoggedIn: "Šiandien panaudoti abu bandymai.",
  rouletteSpin: "🎰 Sukti laimės ratą!",
  rouletteSpinning: "Sukasi... 🌀",
  rouletteWin: "Laimėjai!",
  rouletteLoginBonus: "Prisijungimo premija +1 naudojimas 🎁",
  rouletteNextDay: "Nemokami naudojimai bus atnaujinti rytoj.",
  rouletteLoginUpgrade: "Prisijunk su Google ir gauk 2 nemokamus naudojimus per dieną!",
  rouletteLoginBtn: "Prisijungti su Google",
  rouletteClose: "Uždaryti",
  fillAllFields: "Prašome užpildyti visus laukus.",
  imageStillResizing: "Nuotrauka dar apdorojama. Pabandykite dar kartą.",
  heicError: "HEIC/HEIF formatas nepalaikomas. Konvertuokite į JPG, PNG arba WEBP.",
  coupangDisclosure: "Šis įrašas yra dalis 'Coupang Partners' programos ir gali uždirbti komisiją.",
};

const DICTS: Record<Locale, Dict> = { ko, en, nl, id, de, lt };

const STORAGE_KEY = "magic_seller_locale";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "ko";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && DICTS[stored]) return stored;
  const browser = navigator.language.split("-")[0] as Locale;
  if (DICTS[browser]) return browser;
  return "ko";
}

export function setStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, locale);
}

export function useDict(locale: Locale): Dict {
  return DICTS[locale];
}
