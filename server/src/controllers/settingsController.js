const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');

// Public — expose QR and UPI for payment step, but keep other sensitive fields
exports.getPublicSettings = asyncHandler(async (req, res) => {
  const s = await Settings.findOne().select('-__v').lean();
  // Expose upiId and qrImage publicly (needed for checkout payment)
  res.json(s || {});
});

exports.getSettings = asyncHandler(async (req, res) => {
  const s = await Settings.findOne().lean();
  res.json(s || {});
});

exports.updateSettings = asyncHandler(async (req, res) => {
  let s = await Settings.findOne();
  if (!s) s = new Settings();
  Object.assign(s, req.body);
  await s.save();
  res.json(s);
});

exports.uploadQR = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const path = `/uploads/${req.file.filename}`;
  await Settings.findOneAndUpdate({}, { qrImage: path }, { upsert: true });
  res.json({ qrImage: path });
});

exports.uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const path = `/uploads/${req.file.filename}`;
  await Settings.findOneAndUpdate({}, { logoImage: path }, { upsert: true });
  res.json({ logoImage: path });
});
