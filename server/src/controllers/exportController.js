const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

const toCSV = (headers, rows) => {
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) => headers.map((h) => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  return [headerLine, ...dataLines].join('\n');
};

exports.exportCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-password').lean();
  const headers = ['name', 'email', 'mobile', 'isActive', 'walletBalance', 'loyaltyPoints', 'createdAt'];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
  res.send(toCSV(headers, customers));
});

exports.exportOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).lean();
  const rows = orders.map((o) => ({
    orderNumber: o.orderNumber,
    customerName: o.user?.name || o.guestName,
    email: o.user?.email || '',
    total: o.total,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    createdAt: new Date(o.createdAt).toLocaleDateString(),
  }));
  const headers = ['orderNumber', 'customerName', 'email', 'total', 'orderStatus', 'paymentStatus', 'paymentMethod', 'createdAt'];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.send(toCSV(headers, rows));
});

exports.exportPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate('user', 'name email').lean();
  const rows = payments.map((p) => ({
    user: p.user?.name || '',
    email: p.user?.email || '',
    amount: p.amount,
    method: p.method,
    status: p.status,
    utrNumber: p.utrNumber,
    createdAt: new Date(p.createdAt).toLocaleDateString(),
  }));
  const headers = ['user', 'email', 'amount', 'method', 'status', 'utrNumber', 'createdAt'];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
  res.send(toCSV(headers, rows));
});
