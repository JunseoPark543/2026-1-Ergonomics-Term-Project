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

-- Row-level security 비활성화 (service role key로만 접근)
ALTER TABLE sessions           DISABLE ROW LEVEL SECURITY;
ALTER TABLE filtering_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses   DISABLE ROW LEVEL SECURITY;
