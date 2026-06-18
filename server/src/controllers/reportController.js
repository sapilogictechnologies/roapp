const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const JarLedger = require('../models/JarLedger');
const Subscription = require('../models/Subscription');
const EventBooking = require('../models/EventBooking');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    totalRevenue,
    monthRevenue,
    totalCustomers,
    pendingPayments,
    activeSubscriptions,
    pendingEventInquiries,
    pendingJarsResult,
    dueCustomers,
    todayRevenue,
    cancelledToday,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ orderStatus: { $in: ['placed', 'payment_pending', 'confirmed', 'preparing', 'out_for_delivery'] } }),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: monthStart }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    User.countDocuments({ role: 'customer', isActive: { $ne: false } }),
    Payment.countDocuments({ status: { $in: ['pending', 'pending_verification'] } }),
    Subscription.countDocuments({ status: 'active' }),
    EventBooking.countDocuments({ status: { $in: ['pending', 'new'] } }),
    JarLedger.aggregate([
      { $group: { _id: '$user', delivered: { $sum: { $cond: [{ $eq: ['$type', 'delivered'] }, '$quantity', 0] } }, returned: { $sum: { $cond: [{ $eq: ['$type', 'returned'] }, '$quantity', 0] } } } },
      { $addFields: { pending: { $subtract: ['$delivered', '$returned'] } } },
      { $match: { pending: { $gt: 0 } } },
      { $group: { _id: null, totalPending: { $sum: '$pending' } } },
    ]),
    User.countDocuments({ role: 'customer', outstandingDues: { $gt: 0 } }),
    Order.aggregate([{ $match: { createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments({ createdAt: { $gte: today }, orderStatus: 'cancelled' }),
  ]);

  res.json({
    totalOrders,
    todayOrders,
    pendingOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    monthRevenue: monthRevenue[0]?.total || 0,
    todayRevenue: todayRevenue[0]?.total || 0,
    totalCustomers,
    pendingPayments,
    activeSubscriptions,
    pendingEventInquiries,
    pendingJars: pendingJarsResult[0]?.totalPending || 0,
    dueCustomers,
    cancelledToday,
  });
});

exports.getSalesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) { match.createdAt = {}; if (from) match.createdAt.$gte = new Date(from); if (to) match.createdAt.$lte = new Date(to); }
  const data = await Order.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(data);
});

exports.getProductsReport = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { totalQty: -1 } },
    { $limit: 20 },
  ]);
  res.json(data);
});

exports.getCustomersReport = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { user: { $ne: null } } },
    { $group: { _id: '$user', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    { $sort: { totalSpent: -1 } },
    { $limit: 20 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { 'user.password': 0 } },
  ]);
  res.json(data);
});

exports.getPaymentsReport = asyncHandler(async (req, res) => {
  const data = await Payment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
  ]);
  res.json(data);
});

exports.getJarsReport = asyncHandler(async (req, res) => {
  const data = await JarLedger.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
  ]);
  res.json(data);
});
