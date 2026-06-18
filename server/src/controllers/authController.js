const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password required' });
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  const user = await User.create({ name, email: email.toLowerCase(), mobile, password, role: 'customer' });
  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, mobile, password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: 'Password required' });
  if (!email && !mobile) return res.status(400).json({ success: false, message: 'Email or mobile required' });

  // Find user — explicitly select password
  const query = email ? { email: email.toLowerCase() } : { mobile };
  const user = await User.findOne(query).select('+password');

  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role },
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, mobile } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, mobile }, { new: true }).select('-password');
  res.json({ success: true, user });
});
