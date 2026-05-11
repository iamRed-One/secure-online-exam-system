CREATE TABLE IF NOT EXISTS results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES exam_sessions(id),
  student_id UUID NOT NULL REFERENCES users(id),
  exam_id    UUID NOT NULL REFERENCES exams(id),
  score      INT CHECK (score >= 0) NOT NULL DEFAULT 0,
  total      INT CHECK (total > 0) NOT NULL,
  flagged    BOOLEAN DEFAULT false,
  graded_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT score_lte_total CHECK (score <= total)
);