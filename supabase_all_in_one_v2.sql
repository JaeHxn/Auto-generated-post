-- ==============================================================================
-- Magic Seller: Supabase All-in-One Database Setup (버전 2)
-- 이전에 테이블이 잘못 생성되어 있던 컬럼 부재 이슈를 완벽 방어합니다.
-- ==============================================================================

-- 1. users 테이블 기본 구조 생성
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

-- users 테이블에 필요한 모든 컬럼을 "없을때만 추가"하도록 강제
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_count integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_used_date text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credits integer DEFAULT 0 NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;


-- 2. histories 테이블 생성 및 강제 컬럼 복구
CREATE TABLE IF NOT EXISTS public.histories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

-- histories 테이블 컬럼 추가
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS item_name text;
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS item_details text;
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS generated_text text; 
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS platform_versions JSONB;      
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS seo_tags JSONB;               
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
ALTER TABLE public.histories ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 인덱스는 컬럼이 무조건 추가된 후에 생성
CREATE INDEX IF NOT EXISTS histories_user_email_idx ON public.histories (user_email);


-- 3. user_personas 테이블 생성 및 강제 컬럼 복구
CREATE TABLE IF NOT EXISTS public.user_personas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.user_personas ADD COLUMN IF NOT EXISTS user_email text UNIQUE;          
ALTER TABLE public.user_personas ADD COLUMN IF NOT EXISTS instagram_handle text;                    
ALTER TABLE public.user_personas ADD COLUMN IF NOT EXISTS analyzed_tone text;              
ALTER TABLE public.user_personas ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.user_personas ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

CREATE INDEX IF NOT EXISTS user_personas_user_email_idx ON public.user_personas (user_email);


-- 4. payments 테이블 생성 및 강제 컬럼 복구
CREATE TABLE IF NOT EXISTS public.payments (
  transaction_id text PRIMARY KEY
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS credits_added integer;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status text; 
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

CREATE INDEX IF NOT EXISTS payments_user_email_idx ON public.payments (user_email);


-- 5. item-images Storage 버킷 생성 (에러 방지용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage 버킷 보안 정책 (Public Read 설정)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for item-images'
  ) THEN
    CREATE POLICY "Public Access for item-images" 
    ON storage.objects FOR SELECT 
    USING ( bucket_id = 'item-images' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow public uploads to item-images'
  ) THEN
    CREATE POLICY "Allow public uploads to item-images" 
    ON storage.objects FOR INSERT 
    WITH CHECK ( bucket_id = 'item-images' );
  END IF;
END $$;
