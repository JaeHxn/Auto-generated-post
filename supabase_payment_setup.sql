-- Supabase SQL Editor에서 실행
-- 1. 기존 users 테이블에 충전된 크레딧 보관용 컬럼 추가 (없을 경우)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credits integer DEFAULT 0 NOT NULL;

-- 2. payments (결제 내역) 테이블 생성
CREATE TABLE IF NOT EXISTS public.payments (
  transaction_id text PRIMARY KEY,
  user_email text NOT NULL,
  amount text NOT NULL, -- 화폐 단위 포함 문자열이나 숫자 가능 (예: "15.00 USD")
  credits_added integer NOT NULL,
  status text NOT NULL, -- 'completed', 'past_due' 등
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS payments_user_email_idx ON public.payments (user_email);
