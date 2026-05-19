const { Router } = require('express');
const requireAuth  = require('../../middleware/requireAuth');
const requireRole  = require('../../middleware/requireRole');
const pool         = require('../../db/client');
const {
  createExam, publishExam, enrolStudent,
  listEnrolledExams, listMyExams, getExam,
} = require('./exam.service');

const router = Router();

// POST /exams — TEACHER: create exam
router.post('/', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    const exam = await createExam(req.body, req.user.userId);
    res.status(201).json(exam);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /exams/mine — TEACHER: list own exams
router.get('/mine', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    res.json(await listMyExams(req.user.userId));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /exams/browse — STUDENT: list SCHEDULED exams not yet enrolled in
router.get('/browse', requireAuth, requireRole('STUDENT'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.title, e.duration_seconds, e.start_window, e.end_window, e.status
       FROM exams e
       WHERE e.status = 'SCHEDULED'
         AND e.id NOT IN (
           SELECT exam_id FROM exam_enrollments WHERE student_id = $1
         )
       ORDER BY e.start_window ASC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /exams/:id/enrol-self — STUDENT: self-enrol into a SCHEDULED exam
router.post('/:id/enrol-self', requireAuth, requireRole('STUDENT'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id FROM exams WHERE id=$1 AND status='SCHEDULED'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Exam not found or not available' });
    await pool.query(
      `INSERT INTO exam_enrollments (exam_id, student_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [req.params.id, req.user.userId]
    );
    res.json({ enrolled: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /exams — STUDENT: enrolled exams | TEACHER: own exams
router.get('/', requireAuth, requireRole('STUDENT', 'TEACHER', 'ADMIN'), async (req, res) => {
  try {
    if (req.user.role === 'STUDENT') return res.json(await listEnrolledExams(req.user.userId));
    res.json(await listMyExams(req.user.userId));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /exams/:id — TEACHER: single exam details
router.get('/:id', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const exam = await getExam(req.params.id, req.user.userId);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /exams/:id/publish — TEACHER: publish draft exam
router.patch('/:id/publish', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    const exam = await publishExam(req.params.id, req.user.userId);
    if (!exam) return res.status(404).json({ error: 'Exam not found or not in DRAFT state' });
    res.json(exam);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /exams/:id/enrol — TEACHER: enrol a specific student
router.post('/:id/enrol', requireAuth, requireRole('TEACHER'), async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });
    const result = await enrolStudent(req.params.id, studentId, req.user.userId);
    if (!result) return res.status(404).json({ error: 'Exam not found' });
    res.json({ enrolled: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
