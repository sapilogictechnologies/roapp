const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

exports.getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const total = await ActivityLog.countDocuments();
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email')
    .lean();
  res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
});
