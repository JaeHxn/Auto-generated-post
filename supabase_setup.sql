-- Supabase SQL Dashboard에서 실행해야 하는 스키마 쿼리입니다.
-- 1. histories 테이블 생성
CREATE TABLE IF NOT EXISTS public.histories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  item_name text NOT NULL,
  item_details text NOT NULL,
  generated_text text NOT NULL,
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- (선택) user_email에 대한 인덱스 추가 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS histories_user_email_idx ON public.histories (user_email);
