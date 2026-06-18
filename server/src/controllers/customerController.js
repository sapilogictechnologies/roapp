const User = require('../models/User');
const Address = require('../models/Address');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, isActive } = req.query;
  const filter = { role: 'customer' };
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { mobile: { $regex: search, $options: 'i' } },
  ];
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  const total = await User.countDocuments(filter);
  const customers = await User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean();
  res.json({ customers, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id).select('-password').lean();
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

exports.toggleCustomer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ isActive: user.isActive });
});

exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).lean();
  res.json(addresses);
});

exports.addAddress = asyncHandler(async (req, res) => {
  const { isDefault, fullAddress, area, landmark, city, state, pincode, latitude, longitude, locationSource, label } = req.body;
  if (isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.create({
    user: req.user._id, label: label || 'Home', fullAddress, area: area || '', landmark: landmark || '',
    city: city || '', state: state || '', pincode: pincode || '',
    latitude: latitude || null, longitude: longitude || null,
    locationSource: locationSource || 'manual', isDefault: isDefault || false,
  });
  res.status(201).json(address);
});

exports.updateAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
  if (!address) return res.status(404).json({ message: 'Address not found' });
  res.json(address);
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Address deleted' });
});
