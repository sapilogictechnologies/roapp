const TimeSlot = require('../models/TimeSlot');
const asyncHandler = require('../utils/asyncHandler');

exports.getTimeSlots = asyncHandler(async (req, res) => {
  const filter = ['admin', 'staff'].includes(req.user?.role) ? {} : { isActive: true };
  const slots = await TimeSlot.find(filter).lean();
  res.json(slots);
});

exports.createTimeSlot = asyncHandler(async (req, res) => {
  const slot = await TimeSlot.create(req.body);
  res.status(201).json(slot);
});

exports.updateTimeSlot = asyncHandler(async (req, res) => {
  const slot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!slot) return res.status(404).json({ message: 'Time slot not found' });
  res.json(slot);
});

exports.deleteTimeSlot = asyncHandler(async (req, res) => {
  await TimeSlot.findByIdAndDelete(req.params.id);
  res.json({ message: 'Time slot deleted' });
});
