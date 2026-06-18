const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { generateOrderNumber } = require('../utils/generators');

const isAdminUser = (user) => user && ['admin', 'staff'].includes(user.role);
const ownedFilter = (req) => (isAdminUser(req.user) ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id });

const getNextDeliveryDate = (frequency, customDays) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (frequency === 'daily') { today.setDate(today.getDate() + 1); return today; }
  if (frequency === 'alternate') { today.setDate(today.getDate() + 2); return today; }
  if (frequency === 'weekly') { today.setDate(today.getDate() + 7); return today; }
  if (frequency === '15day') { today.setDate(today.getDate() + 15); return today; }
  if (frequency === 'monthly') { today.setMonth(today.getMonth() + 1); return today; }
  if (frequency === 'custom' && customDays?.length) {
    const dayOfWeek = today.getDay();
    const sorted = [...customDays].sort((a, b) => a - b);
    const next = sorted.find((d) => d > dayOfWeek) ?? sorted[0];
    const diff = next > dayOfWeek ? next - dayOfWeek : 7 - dayOfWeek + next;
    today.setDate(today.getDate() + diff);
    return today;
  }
  today.setDate(today.getDate() + 1);
  return today;
};

exports.createSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.create({
    ...req.body,
    user: req.user._id,
    nextDeliveryDate: getNextDeliveryDate(req.body.frequency, req.body.customDays),
  });
  res.status(201).json(sub);
});

exports.getMySubscriptions = asyncHandler(async (req, res) => {
  const subs = await Subscription.find({ user: req.user._id }).populate('product', 'name price unit image').lean();
  res.json(subs);
});

exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const total = await Subscription.countDocuments(filter);
  const subs = await Subscription.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email')
    .populate('product', 'name')
    .lean();
  res.json({ subscriptions: subs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.pauseSubscription = asyncHandler(async (req, res) => {
  const { pauseUntil } = req.body;
  const sub = await Subscription.findOneAndUpdate(
    ownedFilter(req),
    { status: 'paused', pauseUntil: pauseUntil ? new Date(pauseUntil) : null },
    { new: true }
  );
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  res.json(sub);
});

exports.resumeSubscription = asyncHandler(async (req, res) => {
  const existing = await Subscription.findOne(ownedFilter(req));
  if (!existing) return res.status(404).json({ message: 'Subscription not found' });
  existing.status = 'active';
  existing.pauseUntil = null;
  existing.nextDeliveryDate = getNextDeliveryDate(existing.frequency, existing.customDays);
  await existing.save();
  res.json(existing);
});

exports.skipDelivery = asyncHandler(async (req, res) => {
  const { date } = req.body;
  const sub = await Subscription.findOneAndUpdate(
    ownedFilter(req),
    { $push: { skipDates: new Date(date) } },
    { new: true }
  );
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  res.json(sub);
});

exports.updateSubscription = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (!isAdminUser(req.user)) delete update.user;
  const sub = await Subscription.findOneAndUpdate(ownedFilter(req), update, { new: true });
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  res.json(sub);
});

exports.processDue = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const due = await Subscription.find({ status: 'active', nextDeliveryDate: { $lte: today } }).populate('product').lean();
  const results = [];
  for (const sub of due) {
    const skipDate = sub.skipDates?.find((d) => new Date(d).toDateString() === new Date(sub.nextDeliveryDate).toDateString());
    if (!skipDate) {
      const price = sub.product.salePrice || sub.product.price;
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        user: sub.user,
        items: [{ product: sub.product._id, name: sub.product.name, price, quantity: sub.quantity, isJarProduct: sub.product.isJarProduct, hasEmptyJar: true, depositAmount: 0 }],
        subtotal: price * sub.quantity,
        deliveryFee: 0,
        depositFee: 0,
        discountAmount: 0,
        total: price * sub.quantity,
        address: sub.address || '',
        coordinates: sub.coordinates || {},
        orderNotes: 'Auto subscription order',
      });
      results.push(order._id);
    }
    const nextDate = getNextDeliveryDate(sub.frequency, sub.customDays);
    await Subscription.findByIdAndUpdate(sub._id, { nextDeliveryDate: nextDate });
  }
  res.json({ processed: results.length, orderIds: results });
});
