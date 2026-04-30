-- Supabase에서 실행할 SQL
-- 접속 로그 테이블 (관리자 대시보드용 IP/국가 추적)
CREATE TABLE IF NOT EXISTS access_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT,
  country TEXT,
  user_agent TEXT,
  path TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 서비스 롤만 읽기/쓰기 가능 (RLS)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- 인덱스 (country, ip, created_at 검색용)
CREATE INDEX IF NOT EXISTS access_logs_country_idx ON access_logs(country);
CREATE INDEX IF NOT EXISTS access_logs_ip_idx ON access_logs(ip);
CREATE INDEX IF NOT EXISTS access_logs_created_at_idx ON access_logs(created_at DESC);
