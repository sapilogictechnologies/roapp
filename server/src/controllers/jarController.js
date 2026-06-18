const JarLedger = require('../models/JarLedger');
const asyncHandler = require('../utils/asyncHandler');

const summarizeLedger = (ledger) => {
  const delivered = ledger.filter((j) => j.type === 'delivered').reduce((s, j) => s + j.quantity, 0);
  const returned = ledger.filter((j) => j.type === 'returned').reduce((s, j) => s + j.quantity, 0);
  const lost = ledger.filter((j) => j.type === 'lost').reduce((s, j) => s + j.quantity, 0);
  const damaged = ledger.filter((j) => j.type === 'damaged').reduce((s, j) => s + j.quantity, 0);
  const depositCharged = ledger
    .filter((j) => ['delivered', 'deposit'].includes(j.type))
    .reduce((s, j) => s + Number(j.depositAmount || 0), 0);
  const depositRefunded = ledger
    .filter((j) => j.type === 'returned')
    .reduce((s, j) => s + Number(j.depositAmount || 0), 0);
  return {
    delivered,
    returned,
    lost,
    damaged,
    balance: Math.max(0, delivered - returned - lost - damaged),
    depositCharged,
    depositRefunded,
    depositHeld: Math.max(0, depositCharged - depositRefunded),
  };
};

const assertNonNegativeLedger = async ({ user, type, quantity, excludeId = null }) => {
  if (!['returned', 'lost', 'damaged'].includes(type)) return;
  const filter = { user };
  if (excludeId) filter._id = { $ne: excludeId };
  const ledger = await JarLedger.find(filter).lean();
  const { balance } = summarizeLedger(ledger);
  if (Number(quantity) > balance) {
    const error = new Error(`Jar ledger cannot go negative. Current pending jars: ${balance}`);
    error.statusCode = 400;
    throw error;
  }
};

exports.getMyJars = asyncHandler(async (req, res) => {
  const ledger = await JarLedger.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('order', 'orderNumber')
    .lean();
  res.json({ ledger, summary: summarizeLedger(ledger) });
});

exports.getAllJars = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const filter = type ? { type } : {};
  const [total, ledger, allLedger] = await Promise.all([
    JarLedger.countDocuments(filter),
    JarLedger.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email')
    .populate('order', 'orderNumber')
    .lean(),
    JarLedger.find().select('type quantity depositAmount').lean(),
  ]);
  res.json({ ledger, summary: summarizeLedger(allLedger), total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.addJarEntry = asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity) || 0;
  await assertNonNegativeLedger({ user: req.body.user, type: req.body.type, quantity });
  const entry = await JarLedger.create({ ...req.body, quantity, createdBy: req.user._id });
  res.status(201).json(entry);
});

exports.getJarSummary = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const ledger = await JarLedger.find({ user: userId }).lean();
  res.json(summarizeLedger(ledger));
});

exports.updateJarEntry = asyncHandler(async (req, res) => {
  const current = await JarLedger.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Entry not found' });

  const nextType = req.body.type || current.type;
  const nextQty = Number(req.body.quantity ?? current.quantity) || 0;
  const nextUser = req.body.user || current.user;
  await assertNonNegativeLedger({ user: nextUser, type: nextType, quantity: nextQty, excludeId: current._id });

  const entry = await JarLedger.findByIdAndUpdate(req.params.id, { ...req.body, quantity: nextQty }, { new: true });
  res.json(entry);
});

exports.requestJarReturn = asyncHandler(async (req, res) => {
  const { quantity, notes } = req.body;
  const qty = Number(quantity) || 1;

  const ledger = await JarLedger.find({ user: req.user._id }).lean();
  const pending = summarizeLedger(ledger).balance;
  if (qty > pending) return res.status(400).json({ message: `You only have ${pending} jar(s) to return` });

  const Settings = require('../models/Settings');
  const settings = await Settings.findOne().lean();
  const depositAmt = (settings?.jarDepositAmount || 150) * qty;

  const entry = await JarLedger.create({
    user: req.user._id,
    type: 'returned',
    quantity: qty,
    depositAmount: depositAmt,
    notes: notes || 'Customer initiated return',
    createdBy: req.user._id,
  });

  const User = require('../models/User');
  await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: depositAmt } });

  try {
    const Notification = require('../models/Notification');
    await Notification.create({
      user: req.user._id,
      title: 'Jar Return Processed',
      message: `${qty} jar(s) return recorded. Rs. ${depositAmt} added to your wallet.`,
      type: 'jar',
    });
  } catch {}

  res.json({ entry, depositRefunded: depositAmt, message: `Rs. ${depositAmt} refunded to your wallet` });
});
