const pool = require('../../db/client');
const { decrypt } = require('../../utils/crypto');
const { shuffleQuestions } = require('../../utils/randomize');

async function beginSession(examId, studentId) {
  // Check if there's already an active session
  const { rows: existing } = await pool.query(
    `SELECT id, status FROM exam_sessions WHERE exam_id = $1 AND student_id = $2`,
    [examId, studentId]
  );

  if (existing[0] && existing[0].status === 'ACTIVE') {
    return { error: 'Session already active' };
  }

  // Fetch all question IDs for this exam
  const { rows: questionRows } = await pool.query(
    `SELECT id FROM question_bank WHERE exam_id = $1`,
    [examId]
  );

  const questionIds = questionRows.map((r) => r.id);
  const orderedIds = shuffleQuestions(questionIds, studentId, examId);

  const now = new Date();

  // Try to update existing NOT_STARTED row first
  const { rowCount } = await pool.query(
    `UPDATE exam_sessions
     SET start_time = $1, status = 'ACTIVE', question_order = $2
     WHERE exam_id = $3 AND student_id = $4 AND status = 'NOT_STARTED'`,
    [now, JSON.stringify(orderedIds), examId, studentId]
  );

  let sessionId;
  if (rowCount === 0) {
    // No existing row — insert new one
    const { rows: inserted } = await pool.query(
      `INSERT INTO exam_sessions (exam_id, student_id, start_time, status, question_order)
       VALUES ($1, $2, $3, 'ACTIVE', $4)
       RETURNING id`,
      [examId, studentId, now, JSON.stringify(orderedIds)]
    );
    sessionId = inserted[0].id;
  } else {
    const { rows: updated } = await pool.query(
      `SELECT id FROM exam_sessions WHERE exam_id = $1 AND student_id = $2`,
      [examId, studentId]
    );
    sessionId = updated[0].id;
  }

  return { sessionId, status: 'ACTIVE', startTime: now };
}

async function getNextQuestion(examId, studentId) {
  const { rows } = await pool.query(
    `SELECT question_order, answers
     FROM exam_sessions
     WHERE exam_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
    [examId, studentId]
  );

  if (!rows[0]) return null;

  const questionOrder = rows[0].question_order; // JSONB — already parsed by pg
  const answers = rows[0].answers || {};

  const answeredIds = Object.keys(answers);

  // Find first unanswered question
  const nextId = questionOrder.find((id) => !answeredIds.includes(id));

  if (!nextId) {
    return { done: true };
  }

  // Fetch the question (do NOT return questionId or correct_answer)
  const { rows: qRows } = await pool.query(
    `SELECT content, type, marks FROM question_bank WHERE id = $1`,
    [nextId]
  );

  if (!qRows[0]) return null;

  const question = qRows[0];
  const content = decrypt(question.content);

  return {
    content,
    type: question.type,
    marks: question.marks,
    index: answeredIds.length + 1,
    total: questionOrder.length,
  };
}

async function saveAnswer(examId, studentId, questionIndex, answer) {
  const { rows } = await pool.query(
    `SELECT question_order, answers
     FROM exam_sessions
     WHERE exam_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
    [examId, studentId]
  );

  if (!rows[0]) return null;

  const questionOrder = rows[0].question_order;
  const answers = rows[0].answers || {};

  const questionId = questionOrder[questionIndex - 1];
  if (!questionId) return null;

  answers[questionId] = answer;

  await pool.query(
    `UPDATE exam_sessions SET answers = $1 WHERE exam_id = $2 AND student_id = $3`,
    [JSON.stringify(answers), examId, studentId]
  );

  return true;
}

async function submitSession(examId, studentId) {
  const { rows } = await pool.query(
    `UPDATE exam_sessions
     SET status = 'SUBMITTED', submitted_at = now()
     WHERE exam_id = $1 AND student_id = $2 AND status = 'ACTIVE'
     RETURNING *`,
    [examId, studentId]
  );

  return rows[0] || null;
}

async function getRemainingTime(examId, studentId) {
  const { rows } = await pool.query(
    `SELECT es.start_time, e.duration_seconds, e.grace_period_seconds
     FROM exam_sessions es
     JOIN exams e ON e.id = es.exam_id
     WHERE es.exam_id = $1 AND es.student_id = $2 AND es.status = 'ACTIVE'`,
    [examId, studentId]
  );

  if (!rows[0]) return null;

  const { start_time, duration_seconds, grace_period_seconds } = rows[0];

  const elapsedSeconds = (Date.now() - new Date(start_time).getTime()) / 1000;
  const totalAllowed = duration_seconds + grace_period_seconds;
  const remaining = totalAllowed - elapsedSeconds;

  return Math.max(0, Math.floor(remaining));
}

module.exports = {
  beginSession,
  getNextQuestion,
  saveAnswer,
  submitSession,
  getRemainingTime,
};
