const bcrypt = require('bcrypt');
const pool = require('../../db/client');
const { sign } = require('../../utils/jwt');

async function login(email, password) {
  const { rows } = await pool.query(
    'SELECT id, password, role FROM users WHERE email = $1',
    [email]
  );
  if (!rows.length) return null;
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;
  return sign({ userId: user.id, role: user.role });
}

async function register(email, password, role = 'STUDENT') {
  const allowed = ['STUDENT', 'TEACHER'];
  if (!allowed.includes(role)) return { error: 'Invalid role' };

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return { error: 'Email already registered' };

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role`,
    [email, hash, role]
  );
  const user = rows[0];

  // Auto-enrol new students into all currently PUBLISHED exams
  if (user.role === 'STUDENT') {
    const { rows: exams } = await pool.query(
      `SELECT id FROM exams WHERE status = 'SCHEDULED'`
    );
    for (const exam of exams) {
      await pool.query(
        `INSERT INTO exam_enrollments (exam_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [exam.id, user.id]
      );
    }
  }

  return { user };
}

module.exports = { login, register };
