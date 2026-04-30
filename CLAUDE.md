# Magic Seller — CLAUDE.md

## 프로젝트 개요

당근마켓·중고나라·번개장터용 중고 판매글을 AI로 자동 생성해주는 Next.js 웹앱.
사진 업로드 → GPT-4o Vision 분석 → 플랫폼별 맞춤 판매글 + SEO 태그 반환.

배포: Cloudflare Pages (`wrangler.toml` 참고)  
프로덕션 URL: https://daangn-auto-post.pages.dev

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 16 (App Router, Edge Runtime) |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS 4 |
| 인증 | NextAuth v5 beta (Google OAuth) |
| DB | Supabase (users, histories, user_personas) |
| AI | OpenAI GPT-4o (Vision + JSON), GPT-4o-mini |
| 결제 | Paddle |
| Rate limit | Upstash Redis |
| 애니메이션 | Framer Motion |
| 배포 | Cloudflare Pages (via wrangler) |

## 주요 파일 구조

```
app/
  page.tsx              ← 메인 UI (Client Component, "use client")
  actions.ts            ← Server Actions: generateSellerCopy, analyzeAndSavePersona
  layout.tsx            ← 루트 레이아웃, SEO 메타데이터
  globals.css           ← 전역 스타일 + 커스텀 keyframes
  HistoryModal.tsx      ← 보관함 모달
  components/
    HomeEditorialSections.tsx  ← 하단 에디토리얼 섹션
    PaymentModal.tsx           ← 크레딧 충전 모달
    SiteFooter.tsx             ← 푸터
  api/
    auth/[...nextauth]/route.ts ← NextAuth 핸들러
    api/webhooks/paddle/route.ts ← Paddle 결제 웹훅
lib/
  analytics.ts          ← trackEvent 유틸
  supabase.ts           ← Supabase admin 클라이언트
auth.ts                 ← NextAuth 설정 (Google Provider)
```

## 개발 명령어

```bash
npm run dev      # 로컬 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## 필수 환경변수 (.env.local)

```
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
ADMIN_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 핵심 아키텍처 결정사항

### Edge Runtime
`app/page.tsx` 상단에 `export const runtime = "edge"` 선언.
모든 Server Action과 API Route도 Edge 호환이어야 함.

### TypeScript 빌드 에러 무시
`next.config.ts`에 `typescript.ignoreBuildErrors: true` 설정.
NextAuth v5 beta의 route handler 타입 버그 우회용 — 의도적.

### 이미지 처리
클라이언트에서 `canvas`로 1400×1400 JPEG로 리사이즈 후 base64로 서버 전송.
HEIC/HEIF 포맷은 서버에서 처리 불가 → 클라이언트에서 사전 차단.

### 결과 품질 보장
`actions.ts`의 `isLowQualityCopy()` → 부족하면 `expandCopyToMeetQuality()` 재시도.
최소 길이: 당근 360자, 중고나라 420자, 번개 320자. 각 3블록 이상.

### 사용 제한
- 비로그인: 하루 2회 (localStorage 기반)
- 로그인: 하루 2회 (Supabase `users` 테이블)
- 크레딧 소진 시 Paddle 결제 유도

### 룰렛 보너스 정책 (2026-05-01 확정)
- 비로그인 유저가 하루 2회 소진 시 → 룰렛 1회 제공 (하루 1회 한정)
- 룰렛 결과: **항상 +1 사용권 당첨** (고정, 랜덤 없음)
- 로그인 유저: 룰렛 미적용, 2회 소진 후 크레딧/결제 유도
- 룰렛 사용 여부: localStorage `magic_seller_roulette_date` (날짜 == today 이면 사용함)
- 당일 룰렛 소진 후 추가 사용 시도 → 결제 모달(Paddle) 자동 팝업
- **절대 변경 금지**: 룰렛 확률을 임의로 바꾸거나 랜덤 결과로 변경하지 말 것

## 코드 수정 시 주의사항

- `actions.ts` 수정 시 Edge 호환 API만 사용 (Node.js 전용 API 사용 불가)
- Supabase 연결 실패 시에도 기본 동작 유지 (graceful degradation 패턴 유지)
- `ADMIN_EMAIL` 계정은 무제한 사용 가능 — 제한 로직 적용 금지
- 가비지 수집 되지 않은 임시 파일 (`tmp_*.bin`, `tmp_*.ico` 등) 삭제 가능
