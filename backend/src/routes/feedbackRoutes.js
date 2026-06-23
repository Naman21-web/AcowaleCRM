const express = require('express');
const {
  createFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  getAnalyticsSummary,
} = require('../controllers/feedbackController');
const { validateCreateFeedback, validateListQuery } = require('../middleware/validators');
const { requireAdmin } = require('../middleware/auth');
const { submitLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public - anyone can submit feedback
router.post('/feedback', submitLimiter, validateCreateFeedback, createFeedback);

// Admin - dashboard data
router.get('/feedback', requireAdmin, validateListQuery, getFeedback);
router.get('/feedback/:id', requireAdmin, getFeedbackById);
router.patch('/feedback/:id/status', requireAdmin, updateFeedbackStatus);
router.get('/analytics/summary', requireAdmin, getAnalyticsSummary);

module.exports = router;
