const pool = require('../../db/client');
const { encrypt, decrypt } = require('../../utils/crypto');

async function addQuestion(body, examId, createdBy) {
  const { content, type, correctAnswer, marks } = body;

  const encryptedContent = encrypt(content);
  const encryptedAnswer = encrypt(correctAnswer);

  const { rows } = await pool.query(
    `INSERT INTO question_bank (exam_id, content, type, correct_answer, marks, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, type, marks`,
    [examId, encryptedContent, type, encryptedAnswer, marks, createdBy]
  );
  return rows[0];
}

async function listQuestions(examId) {
  const { rows } = await pool.query(
    `SELECT id, content, type, correct_answer, marks
     FROM question_bank
     WHERE exam_id = $1`,
    [examId]
  );

  return rows.map((row) => ({
    id: row.id,
    content: decrypt(row.content),
    type: row.type,
    correctAnswer: decrypt(row.correct_answer),
    marks: row.marks,
  }));
}

async function deleteQuestion(questionId, examId, lecturerId) {
  // Verify exam belongs to lecturer and is in DRAFT status
  const { rows: examRows } = await pool.query(
    `SELECT id FROM exams WHERE id = $1 AND lecturer_id = $2 AND status = 'DRAFT'`,
    [examId, lecturerId]
  );
  if (!examRows[0]) return null;

  await pool.query(
    `DELETE FROM question_bank WHERE id = $1 AND exam_id = $2`,
    [questionId, examId]
  );
  return true;
}

module.exports = { addQuestion, listQuestions, deleteQuestion };
