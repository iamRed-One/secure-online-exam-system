const bcrypt = require('bcrypt');
const pool = require('../../db/client');

async function listUsers() {
  const { rows } = await pool.query(
    'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return rows;
}

async function createUser({ email, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, role) VALUES ($1, $2, $3)
     RETURNING id, email, role, created_at`,
    [email, hash, role]
  );
  return rows[0];
}

module.exports = { listUsers, createUser };
