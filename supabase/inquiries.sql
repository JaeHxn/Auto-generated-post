-- Supabase에서 실행할 SQL
-- 관리자 문의 테이블 (사용자 → 관리자 문의 접수)
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | replied
  admin_reply TEXT,               -- 관리자 답변 내용
  replied_at TIMESTAMPTZ,         -- 답변 시각
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 서비스 롤만 읽기/쓰기 가능 (RLS)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 기존 테이블에 컬럼 추가 (이미 테이블 있을 경우)
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- 인덱스 (이메일, 생성일, 상태 검색용)
CREATE INDEX IF NOT EXISTS inquiries_user_email_idx ON inquiries(user_email);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries(status);
