const pool = require('../../db/client');

async function createExam(body, lecturerId) {
  const {
    title,
    durationSeconds,
    startWindow,
    endWindow,
    violationThreshold = 3,
    gracePeriodSeconds = 60,
  } = body;

  const { rows } = await pool.query(
    `INSERT INTO exams
       (title, lecturer_id, duration_seconds, start_window, end_window, violation_threshold, grace_period_seconds)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, lecturerId, durationSeconds, startWindow, endWindow, violationThreshold, gracePeriodSeconds]
  );
  return rows[0];
}

async function publishExam(examId, lecturerId) {
  const { rows } = await pool.query(
    `UPDATE exams
     SET status = 'PUBLISHED'
     WHERE id = $1 AND lecturer_id = $2 AND status = 'DRAFT'
     RETURNING *`,
    [examId, lecturerId]
  );
  return rows[0] || null;
}

async function enrolStudent(examId, studentId, lecturerId) {
  // Verify the exam belongs to this lecturer
  const { rows: examRows } = await pool.query(
    `SELECT id FROM exams WHERE id = $1 AND lecturer_id = $2`,
    [examId, lecturerId]
  );
  if (!examRows[0]) return null;

  await pool.query(
    `INSERT INTO exam_enrollments (exam_id, student_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [examId, studentId]
  );
  return true;
}

async function listEnrolledExams(studentId) {
  const { rows } = await pool.query(
    `SELECT e.*
     FROM exams e
     JOIN exam_enrollments ee ON ee.exam_id = e.id
     WHERE ee.student_id = $1
     ORDER BY e.start_window DESC`,
    [studentId]
  );
  return rows;
}

async function listMyExams(lecturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM exams WHERE lecturer_id = $1 ORDER BY start_window DESC`,
    [lecturerId]
  );
  return rows;
}

async function getExam(examId, lecturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM exams WHERE id = $1 AND lecturer_id = $2`,
    [examId, lecturerId]
  );
  return rows[0] || null;
}

module.exports = {
  createExam,
  publishExam,
  enrolStudent,
  listEnrolledExams,
  listMyExams,
  getExam,
};
