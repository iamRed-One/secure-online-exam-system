const pool = require('../../db/client');
const { decrypt } = require('../../utils/crypto');
const { createNotification } = require('../notifications/notifications.service');

/**
 * Grade a session for a given student on an exam.
 * Idempotent: returns existing result if already graded.
 */
async function gradeSession(examId, studentId) {
  // Check if result already exists — return cached only if session not re-submitted
  const existing = await pool.query(
    `SELECT r.* FROM results r
     JOIN exam_sessions es ON es.id = r.session_id
     WHERE r.exam_id = $1 AND r.student_id = $2`,
    [examId, studentId]
  );
  if (existing.rows.length > 0) {
    // Delete stale cached result so we always re-grade with latest logic
    await pool.query('DELETE FROM results WHERE exam_id=$1 AND student_id=$2', [examId, studentId]);
  }

  // Get the submitted/flagged session
  const sessionRes = await pool.query(
    `SELECT id, answers, status, question_order, manual_scores
     FROM exam_sessions
     WHERE exam_id = $1 AND student_id = $2 AND status IN ('SUBMITTED', 'FLAGGED')`,
    [examId, studentId]
  );
  if (sessionRes.rows.length === 0) {
    return null;
  }
  const session = sessionRes.rows[0];
  const answers = session.answers || {};
  const questionOrder = session.question_order || [];
  const manualScores = session.manual_scores || {};

  // Grade only the questions in this student's subset (their question_order)
  let questionsRes;
  if (questionOrder.length > 0) {
    questionsRes = await pool.query(
      'SELECT * FROM question_bank WHERE id = ANY($1::uuid[])',
      [questionOrder]
    );
  } else {
    // Backward compat: old sessions with no question_order
    questionsRes = await pool.query(
      'SELECT * FROM question_bank WHERE exam_id = $1',
      [examId]
    );
  }
  const questions = questionsRes.rows;

  let score = 0;
  let total = 0;

  for (const q of questions) {
    total += q.marks;

    if (q.type === 'MCQ') {
      const correctAnswer = decrypt(q.correct_answer).trim().toLowerCase();
      const studentAnswer = (answers[q.id] || '').trim().toLowerCase();
      if (studentAnswer && studentAnswer === correctAnswer) {
        score += q.marks;
      }
    } else if (q.type === 'SHORT') {
      const correctAnswer = decrypt(q.correct_answer).trim().toLowerCase();
      const studentAnswer = (answers[q.id] || '').trim().toLowerCase();
      if (studentAnswer && studentAnswer === correctAnswer) {
        score += q.marks;
      }
    } else if (q.type === 'LONG') {
      const awarded = manualScores[q.id];
      if (awarded !== undefined && awarded !== null) {
        score += Math.min(Number(awarded), q.marks);
      }
    }
  }

  const flagged = session.status === 'FLAGGED';

  const insertRes = await pool.query(
    `INSERT INTO results (session_id, student_id, exam_id, score, total, flagged)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [session.id, studentId, examId, score, total, flagged]
  );

  // Notify student their result is ready
  const examTitleRes = await pool.query(`SELECT title FROM exams WHERE id=$1`, [examId]);
  if (examTitleRes.rows[0]) {
    await createNotification(studentId, 'RESULT_READY',
      `Your result for "${examTitleRes.rows[0].title}" is ready. Score: ${score}/${total}.`, examId);
  }

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
       es.manual_scores AS manual_scores,
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

/**
 * Save a manual score for a LONG answer question.
 * Stores the score on the session then re-grades to update the result.
 */
async function saveManualScore(sessionId, examId, questionId, score, lecturerId) {
  // Verify teacher owns this exam
  const examRes = await pool.query(
    'SELECT id FROM exams WHERE id=$1 AND lecturer_id=$2',
    [examId, lecturerId]
  );
  if (!examRes.rows[0]) return { error: 'Exam not found or not owned by you' };

  // Verify the question is LONG type and belongs to this exam, get max marks
  const qRes = await pool.query(
    'SELECT marks, type FROM question_bank WHERE id=$1 AND exam_id=$2',
    [questionId, examId]
  );
  if (!qRes.rows[0]) return { error: 'Question not found' };
  if (qRes.rows[0].type !== 'LONG') return { error: 'Only LONG questions can be manually graded' };

  const maxMarks = qRes.rows[0].marks;
  if (score < 0 || score > maxMarks) return { error: `Score must be between 0 and ${maxMarks}` };

  // Update manual_scores on the session
  await pool.query(
    `UPDATE exam_sessions
     SET manual_scores = manual_scores || jsonb_build_object($1::text, $2::numeric)
     WHERE id=$3`,
    [questionId, score, sessionId]
  );

  // Re-grade so the result record reflects the new score
  const sessionRow = await pool.query(
    'SELECT student_id FROM exam_sessions WHERE id=$1',
    [sessionId]
  );
  if (!sessionRow.rows[0]) return { error: 'Session not found' };

  const studentId = sessionRow.rows[0].student_id;
  const result = await gradeSession(examId, studentId);

  // Notify the student their score was updated — always insert (no dedup) so
  // each grading action generates a fresh notification
  const examTitleRes = await pool.query(`SELECT title FROM exams WHERE id=$1`, [examId]);
  if (examTitleRes.rows[0] && result) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, exam_id)
       VALUES ($1, 'SCORE_UPDATED', $2, $3)`,
      [
        studentId,
        `Your score for "${examTitleRes.rows[0].title}" has been updated to ${result.score}/${result.total}.`,
        examId,
      ]
    );
  }

  return { result };
}

module.exports = { gradeSession, getStudentResult, getLecturerResults, saveManualScore };
