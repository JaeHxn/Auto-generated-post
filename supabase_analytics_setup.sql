-- 사용자 행동 및 마케팅 성과 추적을 위한 테이블
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,          -- 예: 'generate_click', 'copy_click'
    utm_source TEXT,                   -- 마케팅 채널 구분
    utm_medium TEXT,
    metadata JSONB,                    -- 추가 상세 데이터 (물품명 등)
    user_agent TEXT,                   -- 브라우저 정보
    path TEXT,                         -- 발생 페이지 경로
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 익명 유저의 Insert만 허용 (RLS 설정)
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous event logging" 
ON event_logs 
FOR INSERT 
TO public 
WITH CHECK (true);
