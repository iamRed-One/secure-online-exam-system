CREATE TABLE IF NOT EXISTS exam_enrollments (
  exam_id    UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (exam_id, student_id)
);