const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');
const {
  createExam,
  publishExam,
  enrolStudent,
  listEnrolledExams,
  listMyExams,
  getExam,
} = require('./exam.service');

const router = Router();

// POST /exams — TEACHER: create an exam
router.post('/', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    const exam = await createExam(req.body, req.user.id);
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /exams/mine — TEACHER: list exams created by this teacher
router.get('/mine', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    const exams = await listMyExams(req.user.id);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /exams — STUDENT: list enrolled exams; TEACHER: list their exams
router.get('/', requireAuth, requireRole('STUDENT', 'TEACHER'), async (req, res) => {
  try {
    if (req.user.role === 'STUDENT') {
      const exams = await listEnrolledExams(req.user.id);
      return res.json(exams);
    }
    // TEACHER fallback
    const exams = await listMyExams(req.user.id);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /exams/:id — TEACHER: get single exam details
router.get('/:id', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    const exam = await getExam(req.params.id, req.user.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /exams/:id/publish — TEACHER: publish a draft exam
router.patch('/:id/publish', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    const exam = await publishExam(req.params.id, req.user.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found or not in DRAFT state' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /exams/:id/enrol — TEACHER: enrol a student
router.post('/:id/enrol', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });
    const result = await enrolStudent(req.params.id, studentId, req.user.id);
    if (!result) return res.status(404).json({ error: 'Exam not found or not owned by you' });
    res.json({ enrolled: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
