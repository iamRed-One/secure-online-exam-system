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

router.delete('/users/:id', ...guard, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.userId)
      return res.status(400).json({ error: 'Cannot delete your own account' });
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Exam management ───────────────────────────────────────────────
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

router.post('/exams', ...guard, async (req, res) => {
  const { title, durationSeconds, startWindow, endWindow,
    violationThreshold = 3, gracePeriodSeconds = 60, questionsPerStudent = null } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO exams (title, lecturer_id, duration_seconds, start_window, end_window,
       violation_threshold, grace_period_seconds, questions_per_student)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [title, req.user.userId, durationSeconds, startWindow, endWindow,
     violationThreshold, gracePeriodSeconds, questionsPerStudent || null]
  );
  res.status(201).json(rows[0]);
});

router.get('/exams/:id', ...guard, async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM exams WHERE id=$1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Exam not found' });
  res.json(rows[0]);
});

router.delete('/exams/:id', ...guard, async (req, res) => {
  try {
    await pool.query('DELETE FROM exams WHERE id = $1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/exams/:id/publish', ...guard, async (req, res) => {
  try {
    const { rows: examRows } = await pool.query(
      `SELECT questions_per_student FROM exams WHERE id=$1 AND status='DRAFT'`,
      [req.params.id]
    );
    if (!examRows[0]) return res.status(404).json({ error: 'Exam not found or not in DRAFT' });

    const qps = examRows[0].questions_per_student;
    if (qps) {
      const { rows: countRows } = await pool.query(
        `SELECT COUNT(*) FROM question_bank WHERE exam_id=$1`,
        [req.params.id]
      );
      const count = parseInt(countRows[0].count, 10);
      if (count < qps) {
        return res.status(400).json({
          error: `Not enough questions: exam has ${count} but requires ${qps} per student. Add ${qps - count} more question(s) before publishing.`,
        });
      }
    }

    const { rows } = await pool.query(
      `UPDATE exams SET status='SCHEDULED' WHERE id=$1 AND status='DRAFT' RETURNING *`,
      [req.params.id]
    );
    await pool.query(
      `INSERT INTO exam_enrollments (exam_id, student_id)
       SELECT $1, id FROM users WHERE role='STUDENT'
       ON CONFLICT DO NOTHING`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/exams/:id/enrol-all', ...guard, async (req, res) => {
  await pool.query(
    `INSERT INTO exam_enrollments (exam_id, student_id)
     SELECT $1, id FROM users WHERE role='STUDENT'
     ON CONFLICT DO NOTHING`,
    [req.params.id]
  );
  res.json({ enrolled: true });
});

// ── Enrollment management ─────────────────────────────────────────
// List enrolled students for an exam
router.get('/exams/:id/enrollments', ...guard, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.role,
       es.status AS session_status
     FROM exam_enrollments ee
     JOIN users u ON u.id = ee.student_id
     LEFT JOIN exam_sessions es ON es.exam_id = ee.exam_id AND es.student_id = ee.student_id
     WHERE ee.exam_id = $1
     ORDER BY u.email`,
    [req.params.id]
  );
  res.json(rows);
});

// Unenrol a student from an exam
router.delete('/exams/:id/enrollments/:studentId', ...guard, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM exam_enrollments WHERE exam_id=$1 AND student_id=$2',
      [req.params.id, req.params.studentId]
    );
    res.json({ unenrolled: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
