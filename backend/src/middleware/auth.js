const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

// Protects admin-only routes (dashboard data, status updates).
// The public feedback submission endpoint deliberately does NOT use this.
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new AppError('Authentication required. Pass a Bearer token.', 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = { requireAdmin };
