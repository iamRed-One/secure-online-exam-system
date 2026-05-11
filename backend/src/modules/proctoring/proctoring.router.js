const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');
const { logEvent } = require('./proctoring.service');

const router = Router();

// POST /proctor/event — log a proctoring violation event
router.post(
  '/event',
  requireAuth,
  requireRole('STUDENT'),
  async (req, res) => {
    const { examId, type } = req.body;
    const studentId = req.user.id;

    if (!examId || !type) {
      return res.status(400).json({ error: 'examId and type are required' });
    }

    const result = await logEvent(examId, studentId, type);
    if (result === null) {
      return res.status(400).json({ error: 'Could not log event' });
    }

    return res.json({ logged: true });
  }
);

module.exports = router;
