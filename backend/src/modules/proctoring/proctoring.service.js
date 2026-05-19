const pool = require('../../db/client');

const SEVERITY_MAP = {
  TAB_SWITCH:      'HIGH',
  FULLSCREEN_EXIT: 'HIGH',
  DEVTOOLS:        'HIGH',
  CLIPBOARD:       'MEDIUM',
  RIGHT_CLICK:     'LOW',
};

async function logEvent(examId, studentId, type) {
  // 1. Look up severity; unknown type → null
  const severity = SEVERITY_MAP[type];
  if (!severity) return null;

  // 2. Find student's ACTIVE or FLAGGED session
  const sessionRes = await pool.query(
    `SELECT es.id FROM exam_sessions es
     WHERE es.exam_id=$1 AND es.student_id=$2 AND es.status IN ('ACTIVE','FLAGGED')`,
    [examId, studentId]
  );
  if (sessionRes.rows.length === 0) return null;
  const sessionId = sessionRes.rows[0].id;

  // 3. Insert into proctor_logs
  await pool.query(
    `INSERT INTO proctor_logs (session_id, event_type, severity) VALUES ($1, $2, $3)`,
    [sessionId, type, severity]
  );

  // 4. If HIGH severity, check threshold and possibly flag session
  if (severity === 'HIGH') {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM proctor_logs WHERE session_id=$1 AND severity='HIGH'`,
      [sessionId]
    );
    const highCount = parseInt(countRes.rows[0].count, 10);

    const examRes = await pool.query(
      `SELECT violation_threshold FROM exams WHERE id=$1`,
      [examId]
    );
    const threshold = examRes.rows[0]?.violation_threshold ?? null;

    if (threshold !== null && highCount > threshold) {
      await pool.query(
        `UPDATE exam_sessions SET status='FLAGGED' WHERE id=$1 AND status='ACTIVE'`,
        [sessionId]
      );
      return { flagged: true };
    }
  }

  return { flagged: false };
}

module.exports = { logEvent };
