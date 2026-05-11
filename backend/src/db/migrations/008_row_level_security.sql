ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_own_session ON exam_sessions;
DROP POLICY IF EXISTS student_own_result ON results;

CREATE POLICY student_own_session ON exam_sessions
  FOR SELECT
  USING (student_id::TEXT = current_setting('app.current_user_id', true));

CREATE POLICY student_own_result ON results
  FOR SELECT
  USING (student_id::TEXT = current_setting('app.current_user_id', true));
