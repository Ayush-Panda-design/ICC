const express = require('express');
const router = express.Router();
const { isAuthEnabled, verifyPassword, expectedToken } = require('../middleware/auth');

// GET /api/auth/status — whether password gate is on
router.get('/status', (req, res) => {
  res.json({ required: isAuthEnabled() });
});

// POST /api/auth/login — { password }
router.post('/login', (req, res) => {
  if (!isAuthEnabled()) {
    return res.json({ ok: true, token: null, required: false });
  }
  const { password } = req.body || {};
  if (!verifyPassword(password)) {
    return res.status(401).json({ ok: false, message: 'Wrong password' });
  }
  return res.json({ ok: true, token: expectedToken(), required: true });
});

module.exports = router;
