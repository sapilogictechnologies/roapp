const Order = require('../models/Order');
const Product = require('../models/Product');
const JarLedger = require('../models/JarLedger');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const PricingRule = require('../models/PricingRule');
const ServiceArea = require('../models/ServiceArea');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { generateOrderNumber } = require('../utils/generators');
const { haversineDistance } = require('../utils/haversine');
const { createAdminNotifications } = require('../services/notificationService');

exports.createOrder = asyncHandler(async (req, res) => {
  const {
    items, address, area, pincode, city, coordinates, locationSource,
    timeSlot, paymentMethod, orderNotes, guestName, guestPhone, couponCode,
  } = req.body;

  if (!items || !items.length) return res.status(400).json({ message: 'No items in order' });

  const settings = await Settings.findOne().lean();
  const jarDepositAmount = Number(settings?.jarDepositAmount ?? 150);
  const normalizedPaymentMethod = paymentMethod || 'cod';
  if (!['cod', 'upi', 'wallet', 'credit'].includes(normalizedPaymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }
  if (normalizedPaymentMethod === 'cod' && settings?.codEnabled === false) {
    return res.status(400).json({ message: 'Cash on delivery is currently disabled' });
  }

  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  let depositFee = 0;
  const orderItems = [];
  for (const item of items) {
    const product = productMap[item.product];
    if (!product) throw new Error(`Product not found: ${item.product}`);
    if (!product.isAvailable || !product.isVisible) {
      return res.status(400).json({ message: `${product.name} is not available` });
    }
    const quantity = Math.max(1, Number(item.quantity) || 1);
    if (Number(product.stock || 0) < quantity) {
      return res.status(400).json({ message: `Only ${product.stock || 0} unit(s) of ${product.name} are in stock` });
    }
    const price = product.salePrice || product.price;
    subtotal += price * quantity;
    let deposit = 0;
    const jarOption = product.isJarProduct
      ? (item.jarOption || (item.hasEmptyJar ? 'returning' : 'no_jar'))
      : 'own_container';
    if (product.isJarProduct && ['no_jar', 'return_later'].includes(jarOption)) {
      deposit = jarDepositAmount * quantity;
      depositFee += deposit;
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      price,
      quantity,
      isJarProduct: product.isJarProduct,
      hasEmptyJar: jarOption === 'returning',
      jarOption,
      depositAmount: deposit,
    });
  }

  // Delivery fee calculation: coordinates first, then pincode fallback
  let deliveryFee = 0;
  let distanceKm = 0;
  let etaMinutes = 30;
  let minimumOrder = 0;
  let resolvedPincode = pincode || '';
  let resolvedCity = city || '';

  if (locationSource === 'gps' && coordinates?.latitude && coordinates?.longitude) {
    if (settings) {
      distanceKm = haversineDistance(settings.shopLatitude, settings.shopLongitude, coordinates.latitude, coordinates.longitude);
      if (distanceKm > (settings.maxDeliveryDistance || 10)) {
        return res.status(400).json({ message: `Delivery not available for this location. Distance ${distanceKm.toFixed(1)}km exceeds limit.` });
      }
      const rule = await PricingRule.findOne({ minDistance: { $lte: distanceKm }, maxDistance: { $gte: distanceKm }, isActive: true }).lean();
      if (rule) {
        deliveryFee = rule.deliveryFee;
        minimumOrder = rule.minimumOrder;
        etaMinutes = rule.etaMinutes + (settings.trafficBufferMinutes || 0);
      }
    }
  } else if (pincode) {
    const serviceArea = await ServiceArea.findOne({ pincode: pincode.trim(), isServiceable: true }).lean();
    if (!serviceArea) {
      return res.status(400).json({ message: `Delivery not available for pincode ${pincode}.` });
    }
    deliveryFee = serviceArea.deliveryFee;
    minimumOrder = serviceArea.minimumOrder;
    etaMinutes = serviceArea.etaMinutes;
    resolvedCity = serviceArea.city || city || '';
  } else {
    return res.status(400).json({ message: 'Provide coordinates or a pincode to calculate delivery.' });
  }

  if (minimumOrder > 0 && subtotal < minimumOrder) {
    return res.status(400).json({ message: `Minimum order amount is ₹${minimumOrder}` });
  }

  // Coupon
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && subtotal >= coupon.minOrder) {
      if (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) {
        if (coupon.type === 'flat') discountAmount = coupon.value;
        else discountAmount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity);
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + depositFee - discountAmount);

  // Pay Later: add to outstanding dues
  let outstandingAdded = false;
  if (normalizedPaymentMethod === 'credit') {
    if (!settings?.payLaterEnabled) return res.status(400).json({ message: 'Pay Later is currently disabled' });
    if (!req.user) return res.status(400).json({ message: 'Login required for Pay Later' });
    const u = await User.findById(req.user._id);
    if (!u.allowPayLater) return res.status(400).json({ message: 'Pay Later not enabled for your account' });
    u.outstandingDues = (u.outstandingDues || 0) + total;
    await u.save();
    outstandingAdded = true;
  }

  // Determine initial order status
  let initialStatus = 'placed';
  if (normalizedPaymentMethod === 'upi') initialStatus = 'payment_pending';

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user?._id || null,
    guestName: guestName || '',
    guestPhone: guestPhone || '',
    items: orderItems,
    subtotal,
    deliveryFee,
    depositFee,
    discountAmount,
    couponCode: couponCode || '',
    total,
    paymentMethod: normalizedPaymentMethod,
    paymentStatus: paymentMethod === 'credit' ? 'pending' : 'pending',
    orderStatus: initialStatus,
    statusHistory: [{ status: initialStatus, note: 'Order placed', changedBy: req.user?._id || null }],
    paymentStatusHistory: [{ status: 'pending', note: 'Order placed' }],
    address: address || '',
    area: area || '',
    pincode: resolvedPincode,
    city: resolvedCity,
    locationSource: locationSource || 'manual',
    coordinates: coordinates || {},
    distanceKm,
    etaMinutes,
    timeSlot: timeSlot || null,
    orderNotes: orderNotes || '',
    jarStatus: orderItems.some((i) => i.isJarProduct && ['no_jar', 'return_later'].includes(i.jarOption)) ? 'pending' : 'na',
    outstandingAdded,
  });

  // Jar ledger
  for (const item of orderItems) {
    if (item.isJarProduct) {
      if (item.jarOption === 'own_container') continue;
      await JarLedger.create({
        user: req.user._id,
        order: order._id,
        type: 'delivered',
        quantity: item.quantity,
        depositAmount: item.depositAmount,
        notes: `Order ${order.orderNumber}`,
        createdBy: req.user._id,
      });
      if (item.jarOption === 'returning') {
        await JarLedger.create({
          user: req.user._id,
          order: order._id,
          type: 'returned',
          quantity: item.quantity,
          depositAmount: 0,
          notes: `Empty jar exchanged for order ${order.orderNumber}`,
          createdBy: req.user._id,
        });
      }
    }
  }

  // Reduce stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Notification
  if (req.user?._id) {
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed',
      message: `Your order #${order.orderNumber} has been placed. Total: ₹${total}`,
      type: 'order',
      link: `/orders/${order._id}`,
    });
  }
  await createAdminNotifications({
    title: 'New Order Placed',
    message: `Order #${order.orderNumber} was placed for Rs. ${total}`,
    type: 'order',
    link: `/admin/orders/${order._id}`,
  });

  await ActivityLog.create({
    user: req.user?._id || null,
    action: 'ORDER_PLACED',
    module: 'Orders',
    description: `Order #${order.orderNumber} placed for ₹${total}`,
    metadata: { orderId: order._id, total },
  });

  res.status(201).json(order);
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.orderStatus = status;
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('timeSlot', 'name')
    .lean();
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search, paymentStatus, paymentMethod } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (search) filter.$or = [
    { orderNumber: { $regex: search, $options: 'i' } },
    { guestName: { $regex: search, $options: 'i' } },
    { guestPhone: { $regex: search, $options: 'i' } },
    { pincode: { $regex: search, $options: 'i' } },
  ];
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email mobile')
    .populate('timeSlot', 'name')
    .lean();
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email mobile')
    .populate('timeSlot', 'name')
    .populate('items.product', 'name image')
    .lean();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && order.user?._id?.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Access denied' });
  res.json(order);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, adminNotes, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Block confirming UPI orders if payment not approved
  if (orderStatus === 'confirmed' && order.paymentMethod === 'upi' && order.paymentStatus !== 'paid' && order.paymentStatus !== 'partial') {
    return res.status(400).json({ message: 'Cannot confirm order. UPI payment not yet approved.' });
  }

  order.orderStatus = orderStatus;
  if (adminNotes) order.adminNotes = adminNotes;
  order.statusHistory.push({ status: orderStatus, note: note || adminNotes || '', changedBy: req.user._id });
  await order.save();

  if (order.user) {
    await Notification.create({
      user: order.user,
      title: 'Order Update',
      message: `Your order #${order.orderNumber} is now: ${orderStatus}`,
      type: 'order',
      link: `/orders/${order._id}`,
    });
  }

  await ActivityLog.create({
    user: req.user._id,
    action: 'ORDER_STATUS_UPDATE',
    module: 'Orders',
    description: `Order #${order.orderNumber} status → ${orderStatus}`,
    metadata: { orderId: order._id, orderStatus },
  });

  res.json(order);
});

exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.paymentStatus = paymentStatus;
  order.paymentStatusHistory.push({ status: paymentStatus, note: note || '', changedBy: req.user._id });
  await order.save();
  res.json(order);
});

exports.reorder = asyncHandler(async (req, res) => {
  const original = await Order.findById(req.params.id).lean();
  if (!original) return res.status(404).json({ message: 'Order not found' });
  const isAdmin = ['admin', 'staff'].includes(req.user.role);
  if (!isAdmin && original.user?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }
  for (const item of original.items || []) {
    const product = await Product.findById(item.product).select('name stock isAvailable isVisible').lean();
    if (!product || !product.isAvailable || !product.isVisible) {
      return res.status(400).json({ message: `${item.name} is no longer available` });
    }
    if (Number(product.stock || 0) < Number(item.quantity || 0)) {
      return res.status(400).json({ message: `Only ${product.stock || 0} unit(s) of ${product.name} are in stock` });
    }
  }
  const { _id, orderNumber, createdAt, updatedAt, statusHistory, paymentStatusHistory, ...rest } = original;
  const newOrder = await Order.create({
    ...rest,
    orderNumber: generateOrderNumber(),
    orderStatus: 'placed',
    paymentStatus: 'pending',
    statusHistory: [{ status: 'placed', note: 'Reorder', changedBy: req.user._id }],
    paymentStatusHistory: [{ status: 'pending', note: 'Reorder' }],
  });
  for (const item of original.items || []) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -Number(item.quantity || 0) } });
  }
  res.status(201).json(newOrder);
});
