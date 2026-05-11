const bcrypt = require('bcrypt');
const pool = require('../../db/client');
const { sign } = require('../../utils/jwt');

async function login(email, password) {
  const { rows } = await pool.query(
    'SELECT id, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  if (!rows.length) return null;
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;
  return sign({ userId: user.id, role: user.role });
}

module.exports = { login };
