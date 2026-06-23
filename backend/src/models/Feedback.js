const mongoose = require('mongoose');

const CATEGORIES = ['Product', 'Support', 'Billing', 'Feature Request', 'Bug', 'Other'];
const STATUSES = ['received', 'in_progress', 'resolved'];

const feedbackSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [3, 'Comment must be at least 3 characters'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address'],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'received',
    },
    // Lightweight metadata captured for analytics/abuse-detection,
    // never displayed publicly.
    meta: {
      ip: { type: String, default: null },
      userAgent: { type: String, default: null },
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ category: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ comment: 'text' });

feedbackSchema.statics.CATEGORIES = CATEGORIES;
feedbackSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Feedback', feedbackSchema);
