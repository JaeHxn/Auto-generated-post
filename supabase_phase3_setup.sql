-- ==============================================================================
-- Magic Seller Phase 3: Supabase Database & Storage Setup
-- 실행 방법: Supabase Dashboard -> SQL Editor 에 복사 후 실행 (Run)
-- ==============================================================================

-- 1. histories 테이블 업데이트 (JSON 변환 및 다중 플랫폼, SEO 태그 지원용 컬럼 추가)
ALTER TABLE public.histories
ADD COLUMN IF NOT EXISTS platform_versions JSONB,
ADD COLUMN IF NOT EXISTS seo_tags JSONB;

-- 2. user_personas 테이블 생성 (인스타그램 말투/페르소나 학습 데이터 저장용)
CREATE TABLE IF NOT EXISTS public.user_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,          -- users 테이블과 매핑될 이메일
  instagram_handle TEXT,                    -- 연동/입력한 인스타 아이디 (옵션)
  analyzed_tone TEXT NOT NULL,              -- AI가 분석한 말투 특성 (프롬프트 주입용)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 페르소나 테이블 인덱스
CREATE INDEX IF NOT EXISTS user_personas_user_email_idx ON public.user_personas (user_email);

-- 3. item-images Storage 버킷 생성
-- 주의: 이미 존재하는 경우 아래 쿼리는 무시되거나 에러가 날 수 있습니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- 버킷 접근 정책 (Public Read 설정)
CREATE POLICY "Public Access for item-images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'item-images' );

-- 로그인된 사용자용 이미지 업로드 허용 정책 (원하면 적용, 현재는 간단히 누구나 업로드 가능하게 하거나 Auth 연동 필요)
CREATE POLICY "Allow authenticated uploads to item-images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'item-images' AND auth.role() = 'authenticated' );

-- (비로그인도 업로드해야 한다면 아래 정책 사용 - 스팸 방지 레이트 리밋은 앱에서 처리)
CREATE POLICY "Allow public uploads to item-images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'item-images' );
