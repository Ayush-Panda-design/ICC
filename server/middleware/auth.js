const crypto = require('crypto');

function accessPassword() {
  return (process.env.ICC_ACCESS_PASSWORD || '').trim();
}

/** Auth disabled when ICC_ACCESS_PASSWORD is unset/empty (local dev convenience). */
function isAuthEnabled() {
  return Boolean(accessPassword());
}

function expectedToken() {
  const pw = accessPassword();
  if (!pw) return null;
  return crypto.createHmac('sha256', pw).update('icc-session-v1').digest('hex');
}

function verifyPassword(password) {
  const expected = accessPassword();
  if (!expected) return true;
  if (typeof password !== 'string') return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifyToken(token) {
  if (!isAuthEnabled()) return true;
  const expected = expectedToken();
  if (!token || !expected) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function authMiddleware(req, res, next) {
  if (!isAuthEnabled()) return next();

  const path = (req.originalUrl || req.url || '').split('?')[0];

  // Only gate API routes; SPA HTML/assets stay public (login UI must load)
  if (!path.startsWith('/api')) return next();
  if (path === '/api/auth/status' || path === '/api/auth/login') return next();

  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const alt = req.headers['x-icc-token'];
  const token = bearer || alt;

  if (!verifyToken(token)) {
    return res.status(401).json({ message: 'Unauthorized', code: 'AUTH_REQUIRED' });
  }
  return next();
}

module.exports = {
  isAuthEnabled,
  expectedToken,
  verifyPassword,
  verifyToken,
  authMiddleware,
  accessPassword
};
