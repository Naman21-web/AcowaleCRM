const Feedback = require('../models/Feedback');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// POST /api/feedback - public
const createFeedback = asyncHandler(async (req, res) => {
  const { category, comment, rating, email } = req.body;

  const feedback = await Feedback.create({
    category,
    comment,
    rating: rating || null,
    email: email || null,
    meta: {
      ip: req.ip,
      userAgent: req.headers['user-agent'] || null,
    },
  });

  logger.info('Feedback submitted', { id: feedback._id, category });

  res.status(201).json({
    success: true,
    data: {
      id: feedback._id,
      category: feedback.category,
      comment: feedback.comment,
      rating: feedback.rating,
      status: feedback.status,
      createdAt: feedback.createdAt,
    },
  });
});

// GET /api/feedback - admin only. Supports pagination, search, and filters.
const getFeedback = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { category, status, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    filter.comment = { $regex: search, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-meta')
      .lean(),
    Feedback.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

// GET /api/feedback/:id - admin only
const getFeedbackById = asyncHandler(async (req, res) => {
  const item = await Feedback.findById(req.params.id).select('-meta').lean();
  if (!item) throw new AppError('Feedback not found', 404);
  res.json({ success: true, data: item });
});

// PATCH /api/feedback/:id/status - admin only
const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Feedback.STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${Feedback.STATUSES.join(', ')}`, 400);
  }

  const item = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).select('-meta');

  if (!item) throw new AppError('Feedback not found', 404);

  logger.info('Feedback status updated', { id: item._id, status });
  res.json({ success: true, data: item });
});

// GET /api/analytics/summary - admin only
const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const [totalCount, categoryAgg, statusAgg, recent, last7DaysAgg, avgRatingAgg] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Feedback.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Feedback.find().sort({ createdAt: -1 }).limit(5).select('-meta').lean(),
    Feedback.aggregate([
      {
        $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Feedback.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalCount,
      categoryDistribution: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
      statusDistribution: statusAgg.map((s) => ({ status: s._id, count: s.count })),
      averageRating: avgRatingAgg[0] ? Number(avgRatingAgg[0].avgRating.toFixed(2)) : null,
      trendLast7Days: last7DaysAgg.map((d) => ({ date: d._id, count: d.count })),
      recentSubmissions: recent,
    },
  });
});

module.exports = {
  createFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  getAnalyticsSummary,
};
