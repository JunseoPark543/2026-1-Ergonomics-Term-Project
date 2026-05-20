-- Supabase SQL Editor에서 실행하세요
-- (프로젝트 최초 배포 시 1회만 실행)

CREATE TABLE IF NOT EXISTS sessions (
  participant_id TEXT PRIMARY KEY,
  group_num      INTEGER NOT NULL,
  paper_set      TEXT    NOT NULL,
  current_step   TEXT    NOT NULL DEFAULT 'pre-test',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS filtering_responses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id   TEXT    NOT NULL,
  phase            TEXT    NOT NULL,
  sentence_id      TEXT    NOT NULL,
  error_type       TEXT    NOT NULL,
  is_noise         BOOLEAN NOT NULL,
  user_response    TEXT    NOT NULL,
  user_revision    TEXT,
  is_correct       BOOLEAN NOT NULL,
  score            INTEGER NOT NULL,
  confidence       INTEGER NOT NULL,
  response_time_ms INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT    NOT NULL,
  question_id    TEXT    NOT NULL,
  likert_score   INTEGER NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token       TEXT PRIMARY KEY,
  role        TEXT NOT NULL,
  identity    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 개념도 데이터 (구조도 조건 참가자)
CREATE TABLE IF NOT EXISTS concept_maps (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  participant_id   TEXT NOT NULL UNIQUE,
  paper_set        TEXT NOT NULL,
  node_count       INTEGER NOT NULL DEFAULT 0,
  edge_count       INTEGER NOT NULL DEFAULT 0,
  edit_count       INTEGER NOT NULL DEFAULT 0,
  duration_sec     INTEGER NOT NULL DEFAULT 0,
  graph_data       JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 메타인지 측정 (지연 퀴즈 직전)
CREATE TABLE IF NOT EXISTS metacognition (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  participant_id   TEXT NOT NULL,
  paper_set        TEXT NOT NULL,
  memory_percent   INTEGER NOT NULL,
  expected_score   INTEGER NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 지연 퀴즈 응답
CREATE TABLE IF NOT EXISTS quiz_responses (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  participant_id   TEXT NOT NULL,
  paper_set        TEXT NOT NULL,
  question_id      TEXT NOT NULL,
  question_type    TEXT NOT NULL,   -- 'recognition' | 'recall' | 'application'
  answer           TEXT NOT NULL,
  is_correct       BOOLEAN,         -- recognition만 자동 채점
  auto_score       INTEGER,         -- recognition: 0 or 1
  manual_score     INTEGER,         -- recall/application: 연구자가 0~3 입력
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- sessions 테이블에 독해 완료 시각 컬럼 추가 (이미 있으면 무시)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reading_completed_at TIMESTAMPTZ;

-- Row-level security 비활성화 (service role key로만 접근)
ALTER TABLE sessions            DISABLE ROW LEVEL SECURITY;
ALTER TABLE filtering_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses    DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions       DISABLE ROW LEVEL SECURITY;
ALTER TABLE concept_maps        DISABLE ROW LEVEL SECURITY;
ALTER TABLE metacognition       DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses      DISABLE ROW LEVEL SECURITY;
