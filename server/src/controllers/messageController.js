const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Order = require('../models/Order');
const EventBooking = require('../models/EventBooking');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const { createAdminNotifications } = require('../services/notificationService');
const { emitToAdmin, emitToUser } = require('../socket');

const isAdminUser = (user) => user && ['admin', 'staff'].includes(user.role);

const assertLinkedResourcesBelongToCustomer = async ({ customerId, orderId, eventId, paymentId }) => {
  if (orderId) {
    const order = await Order.findById(orderId).select('user').lean();
    if (!order) {
      const error = new Error('Linked order not found');
      error.statusCode = 404;
      throw error;
    }
    if (order.user?.toString() !== customerId.toString()) {
      const error = new Error('Linked order does not belong to this customer');
      error.statusCode = 403;
      throw error;
    }
  }
  if (eventId) {
    const event = await EventBooking.findById(eventId).select('createdBy').lean();
    if (!event) {
      const error = new Error('Linked event not found');
      error.statusCode = 404;
      throw error;
    }
    if (event.createdBy?.toString() !== customerId.toString()) {
      const error = new Error('Linked event does not belong to this customer');
      error.statusCode = 403;
      throw error;
    }
  }
  if (paymentId) {
    const payment = await Payment.findById(paymentId).select('user').lean();
    if (!payment) {
      const error = new Error('Linked payment not found');
      error.statusCode = 404;
      throw error;
    }
    if (payment.user?.toString() !== customerId.toString()) {
      const error = new Error('Linked payment does not belong to this customer');
      error.statusCode = 403;
      throw error;
    }
  }
};

const populateMessage = (query) =>
  query
    .populate('customer', 'name email mobile')
    .populate('sender', 'name email mobile role')
    .populate('receiver', 'name email mobile role')
    .populate('order', 'orderNumber total')
    .populate('event', 'eventType eventDate')
    .populate('payment', 'amount status');

exports.getMyMessages = asyncHandler(async (req, res) => {
  const messages = await populateMessage(
    Message.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(100)
  ).lean();
  const unread = await Message.countDocuments({
    customer: req.user._id,
    audience: 'customer',
    readByCustomer: false,
  });
  res.json({ messages, unread });
});

exports.getAllMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, customerId, unread } = req.query;
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const filter = {};
  if (customerId) filter.customer = customerId;
  if (unread === 'true') {
    filter.audience = 'admin';
    filter.readByAdmin = false;
  }

  const total = await Message.countDocuments(filter);
  const messages = await populateMessage(
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
  ).lean();
  const adminUnread = await Message.countDocuments({ audience: 'admin', readByAdmin: false });

  res.json({ messages, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1, unread: adminUnread });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  if (isAdminUser(req.user)) {
    const unread = await Message.countDocuments({ audience: 'admin', readByAdmin: false });
    return res.json({ unread });
  }
  const unread = await Message.countDocuments({
    customer: req.user._id,
    audience: 'customer',
    readByCustomer: false,
  });
  return res.json({ unread });
});

exports.sendCustomerMessage = asyncHandler(async (req, res) => {
  const { subject, body, orderId, eventId, paymentId } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ message: 'Message is required' });
  await assertLinkedResourcesBelongToCustomer({ customerId: req.user._id, orderId, eventId, paymentId });

  const message = await Message.create({
    customer: req.user._id,
    sender: req.user._id,
    audience: 'admin',
    subject: subject || '',
    body: body.trim(),
    order: orderId || null,
    event: eventId || null,
    payment: paymentId || null,
    readByCustomer: true,
  });

  await createAdminNotifications({
    title: 'New Customer Message',
    message: `${req.user.name || 'Customer'} sent a message${subject ? `: ${subject}` : ''}.`,
    type: 'message',
    link: '/admin/messages',
  });
  emitToAdmin('message:new', { customerId: req.user._id.toString(), subject: subject || '' });

  await ActivityLog.create({
    user: req.user._id,
    action: 'MESSAGE_SENT',
    module: 'Messages',
    description: `Customer message sent${subject ? `: ${subject}` : ''}`,
    metadata: { messageId: message._id },
  });

  res.status(201).json(await populateMessage(Message.findById(message._id)).lean());
});

exports.sendAdminMessage = asyncHandler(async (req, res) => {
  const { customerId, subject, body, orderId, eventId, paymentId } = req.body;
  if (!customerId) return res.status(400).json({ message: 'Customer is required' });
  if (!body || !body.trim()) return res.status(400).json({ message: 'Message is required' });

  const customer = await User.findOne({ _id: customerId, role: 'customer' }).select('_id name').lean();
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  await assertLinkedResourcesBelongToCustomer({ customerId: customer._id, orderId, eventId, paymentId });

  const message = await Message.create({
    customer: customer._id,
    sender: req.user._id,
    receiver: customer._id,
    audience: 'customer',
    subject: subject || '',
    body: body.trim(),
    order: orderId || null,
    event: eventId || null,
    payment: paymentId || null,
    readByAdmin: true,
  });

  await Notification.create({
    user: customer._id,
    title: 'New Message from Support',
    message: subject || body.trim().slice(0, 120),
    type: 'message',
    link: '/messages',
  });
  emitToUser(customer._id.toString(), 'message:new', { subject: subject || '' });

  await ActivityLog.create({
    user: req.user._id,
    action: 'MESSAGE_SENT',
    module: 'Messages',
    description: `Admin message sent to ${customer.name}`,
    metadata: { messageId: message._id, customerId: customer._id },
  });

  res.status(201).json(await populateMessage(Message.findById(message._id)).lean());
});

exports.markMessageRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ message: 'Message not found' });

  if (isAdminUser(req.user)) {
    message.readByAdmin = true;
  } else {
    if (message.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    message.readByCustomer = true;
  }

  await message.save();
  res.json({ message: 'Marked as read' });
});

exports.markAllMessagesRead = asyncHandler(async (req, res) => {
  if (isAdminUser(req.user)) {
    await Message.updateMany({ audience: 'admin', readByAdmin: false }, { readByAdmin: true });
  } else {
    await Message.updateMany(
      { customer: req.user._id, audience: 'customer', readByCustomer: false },
      { readByCustomer: true }
    );
  }
  res.json({ message: 'All messages marked as read' });
});
