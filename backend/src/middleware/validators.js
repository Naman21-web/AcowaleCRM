const { body, query, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const { AppError } = require('./errorHandler');

// Collects express-validator results and turns the first error into an AppError.
function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const message = result.array().map((e) => e.msg).join('; ');
    return next(new AppError(message, 400));
  }
  next();
}

const validateCreateFeedback = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Feedback.CATEGORIES)
    .withMessage(`Category must be one of: ${Feedback.CATEGORIES.join(', ')}`),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 3, max: 2000 })
    .withMessage('Comment must be between 3 and 2000 characters'),
  body('rating')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Email must be valid'),
  handleValidation,
];

const validateListQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('category').optional().isIn(Feedback.CATEGORIES).withMessage('Invalid category filter'),
  query('status').optional().isIn(Feedback.STATUSES).withMessage('Invalid status filter'),
  handleValidation,
];

module.exports = { validateCreateFeedback, validateListQuery };
