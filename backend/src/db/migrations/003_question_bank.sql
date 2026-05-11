CREATE TABLE IF NOT EXISTS question_bank (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id        UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  type           TEXT CHECK (type IN ('MCQ','SHORT','LONG')) NOT NULL,
  correct_answer TEXT NOT NULL,
  marks          INT CHECK (marks > 0) NOT NULL,
  created_by     UUID NOT NULL REFERENCES users(id)
);