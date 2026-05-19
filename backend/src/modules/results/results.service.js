const pool = require('../../db/client');
const { decrypt } = require('../../utils/crypto');

/**
 * Grade a session for a given student on an exam.
 * Idempotent: returns existing result if already graded.
 */
async function gradeSession(examId, studentId) {
  // Check if result already exists (idempotent)
  const existing = await pool.query(
    'SELECT * FROM results WHERE exam_id = $1 AND student_id = $2',
    [examId, studentId]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Get the submitted/flagged session
  const sessionRes = await pool.query(
    `SELECT id, answers, status
     FROM exam_sessions
     WHERE exam_id = $1 AND student_id = $2 AND status IN ('SUBMITTED', 'FLAGGED')`,
    [examId, studentId]
  );
  if (sessionRes.rows.length === 0) {
    return null;
  }
  const session = sessionRes.rows[0];
  const answers = session.answers || {};

  // Get all questions for this exam
  const questionsRes = await pool.query(
    'SELECT * FROM question_bank WHERE exam_id = $1',
    [examId]
  );
  const questions = questionsRes.rows;

  let score = 0;
  let total = 0;

  for (const q of questions) {
    total += q.marks;

    if (q.type === 'MCQ') {
      const correctAnswer = decrypt(q.correct_answer).trim();
      const studentAnswer = (answers[q.id] || '').trim();
      if (studentAnswer === correctAnswer) {
        score += q.marks;
      }
    }
    // SHORT/LONG: skip scoring, manual grading later
  }

  const flagged = session.status === 'FLAGGED';

  const insertRes = await pool.query(
    `INSERT INTO results (session_id, student_id, exam_id, score, total, flagged)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [session.id, studentId, examId, score, total, flagged]
  );

  return insertRes.rows[0];
}

/**
 * Get (and grade if needed) a student's result for an exam.
 */
async function getStudentResult(examId, studentId) {
  return gradeSession(examId, studentId);
}

/**
 * Get all student results for an exam, verified by lecturer ownership.
 * Returns null if exam not found or not owned by this lecturer.
 */
async function getLecturerResults(examId, lecturerId) {
  // Verify exam belongs to this lecturer
  const examRes = await pool.query(
    'SELECT id FROM exams WHERE id = $1 AND lecturer_id = $2',
    [examId, lecturerId]
  );
  if (examRes.rows.length === 0) {
    return null;
  }

  const resultsRes = await pool.query(
    `SELECT r.*, u.email AS student_email, es.status AS session_status,
       es.answers AS session_answers,
       (SELECT json_agg(pl ORDER BY pl.timestamp)
        FROM proctor_logs pl WHERE pl.session_id = es.id) AS violations
     FROM results r
     JOIN users u ON u.id = r.student_id
     JOIN exam_sessions es ON es.id = r.session_id
     WHERE r.exam_id = $1
     ORDER BY r.score DESC`,
    [examId]
  );

  return resultsRes.rows;
}

module.exports = { gradeSession, getStudentResult, getLecturerResults };
