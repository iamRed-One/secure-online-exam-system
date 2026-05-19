const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');
const { listUsers, createUser } = require('./admin.service');
const pool = require('../../db/client');

const router = Router();
const guard = [requireAuth, requireRole('ADMIN')];

// ── User management ──────────────────────────────────────────────
router.get('/users', ...guard, async (req, res) => {
  const users = await listUsers();
  res.json(users);
});

router.post('/users', ...guard, async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role)
    return res.status(400).json({ error: 'email, password and role required' });
  const user = await createUser({ email, password, role });
  res.status(201).json(user);
});

// ── Exam management ───────────────────────────────────────────────
// List all exams (regardless of status)
router.get('/exams', ...guard, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.*, u.email AS lecturer_email,
       (SELECT COUNT(*) FROM question_bank WHERE exam_id = e.id) AS question_count
     FROM exams e
     LEFT JOIN users u ON u.id = e.lecturer_id
     ORDER BY e.start_window DESC`
  );
  res.json(rows);
});

// Create a new exam (admin is the lecturer_id)
router.post('/exams', ...guard, async (req, res) => {
  const { title, durationSeconds, startWindow, endWindow,
    violationThreshold = 3, gracePeriodSeconds = 60 } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO exams (title, lecturer_id, duration_seconds, start_window, end_window,
       violation_threshold, grace_period_seconds)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [title, req.user.userId, durationSeconds, startWindow, endWindow,
     violationThreshold, gracePeriodSeconds]
  );
  res.status(201).json(rows[0]);
});

// Publish an exam
router.patch('/exams/:id/publish', ...guard, async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE exams SET status='SCHEDULED' WHERE id=$1 AND status='DRAFT' RETURNING *`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Exam not found or not in DRAFT' });

  // Auto-enrol all existing STUDENT accounts into the newly published exam
  await pool.query(
    `INSERT INTO exam_enrollments (exam_id, student_id)
     SELECT $1, id FROM users WHERE role='STUDENT'
     ON CONFLICT DO NOTHING`,
    [req.params.id]
  );
  res.json(rows[0]);
});

// Enrol all current students into an exam
router.post('/exams/:id/enrol-all', ...guard, async (req, res) => {
  await pool.query(
    `INSERT INTO exam_enrollments (exam_id, student_id)
     SELECT $1, id FROM users WHERE role='STUDENT'
     ON CONFLICT DO NOTHING`,
    [req.params.id]
  );
  res.json({ enrolled: true });
});

module.exports = router;
