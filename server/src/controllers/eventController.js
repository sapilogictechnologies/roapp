const EventBooking = require('../models/EventBooking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const EVENT_STATUSES = ['pending', 'quoted', 'confirmed', 'completed', 'cancelled'];
const QUOTABLE_STATUSES = ['pending', 'quoted'];
const ADMIN_TRANSITIONS = {
  pending: ['quoted', 'cancelled'],
  quoted: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const isAdminUser = (user) => user && ['admin', 'staff'].includes(user.role);

const toMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const appendHistory = (event, status, note, changedBy) => {
  event.statusHistory.push({
    status,
    note: note || '',
    changedBy: changedBy || null,
    changedAt: new Date(),
  });
};

const customerEventFilter = (user) => {
  const filters = [{ createdBy: user._id }];
  if (user.email) filters.push({ createdBy: { $exists: false }, email: user.email.toLowerCase() });
  if (user.mobile) filters.push({ createdBy: { $exists: false }, phone: user.mobile });
  return { $or: filters };
};

const eventBelongsToUser = (event, user) => {
  if (!event || !user) return false;
  if (event.createdBy && event.createdBy.toString() === user._id.toString()) return true;
  if (event.createdBy) return false;
  if (user.email && (event.email || '').toLowerCase() === user.email.toLowerCase()) return true;
  if (user.mobile && event.phone === user.mobile) return true;
  return false;
};

const notifyCustomer = async (event, title, message) => {
  if (!event.createdBy) return;
  await Notification.create({
    user: event.createdBy,
    title,
    message,
    type: 'event',
    link: '/events',
  });
};

const notifyAdmins = async (title, message) => {
  const admins = await User.find({ role: { $in: ['admin', 'staff'] }, isActive: true }).select('_id').lean();
  if (!admins.length) return;
  await Notification.insertMany(admins.map((admin) => ({
    user: admin._id,
    title,
    message,
    type: 'event',
    link: '/admin/events',
  })));
};

const saveQuoteResponse = async ({ req, res, response }) => {
  const event = await EventBooking.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (isAdminUser(req.user)) {
    return res.status(403).json({ message: 'Admins must use the event status endpoint with adminOverride for overrides' });
  }
  if (!eventBelongsToUser(event, req.user)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  if (event.status !== 'quoted' || !event.quoteAmount) {
    return res.status(400).json({ message: 'Only quoted events can be accepted or rejected' });
  }

  const accepted = response === 'accepted';
  event.status = accepted ? 'confirmed' : 'cancelled';
  event.quoteResponse = response;
  event.quoteRespondedAt = new Date();
  if (!accepted) event.cancellationReason = req.body.reason || 'Quote rejected by customer';
  appendHistory(
    event,
    event.status,
    accepted ? 'Quote accepted by customer' : event.cancellationReason,
    req.user._id
  );
  await event.save();

  await notifyCustomer(
    event,
    accepted ? 'Event Quote Accepted' : 'Event Quote Rejected',
    accepted
      ? `Your event booking for ${event.eventType} is confirmed.`
      : `Your event quote for ${event.eventType} was rejected.`
  );
  await notifyAdmins(
    accepted ? 'Event Quote Accepted' : 'Event Quote Rejected',
    `${event.name} ${accepted ? 'accepted' : 'rejected'} the quote for ${event.eventType}.`
  );

  return res.json(event);
};

exports.createEvent = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = body.name || req.user.name;
  const phone = body.phone || req.user.mobile;
  const email = body.email || req.user.email || '';

  if (!name || !phone || !body.eventType || !body.eventDate || !body.venue) {
    return res.status(400).json({ message: 'Name, phone, event type, event date and venue are required' });
  }

  const waterItems = Array.isArray(body.waterItems)
    ? body.waterItems.map((item) => ({
        name: item.name || '',
        qty: Number(item.qty) || 0,
        unit: item.unit || '',
        pricePerUnit: toMoney(item.pricePerUnit),
        subtotal: toMoney(item.subtotal),
      }))
    : [];

  const event = await EventBooking.create({
    name,
    phone,
    email: email.toLowerCase(),
    eventType: body.eventType,
    eventDate: body.eventDate,
    venue: body.venue,
    guestCount: Number(body.guestCount) || 0,
    waterItems,
    waterQuantity: body.waterQuantity || '',
    waterType: body.waterType || '',
    chilledWaterNeeded: Boolean(body.chilledWaterNeeded),
    deliveryTiming: body.deliveryTiming || '',
    notes: body.notes || '',
    estimatedTotal: toMoney(body.estimatedTotal),
    advanceRequired: toMoney(body.advanceRequired),
    advancePaid: 0,
    quoteAmount: 0,
    quoteNotes: '',
    quoteResponse: 'pending',
    status: 'pending',
    createdBy: req.user._id,
    statusHistory: [{
      status: 'pending',
      note: 'Event request submitted',
      changedBy: req.user._id,
      changedAt: new Date(),
    }],
  });

  await notifyCustomer(
    event,
    'Event Enquiry Received',
    `We received your ${event.eventType} booking enquiry and will send a quote shortly.`
  );
  await notifyAdmins(
    'New Event Booking Enquiry',
    `${event.name} requested ${event.eventType} water service for ${new Date(event.eventDate).toLocaleDateString('en-IN')}.`
  );

  res.status(201).json(event);
});

exports.getMyEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const filter = customerEventFilter(req.user);
  if (status) filter.status = status;

  const total = await EventBooking.countDocuments(filter);
  const events = await EventBooking.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  res.json({ events, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
});

exports.getMyEvent = asyncHandler(async (req, res) => {
  const event = await EventBooking.findById(req.params.id).lean();
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!eventBelongsToUser(event, req.user)) return res.status(403).json({ message: 'Access denied' });
  res.json(event);
});

exports.getAllEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const filter = status ? { status } : {};
  const total = await EventBooking.countDocuments(filter);
  const events = await EventBooking.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate('createdBy', 'name email mobile')
    .lean();
  res.json({ events, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
});

exports.getEvent = asyncHandler(async (req, res) => {
  const event = await EventBooking.findById(req.params.id)
    .populate('createdBy', 'name email mobile')
    .lean();
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

exports.updateQuote = asyncHandler(async (req, res) => {
  const quoteAmount = toMoney(req.body.quoteAmount);
  const quoteNotes = req.body.quoteNotes || '';
  if (quoteAmount <= 0) return res.status(400).json({ message: 'Quote amount must be greater than 0' });

  const event = await EventBooking.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!QUOTABLE_STATUSES.includes(event.status)) {
    return res.status(400).json({ message: `Cannot quote an event with status ${event.status}` });
  }

  event.quoteAmount = quoteAmount;
  event.quoteNotes = quoteNotes;
  event.quoteSentAt = new Date();
  event.quoteResponse = 'pending';
  event.quoteRespondedAt = null;
  event.status = 'quoted';
  appendHistory(event, 'quoted', quoteNotes || `Quote sent for Rs. ${quoteAmount}`, req.user._id);
  await event.save();

  await notifyCustomer(
    event,
    'Event Quote Ready',
    `Your event quote is ready for Rs. ${quoteAmount}. Please accept or reject it.`
  );

  res.json(event);
});

exports.respondToQuote = asyncHandler(async (req, res) => {
  const action = String(req.body.action || req.body.response || '').toLowerCase();
  if (['accept', 'accepted'].includes(action)) {
    return saveQuoteResponse({ req, res, response: 'accepted' });
  }
  if (['reject', 'rejected'].includes(action)) {
    return saveQuoteResponse({ req, res, response: 'rejected' });
  }
  return res.status(400).json({ message: 'Use action "accept" or "reject"' });
});

exports.acceptQuote = asyncHandler(async (req, res) => (
  saveQuoteResponse({ req, res, response: 'accepted' })
));

exports.rejectQuote = asyncHandler(async (req, res) => (
  saveQuoteResponse({ req, res, response: 'rejected' })
));

exports.updateStatus = asyncHandler(async (req, res) => {
  const nextStatus = req.body.status;
  const note = req.body.note || req.body.adminNotes || '';
  const adminOverride = req.body.adminOverride === true || req.body.adminOverride === 'true';
  if (!EVENT_STATUSES.includes(nextStatus)) {
    return res.status(400).json({ message: 'Invalid event status' });
  }

  const event = await EventBooking.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const currentStatus = event.status || 'pending';
  if (currentStatus === nextStatus) return res.json(event);

  const allowed = ADMIN_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return res.status(400).json({ message: `Cannot move event from ${currentStatus} to ${nextStatus}` });
  }
  if (nextStatus === 'quoted' && event.quoteAmount <= 0) {
    return res.status(400).json({ message: 'Send a quote amount before marking as quoted' });
  }
  if (currentStatus === 'quoted' && nextStatus === 'confirmed' && event.quoteResponse !== 'accepted' && !adminOverride) {
    return res.status(400).json({ message: 'Customer must accept the quote before confirmation, or set adminOverride to true' });
  }

  event.status = nextStatus;
  if (nextStatus === 'cancelled') event.cancellationReason = req.body.reason || note || 'Cancelled by admin';
  const historyNote = adminOverride && currentStatus === 'quoted' && nextStatus === 'confirmed'
    ? `Admin override: confirmed before customer quote acceptance${note ? ` - ${note}` : ''}`
    : note || event.cancellationReason || 'Status updated by admin';
  appendHistory(event, nextStatus, historyNote, req.user._id);
  await event.save();

  await notifyCustomer(
    event,
    'Event Booking Updated',
    `Your event booking is now ${nextStatus}.`
  );

  res.json(event);
});
