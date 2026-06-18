const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { generateBillNumber } = require('../utils/generators');

exports.generateBill = asyncHandler(async (req, res) => {
  const { userId, orderIds, periodStart, periodEnd, dueDate, notes } = req.body;
  if (!userId) return res.status(400).json({ message: 'Customer is required' });

  let orders;
  if (Array.isArray(orderIds) && orderIds.length > 0) {
    orders = await Order.find({ _id: { $in: orderIds } }).lean();
    if (!orders.length) return res.status(400).json({ message: 'No orders found for given IDs' });
    if (orders.some((o) => o.user?.toString() !== userId.toString())) {
      return res.status(400).json({ message: 'All orders must belong to the selected customer' });
    }
  } else {
    orders = await Order.find({ user: userId, paymentStatus: { $ne: 'paid' } }).lean();
    if (!orders.length) return res.status(400).json({ message: 'No unpaid orders found for this customer' });
  }

  const subtotal = orders.reduce((sum, o) => sum + o.total, 0);
  const bill = await Bill.create({
    billNumber: generateBillNumber(),
    user: userId,
    orders: orders.map((o) => o._id),
    subtotal,
    paidAmount: 0,
    pendingAmount: subtotal,
    status: 'unpaid',
    dueDate: dueDate ? new Date(dueDate) : null,
    billingPeriodStart: periodStart ? new Date(periodStart) : null,
    billingPeriodEnd: periodEnd ? new Date(periodEnd) : null,
    notes: notes || '',
  });

  Notification.create({
    user: userId,
    title: 'New Bill Generated',
    message: `Bill ${bill.billNumber} of ₹${subtotal} has been generated. Please review and pay by the due date.`,
    type: 'billing',
    link: '/bills',
  }).catch(() => {});

  res.status(201).json(bill);
});

exports.getMyBills = asyncHandler(async (req, res) => {
  const bills = await Bill.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('orders', 'orderNumber total').lean();
  res.json(bills);
});

exports.getAllBills = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const total = await Bill.countDocuments(filter);
  const bills = await Bill.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email mobile')
    .lean();
  res.json({ bills, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.getBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id)
    .populate('user', 'name email mobile')
    .populate('orders', 'orderNumber total createdAt paymentMethod paymentStatus')
    .lean();
  if (!bill) return res.status(404).json({ message: 'Bill not found' });
  if (!['admin', 'staff'].includes(req.user.role) && bill.user?._id?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.json(bill);
});

exports.markBillPaid = asyncHandler(async (req, res) => {
  const b = await Bill.findById(req.params.id);
  if (!b) return res.status(404).json({ message: 'Bill not found' });
  b.paidAmount = b.subtotal;
  b.pendingAmount = 0;
  b.status = 'paid';
  await b.save();
  Notification.create({
    user: b.user,
    title: 'Bill Cleared',
    message: `Bill ${b.billNumber} has been marked as fully paid. Thank you!`,
    type: 'billing',
    link: '/bills',
  }).catch(() => {});
  res.json(b);
});
