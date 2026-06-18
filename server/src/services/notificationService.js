const Notification = require('../models/Notification');
const { emitToUser, emitToAdmin } = require('../socket');

const createNotification = async ({ user, title, message, type = 'order', link = '' }) => {
  if (!user) return null;
  const notification = await Notification.create({ user, title, message, type, link });
  // Instant push via socket (polling remains as fallback)
  const unreadCount = await Notification.countDocuments({ user, isRead: false });
  emitToUser(user.toString(), 'notification:new', { notification, unreadCount });
  return notification;
};

const createAdminNotifications = async ({ title, message, type = 'announcement', link = '' }) => {
  const User = require('../models/User');
  const admins = await User.find({ role: { $in: ['admin', 'staff'] }, isActive: true }).select('_id').lean();
  if (!admins.length) return [];
  const notifications = await Notification.insertMany(
    admins.map((admin) => ({ user: admin._id, title, message, type, link }))
  );
  // One broadcast to the shared admin room covers all connected admins
  emitToAdmin('notification:new', { title, message, type, link });
  return notifications;
};

module.exports = { createNotification, createAdminNotifications };
