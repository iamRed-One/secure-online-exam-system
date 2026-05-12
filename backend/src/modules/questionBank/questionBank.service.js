const pool = require('../../db/client');
const { encrypt, decrypt } = require('../../utils/crypto');

async function addQuestion(body, examId, createdBy) {
  const { content, type, correctAnswer, marks, options } = body;

  const encryptedContent = encrypt(content);
  const encryptedAnswer  = encrypt(correctAnswer);
  // For MCQ, encrypt the options array as a JSON string
  const encryptedOptions = (type === 'MCQ' && options)
    ? encrypt(JSON.stringify(options))
    : null;

  const { rows } = await pool.query(
    `INSERT INTO question_bank (exam_id, content, type, correct_answer, marks, created_by, options)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, type, marks`,
    [examId, encryptedContent, type, encryptedAnswer, marks, createdBy, encryptedOptions]
  );
  return rows[0];
}

async function listQuestions(examId) {
  const { rows } = await pool.query(
    `SELECT id, content, type, correct_answer, marks, options
     FROM question_bank WHERE exam_id = $1`,
    [examId]
  );

  return rows.map((row) => ({
    id:            row.id,
    content:       decrypt(row.content),
    type:          row.type,
    correctAnswer: decrypt(row.correct_answer),
    marks:         row.marks,
    options:       row.options ? JSON.parse(decrypt(row.options)) : null,
  }));
}

async function deleteQuestion(questionId, examId, lecturerId) {
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
