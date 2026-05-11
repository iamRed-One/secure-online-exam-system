CREATE TABLE IF NOT EXISTS exam_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id        UUID NOT NULL REFERENCES exams(id),
  student_id     UUID NOT NULL REFERENCES users(id),
  start_time     TIMESTAMPTZ,
  submitted_at   TIMESTAMPTZ,
  question_order JSONB NOT NULL DEFAULT '[]',
  answers        JSONB NOT NULL DEFAULT '{}',
  status         TEXT CHECK (status IN ('NOT_STARTED','ACTIVE','SUBMITTED','FLAGGED')) DEFAULT 'NOT_STARTED',
  UNIQUE (exam_id, student_id)
);