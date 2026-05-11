const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');
const { getStudentResult, getLecturerResults } = require('./results.service');

// GET /session/result — STUDENT: get own result for an exam
const studentResultRouter = Router();

studentResultRouter.get(
  '/result',
  requireAuth,
  requireRole('STUDENT'),
  async (req, res) => {
    try {
      const { examId } = req.query;
      if (!examId) return res.status(400).json({ error: 'examId query param is required' });

      const result = await getStudentResult(examId, req.user.userId);
      if (result === null) {
        return res.status(404).json({ error: 'No submitted session found for this exam' });
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /exams/:id/results — TEACHER: get all student results for an exam
const lecturerResultRouter = Router({ mergeParams: true });

lecturerResultRouter.get(
  '/',
  requireAuth,
  requireRole('TEACHER'),
  async (req, res) => {
    try {
      const examId = req.params.id;
      const results = await getLecturerResults(examId, req.user.userId);
      if (results === null) {
        return res.status(404).json({ error: 'Exam not found or not owned by you' });
      }

      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = { studentResultRouter, lecturerResultRouter };
