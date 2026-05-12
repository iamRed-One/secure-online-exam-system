const { Router } = require('express');
const { login, register } = require('./auth.service');

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const token = await login(email, password);
  if (!token) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token });
});

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const result = await register(email, password, role);
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json(result.user);
});

router.post('/logout', (_req, res) => res.json({ message: 'Logged out' }));

module.exports = router;
