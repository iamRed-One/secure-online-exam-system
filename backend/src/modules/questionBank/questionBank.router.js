const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');
const { addQuestion, listQuestions, deleteQuestion, updateQuestion } = require('./questionBank.service');

const router = Router({ mergeParams: true });

// POST /exams/:id/questions — Add question to bank
router.post('/', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const examId = req.params.id;
    const createdBy = req.user.userId;
    const question = await addQuestion(req.body, examId, createdBy);
    res.status(201).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// GET /exams/:id/questions — List all questions (decrypted)
router.get('/', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const examId = req.params.id;
    const questions = await listQuestions(examId);
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list questions' });
  }
});

// PUT /exams/:id/questions/:qid — Update a question
router.put('/:qid', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { id: examId, qid: questionId } = req.params;
    const result = await updateQuestion(questionId, examId, req.body, req.user.role);
    if (!result) return res.status(404).json({ error: 'Question not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /exams/:id/questions/:qid — Delete question (only if exam is DRAFT)
router.delete('/:qid', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { id: examId, qid: questionId } = req.params;
    const lecturerId = req.user.userId;
    const result = await deleteQuestion(questionId, examId, lecturerId, req.user.role);
    if (result === null) {
      return res.status(404).json({ error: 'Question not found or exam is not in DRAFT status' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
