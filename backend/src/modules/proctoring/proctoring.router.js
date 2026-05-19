const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const requireRole  = require('../../middleware/requireRole');
const { logEvent } = require('./proctoring.service');

const router = Router();

router.post('/event', requireAuth, requireRole('STUDENT'), async (req, res) => {
  const { examId, type } = req.body;
  if (!examId || !type)
    return res.status(400).json({ error: 'examId and type are required' });

  const result = await logEvent(examId, req.user.userId, type);
  if (result === null)
    return res.status(400).json({ error: 'Could not log event' });

  // result = { flagged: true/false }
  return res.json({ logged: true, flagged: result.flagged });
});

module.exports = router;
