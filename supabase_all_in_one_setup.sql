-- ==============================================================================
-- Magic Seller: Supabase All-in-One Database Setup
-- 실행 방법: Supabase Dashboard -> SQL Editor 에 복사 후 실행 (Run)
-- 이전에 실행하다 오류가 났던 분들을 위해 모든 테이블을 처음부터 검사하고 생성합니다.
-- ==============================================================================

-- 1. users 테이블 생성 (유저 정보, 일일 횟수 및 크레딧 관리)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  image text,
  daily_count integer DEFAULT 0,
  last_used_date text,
  credits integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. histories 테이블 생성 (생성된 판매글 및 JSON 데이터 관리)
CREATE TABLE IF NOT EXISTS public.histories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  item_name text NOT NULL,
  item_details text NOT NULL,
  generated_text text NOT NULL, -- 하위 호환성 및 당근마켓용
  platform_versions JSONB,      -- 위 3개 플랫폼 결과 JSON
  seo_tags JSONB,               -- SEO 태그 JSON 배열
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- user_email 인덱스 추가
CREATE INDEX IF NOT EXISTS histories_user_email_idx ON public.histories (user_email);

-- 만약 이미 옛날 버전의 histories가 있다면 이 쿼리가 돌아서 최신화 해줍니다.
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS platform_versions JSONB;
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS seo_tags JSONB;

-- 3. user_personas 테이블 생성 (인스타 말투/페르소나 분석 모델)
CREATE TABLE IF NOT EXISTS public.user_personas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL UNIQUE,          
  instagram_handle text,                    
  analyzed_tone text NOT NULL,              
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS user_personas_user_email_idx ON public.user_personas (user_email);

-- 4. payments 테이블 생성 (Paddle 결제 내역 저장용)
CREATE TABLE IF NOT EXISTS public.payments (
  transaction_id text PRIMARY KEY,
  user_email text NOT NULL,
  amount text NOT NULL,
  credits_added integer NOT NULL,
  status text NOT NULL, 
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS payments_user_email_idx ON public.payments (user_email);

-- 5. item-images Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage 버킷 보안 정책 (Public Read 설정)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policename = 'Public Access for item-images'
  ) THEN
    CREATE POLICY "Public Access for item-images" 
    ON storage.objects FOR SELECT 
    USING ( bucket_id = 'item-images' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policename = 'Allow public uploads to item-images'
  ) THEN
    -- 누구나 업로드 가능한 임시 정책. 필요 시 auth.role() = 'authenticated' 로 변경하세요.
    CREATE POLICY "Allow public uploads to item-images" 
    ON storage.objects FOR INSERT 
    WITH CHECK ( bucket_id = 'item-images' );
  END IF;
END $$;
