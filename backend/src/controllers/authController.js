const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Single hard-coded admin account, configured via env vars.
// Deliberately simple: this is a machine test, not a multi-tenant SaaS.
// See DECISIONS.md for the reasoning and what a v2 would look like.
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('Username and password are required', 400);
  }

  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword = password === process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    logger.warn('Failed admin login attempt', { username });
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign({ sub: username, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });

  res.json({ success: true, data: { token, expiresIn: '12h' } });
});

module.exports = { login };
