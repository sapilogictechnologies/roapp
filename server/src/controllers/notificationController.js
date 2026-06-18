const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ notifications, unread });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ unread });
});

exports.markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
  res.json({ message: 'Marked as read' });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All marked as read' });
});

exports.sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, userIds } = req.body;
  const User = require('../models/User');
  let targets = userIds;
  if (!targets || !targets.length) {
    const users = await User.find({ role: 'customer', isActive: true }).select('_id').lean();
    targets = users.map((u) => u._id);
  }
  const notifications = targets.map((userId) => ({ user: userId, title, message, type: 'announcement' }));
  await Notification.insertMany(notifications);
  res.json({ message: `Announcement sent to ${notifications.length} users` });
});
