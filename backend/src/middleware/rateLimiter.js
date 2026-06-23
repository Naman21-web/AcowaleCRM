const rateLimit = require('express-rate-limit');

// Generic API limiter - generous, just to blunt abuse / scraping.
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Stricter limiter specifically for the public feedback submission endpoint,
// since that's the one anonymous users can hit repeatedly.
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many submissions. Please wait a minute and try again.' },
});

module.exports = { apiLimiter, submitLimiter };
