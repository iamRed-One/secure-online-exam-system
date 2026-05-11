const cron = require('node-cron');
const pool = require('../../db/client');

async function runAutoSubmit() {
  try {
    const expiredResult = await pool.query(`
      SELECT es.id, es.student_id, es.exam_id
      FROM exam_sessions es
      JOIN exams e ON e.id = es.exam_id
      WHERE es.status = 'ACTIVE'
        AND now() >= es.start_time + make_interval(secs => e.duration_seconds + e.grace_period_seconds)
    `);

    const expiredSessions = expiredResult.rows;

    for (const session of expiredSessions) {
      const { id, exam_id } = session;

      const violationResult = await pool.query(
        `SELECT COUNT(*) AS high_count
         FROM proctor_logs
         WHERE session_id = $1 AND severity = 'HIGH'`,
        [id]
      );
      const highCount = parseInt(violationResult.rows[0].high_count, 10);

      const examResult = await pool.query(
        `SELECT violation_threshold FROM exams WHERE id = $1`,
        [exam_id]
      );
      const violationThreshold = examResult.rows[0].violation_threshold;

      const newStatus = highCount > violationThreshold ? 'FLAGGED' : 'SUBMITTED';

      await pool.query(
        `UPDATE exam_sessions SET status = $1, submitted_at = now() WHERE id = $2`,
        [newStatus, id]
      );

      console.log(`Auto-submitted session ${id} as ${newStatus}`);
    }
  } catch (err) {
    console.error('Auto-submit job error:', err);
  }
}

function startAutoSubmitJob() {
  cron.schedule('* * * * *', runAutoSubmit);
  console.log('Auto-submit job started');
}

module.exports = { startAutoSubmitJob, runAutoSubmit };
