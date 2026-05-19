const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const pool = require('../../db/client');
const bcrypt = require('bcrypt');

const router = Router();

// GET /profile — return current user's profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, full_name, phone, bio, created_at FROM users WHERE id=$1',
      [req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /profile — update profile fields
router.put('/', requireAuth, async (req, res) => {
  try {
    const { fullName, phone, bio } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET full_name=$1, phone=$2, bio=$3, updated_at=now()
       WHERE id=$4
       RETURNING id, email, role, full_name, phone, bio, created_at`,
      [fullName ?? null, phone ?? null, bio ?? null, req.user.userId]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /profile/password — change password
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'currentPassword and newPassword required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const { rows } = await pool.query('SELECT password FROM users WHERE id=$1', [req.user.userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1, updated_at=now() WHERE id=$2', [hash, req.user.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
