const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { createAdminNotifications } = require('../services/notificationService');

exports.submitProof = asyncHandler(async (req, res) => {
  const { orderId, billId, amount, expectedAmount, method, utrNumber, notes } = req.body;
  const normalizedMethod = method === 'cod' ? 'cash' : (method || 'upi');
  const numericAmount = Number(amount);
  let linkedOrder = null;
  let linkedBill = null;

  if (!numericAmount || numericAmount <= 0) return res.status(400).json({ message: 'Valid amount required' });
  if (!['upi', 'cash', 'bank', 'wallet'].includes(normalizedMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }
  if (normalizedMethod === 'upi' && !req.file) {
    return res.status(400).json({ message: 'Payment screenshot is required for UPI/QR payments' });
  }
  if (orderId) {
    linkedOrder = await Order.findById(orderId).select('user total orderNumber paymentMethod paymentStatus').lean();
    if (!linkedOrder) return res.status(404).json({ message: 'Order not found' });
    if (linkedOrder.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot submit payment for another customer order' });
    }
  }
  if (billId) {
    linkedBill = await Bill.findById(billId).select('user subtotal pendingAmount').lean();
    if (!linkedBill) return res.status(404).json({ message: 'Bill not found' });
    if (linkedBill.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot submit payment for another customer bill' });
    }
  }

  const resolvedExpectedAmount = Number(expectedAmount)
    || Number(linkedOrder?.total)
    || Number(linkedBill?.pendingAmount)
    || numericAmount;
  const screenshot = req.file ? `/uploads/${req.file.filename}` : '';
  const payment = await Payment.create({
    user: req.user._id,
    order: orderId || null,
    bill: billId || null,
    amount: numericAmount,
    expectedAmount: resolvedExpectedAmount,
    approvedAmount: 0,
    method: normalizedMethod,
    utrNumber: utrNumber || '',
    screenshot,
    notes: notes || '',
    status: 'pending_verification',
  });

  await ActivityLog.create({
    user: req.user._id,
    action: 'PAYMENT_SUBMITTED',
    module: 'Payments',
    description: `Payment proof submitted Rs. ${numericAmount} via ${normalizedMethod}`,
    metadata: { paymentId: payment._id, orderId },
  });
  await createAdminNotifications({
    title: 'Payment Proof Uploaded',
    message: `Payment proof of Rs. ${payment.amount} was uploaded by ${req.user.name || 'a customer'}.`,
    type: 'payment',
    link: '/admin/payments',
  });

  res.status(201).json(payment);
});

exports.getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('order', 'orderNumber total')
    .lean();
  res.json(payments);
});

exports.getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) {
    filter.status = ['pending', 'pending_verification'].includes(status)
      ? { $in: ['pending', 'pending_verification'] }
      : status;
  }
  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email mobile')
    .populate('order', 'orderNumber total paymentMethod')
    .lean();
  res.json({ payments, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.approvePayment = asyncHandler(async (req, res) => {
  const { adminNotes } = req.body || {};
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  if (payment.status === 'approved') return res.status(400).json({ message: 'Payment is already approved' });

  payment.status = 'approved';
  payment.approvedAmount = payment.amount;
  if (adminNotes) payment.adminNotes = adminNotes;
  payment.approvedBy = req.user._id;
  payment.approvedAt = new Date();
  await payment.save();

  if (payment.order) {
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'paid';
      order.paymentStatusHistory.push({ status: 'paid', note: 'Payment approved by admin', changedBy: req.user._id });
      if (order.orderStatus === 'payment_pending') {
        order.orderStatus = 'confirmed';
        order.statusHistory.push({ status: 'confirmed', note: 'Auto-confirmed after payment approval', changedBy: req.user._id });
      }
      await order.save();

      if (order.paymentMethod === 'credit' && order.user) {
        const User = require('../models/User');
        await User.findByIdAndUpdate(order.user, {
          $inc: { outstandingDues: -Math.min(payment.amount, order.total) },
        });
      }
    }
  }

  if (payment.bill) {
    const bill = await Bill.findById(payment.bill);
    if (bill) {
      bill.paidAmount = (bill.paidAmount || 0) + payment.amount;
      bill.pendingAmount = Math.max(0, bill.subtotal - bill.paidAmount);
      bill.status = bill.pendingAmount === 0 ? 'paid' : 'partial';
      await bill.save();
    }
  }

  if (payment.user) {
    await Notification.create({
      user: payment.user,
      title: 'Payment Approved',
      message: `Your payment of Rs. ${payment.amount} has been approved.`,
      type: 'payment',
      link: payment.order ? `/orders/${payment.order}` : '/payments',
    });
  }

  await ActivityLog.create({
    user: req.user._id,
    action: 'PAYMENT_APPROVED',
    module: 'Payments',
    description: `Payment Rs. ${payment.amount} approved`,
    metadata: { paymentId: payment._id },
  });

  res.json(payment);
});

exports.rejectPayment = asyncHandler(async (req, res) => {
  const { reason, adminNotes } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  if (payment.status === 'approved') return res.status(400).json({ message: 'Approved payments cannot be rejected' });

  payment.status = 'rejected';
  payment.approvedAmount = 0;
  payment.approvedBy = req.user._id;
  payment.approvedAt = new Date();
  payment.rejectionReason = reason || '';
  payment.adminNotes = adminNotes || reason || payment.adminNotes;
  await payment.save();

  if (payment.order) {
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'pending';
      order.paymentStatusHistory.push({
        status: 'pending',
        note: reason ? `Payment proof rejected: ${reason}` : 'Payment proof rejected',
        changedBy: req.user._id,
      });
      await order.save();
    }
  }

  if (payment.user) {
    await Notification.create({
      user: payment.user,
      title: 'Payment Rejected',
      message: `Your payment of Rs. ${payment.amount} was rejected. ${reason ? `Reason: ${reason}` : 'Please resubmit.'}`,
      type: 'payment',
      link: '/payments/submit',
    });
  }

  await ActivityLog.create({
    user: req.user._id,
    action: 'PAYMENT_REJECTED',
    module: 'Payments',
    description: `Payment Rs. ${payment.amount} rejected. ${reason || ''}`,
    metadata: { paymentId: payment._id },
  });

  res.json(payment);
});

exports.partialPayment = asyncHandler(async (req, res) => {
  const { approvedAmount, reason, adminNotes } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  if (payment.status === 'approved') return res.status(400).json({ message: 'Approved payments cannot be changed to partial' });

  const amount = Number(approvedAmount);
  if (!amount || amount <= 0 || amount > payment.amount) {
    return res.status(400).json({ message: 'Approved amount must be greater than 0 and not exceed submitted amount' });
  }

  payment.status = 'partial';
  payment.approvedAmount = amount;
  payment.approvedBy = req.user._id;
  payment.approvedAt = new Date();
  payment.adminNotes = adminNotes || reason || payment.adminNotes;
  await payment.save();

  if (payment.order) {
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'partial';
      order.paymentStatusHistory.push({ status: 'partial', note: `Partial payment Rs. ${amount} approved`, changedBy: req.user._id });
      await order.save();
    }
  }

  if (payment.bill) {
    const bill = await Bill.findById(payment.bill);
    if (bill) {
      bill.paidAmount = (bill.paidAmount || 0) + amount;
      bill.pendingAmount = Math.max(0, bill.subtotal - bill.paidAmount);
      bill.status = 'partial';
      await bill.save();
    }
  }

  if (payment.user) {
    await Notification.create({
      user: payment.user,
      title: 'Partial Payment Approved',
      message: `Rs. ${amount} of your payment has been approved.`,
      type: 'payment',
      link: payment.order ? `/orders/${payment.order}` : '/payments',
    });
  }

  res.json(payment);
});

exports.markCashReceived = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.paymentMethod !== 'cod') return res.status(400).json({ message: 'Not a COD order' });

  order.paymentStatus = 'paid';
  order.paymentStatusHistory.push({ status: 'paid', note: 'Cash received by admin', changedBy: req.user._id });
  await order.save();

  await Payment.create({
    user: order.user,
    order: order._id,
    amount: order.total,
    expectedAmount: order.total,
    approvedAmount: order.total,
    method: 'cash',
    status: 'approved',
    approvedBy: req.user._id,
    approvedAt: new Date(),
    notes: 'Cash received on delivery',
  });

  await ActivityLog.create({
    user: req.user._id,
    action: 'CASH_RECEIVED',
    module: 'Payments',
    description: `COD cash received for order #${order.orderNumber}`,
    metadata: { orderId: order._id },
  });

  res.json(order);
});
