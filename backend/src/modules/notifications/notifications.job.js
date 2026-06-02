const cron = require('node-cron');
const pool = require('../../db/client');
const { createNotification } = require('./notifications.service');

async function runNotificationsJob() {
  try {
    const now = new Date();

    // ── 1. Exam starting in ~30 minutes ─────────────────────────────────────
    const soon30 = await pool.query(
      `SELECT e.id, e.title, ee.student_id
       FROM exams e
       JOIN exam_enrollments ee ON ee.exam_id = e.id
       WHERE e.status = 'SCHEDULED'
         AND e.start_window BETWEEN now() + interval '29 minutes'
                                 AND now() + interval '31 minutes'`
    );
    for (const row of soon30.rows) {
      await createNotification(
        row.student_id,
        'EXAM_STARTING_SOON_30',
        `Your exam "${row.title}" starts in 30 minutes.`,
        row.id
      );
    }

    // ── 2. Exam starting in ~10 minutes ─────────────────────────────────────
    const soon10 = await pool.query(
      `SELECT e.id, e.title, ee.student_id
       FROM exams e
       JOIN exam_enrollments ee ON ee.exam_id = e.id
       WHERE e.status = 'SCHEDULED'
         AND e.start_window BETWEEN now() + interval '9 minutes'
                                 AND now() + interval '11 minutes'`
    );
    for (const row of soon10.rows) {
      await createNotification(
        row.student_id,
        'EXAM_STARTING_SOON_10',
        `Your exam "${row.title}" starts in 10 minutes.`,
        row.id
      );
    }

    // ── 3. Exam window just opened ───────────────────────────────────────────
    const opened = await pool.query(
      `SELECT e.id, e.title, ee.student_id
       FROM exams e
       JOIN exam_enrollments ee ON ee.exam_id = e.id
       WHERE e.status = 'SCHEDULED'
         AND e.start_window BETWEEN now() - interval '1 minute' AND now()`
    );
    for (const row of opened.rows) {
      await createNotification(
        row.student_id,
        'EXAM_NOW_OPEN',
        `Your exam "${row.title}" is now open. Good luck!`,
        row.id
      );
    }

  } catch (err) {
    console.error('Notifications job error:', err);
  }
}

function startNotificationsJob() {
  cron.schedule('* * * * *', runNotificationsJob);
  console.log('Notifications job started');
}

module.exports = { startNotificationsJob, runNotificationsJob };
