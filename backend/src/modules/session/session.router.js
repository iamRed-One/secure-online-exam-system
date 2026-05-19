const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');
const {
  beginSession,
  getNextQuestion,
  saveAnswer,
  submitSession,
  getRemainingTime,
} = require('./session.service');

const router = Router();

// All session routes require authentication and STUDENT role
router.use(requireAuth, requireRole('STUDENT'));

// GET /session/status — check current session status for an exam
router.get('/status', async (req, res) => {
  try {
    const { examId } = req.query;
    if (!examId) return res.status(400).json({ error: 'examId required' });
    const { rows } = await require('../../db/client').query(
      `SELECT status FROM exam_sessions WHERE exam_id=$1 AND student_id=$2`,
      [examId, req.user.userId]
    );
    res.json({ status: rows[0]?.status || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /session/begin — start exam session
router.post('/begin', async (req, res) => {
  try {
    const { examId } = req.body;
    if (!examId) return res.status(400).json({ error: 'examId is required' });

    const result = await beginSession(examId, req.user.userId);
    if (result.error) return res.status(409).json({ error: result.error });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /session/question — get current (next unanswered) question
router.get('/question', async (req, res) => {
  try {
    const { examId, index } = req.query;
    if (!examId) return res.status(400).json({ error: 'examId query param is required' });

    const result = await getNextQuestion(examId, req.user.userId, index || null);
    if (result === null) return res.status(404).json({ error: 'No active session found' });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /session/answer — save answer for current question index
router.post('/answer', async (req, res) => {
  try {
    const { examId, questionIndex, answer } = req.body;
    if (!examId) return res.status(400).json({ error: 'examId is required' });
    if (questionIndex == null) return res.status(400).json({ error: 'questionIndex is required' });
    if (answer == null) return res.status(400).json({ error: 'answer is required' });

    const result = await saveAnswer(examId, req.user.userId, questionIndex, answer);
    if (result === null) return res.status(404).json({ error: 'No active session or invalid question index' });

    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /session/submit — final voluntary submission
router.post('/submit', async (req, res) => {
  try {
    const { examId } = req.body;
    if (!examId) return res.status(400).json({ error: 'examId is required' });

    const result = await submitSession(examId, req.user.userId);
    if (!result) return res.status(404).json({ error: 'No active session found' });

    res.json({ status: 'SUBMITTED', submittedAt: result.submitted_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /session/time — poll remaining seconds
router.get('/time', async (req, res) => {
  try {
    const { examId } = req.query;
    if (!examId) return res.status(400).json({ error: 'examId query param is required' });

    const remaining = await getRemainingTime(examId, req.user.userId);
    if (remaining === null) return res.status(404).json({ error: 'No active session found' });

    res.json({ remainingSeconds: remaining });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
