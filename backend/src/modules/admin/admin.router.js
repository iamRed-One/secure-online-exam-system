const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');
const { listUsers, createUser } = require('./admin.service');

const router = Router();

router.get('/users', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const users = await listUsers();
  res.json(users);
});

router.post('/users', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'email, password and role required' });
  }
  const user = await createUser({ email, password, role });
  res.status(201).json(user);
});

module.exports = router;
