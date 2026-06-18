const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, isAvailable } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
  // Non-admin: only visible
  if (!req.user || !['admin', 'staff'].includes(req.user.role)) filter.isVisible = true;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name').lean();
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if ((!req.user || !['admin', 'staff'].includes(req.user.role)) && !product.isVisible) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, ...rest } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  if (req.file) rest.image = `/uploads/${req.file.filename}`;
  const product = await Product.create({ name, slug, ...rest });
  res.status(201).json(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.image = `/uploads/${req.file.filename}`;
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

exports.toggleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.isAvailable = !product.isAvailable;
  await product.save();
  res.json(product);
});
