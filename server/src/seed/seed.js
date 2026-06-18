require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const seed = async () => {
  await connectDB();

  // Load models
  const User = require('../models/User');
  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const PricingRule = require('../models/PricingRule');
  const TimeSlot = require('../models/TimeSlot');
  const Settings = require('../models/Settings');
  const Coupon = require('../models/Coupon');
  const ServiceArea = require('../models/ServiceArea');
  const Message = require('../models/Message');

  // Clear all
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    PricingRule.deleteMany({}),
    TimeSlot.deleteMany({}),
    Settings.deleteMany({}),
    Coupon.deleteMany({}),
    ServiceArea.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Hash passwords manually (bypasses pre-save hook issue)
  const adminPass = await bcrypt.hash('Admin@12345', 12);
  const custPass = await bcrypt.hash('Customer@123', 12);

  // Insert users directly (bypass pre-save to avoid double hashing)
  await User.collection.insertMany([
    {
      name: 'Admin User',
      email: 'admin@roapp.com',
      mobile: '9999999999',
      password: adminPass,
      role: 'admin',
      isActive: true,
      walletBalance: 0,
      loyaltyPoints: 0,
      outstandingDues: 0,
      allowPayLater: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Test Customer',
      email: 'customer@test.com',
      mobile: '8888888888',
      password: custPass,
      role: 'customer',
      isActive: true,
      walletBalance: 0,
      loyaltyPoints: 0,
      outstandingDues: 0,
      allowPayLater: true,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('👤 Users seeded');

  const [jarCat, bottleCat, packetCat, eventCat] = await Category.create([
    { name: 'Jar Water', slug: 'jar-water', isActive: true },
    { name: 'Bottle Water', slug: 'bottle-water', isActive: true },
    { name: 'Packet Water', slug: 'packet-water', isActive: true },
    { name: 'Event Water', slug: 'event-water', isActive: true },
  ]);
  console.log('📂 Categories seeded');

  await Product.create([
    { name: '20L RO Jar', slug: '20l-ro-jar', description: 'Pure RO 20L jar', price: 40, salePrice: 35, unit: 'jar', category: jarCat._id, isAvailable: true, isVisible: true, isJarProduct: true, depositAmount: 150, stock: 500 },
    { name: '1L Bottle', slug: '1l-bottle', description: 'Sealed 1L bottle', price: 20, unit: 'bottle', category: bottleCat._id, isAvailable: true, isVisible: true, isJarProduct: false, stock: 1000 },
    { name: '500ml Bottle', slug: '500ml-bottle', description: '500ml bottle', price: 12, unit: 'bottle', category: bottleCat._id, isAvailable: true, isVisible: true, isJarProduct: false, stock: 2000 },
    { name: 'Water Packet 200ml', slug: 'water-packet-200ml', description: '200ml sachet', price: 3, unit: 'packet', category: packetCat._id, isAvailable: true, isVisible: true, isJarProduct: false, stock: 5000 },
    { name: 'Carton Water 24x500ml', slug: 'carton-water-24x500ml', description: '24 x 500ml carton', price: 250, unit: 'carton', category: bottleCat._id, isAvailable: true, isVisible: true, isJarProduct: false, stock: 100 },
    { name: 'Premium 1L Bottle', slug: 'premium-1l-bottle', description: 'Premium mineral water', price: 30, unit: 'bottle', category: bottleCat._id, isAvailable: true, isVisible: true, isJarProduct: false, stock: 500 },
    { name: 'Event Water Package', slug: 'event-water-package', description: 'Bulk for events', price: 500, unit: 'package', category: eventCat._id, isAvailable: true, isVisible: true, isJarProduct: false, stock: 50 },
  ]);
  console.log('🛍️  Products seeded');

  await PricingRule.create([
    { minDistance: 0, maxDistance: 3, deliveryFee: 10, minimumOrder: 100, etaMinutes: 20, isActive: true },
    { minDistance: 3, maxDistance: 5, deliveryFee: 20, minimumOrder: 150, etaMinutes: 30, isActive: true },
    { minDistance: 5, maxDistance: 7, deliveryFee: 30, minimumOrder: 250, etaMinutes: 40, isActive: true },
    { minDistance: 7, maxDistance: 10, deliveryFee: 50, minimumOrder: 400, etaMinutes: 55, isActive: true },
  ]);
  console.log('📏 Pricing rules seeded');

  await ServiceArea.create([
    { areaName: 'Connaught Place', pincode: '110001', city: 'New Delhi', state: 'Delhi', isServiceable: true, deliveryFee: 10, minimumOrder: 100, etaMinutes: 25 },
    { areaName: 'Karol Bagh', pincode: '110005', city: 'New Delhi', state: 'Delhi', isServiceable: true, deliveryFee: 15, minimumOrder: 150, etaMinutes: 30 },
    { areaName: 'Lajpat Nagar', pincode: '110024', city: 'New Delhi', state: 'Delhi', isServiceable: true, deliveryFee: 20, minimumOrder: 150, etaMinutes: 35 },
    { areaName: 'Dwarka', pincode: '110075', city: 'New Delhi', state: 'Delhi', isServiceable: true, deliveryFee: 40, minimumOrder: 300, etaMinutes: 50 },
    { areaName: 'Noida Sector 18', pincode: '201301', city: 'Noida', state: 'UP', isServiceable: true, deliveryFee: 30, minimumOrder: 200, etaMinutes: 40 },
  ]);
  console.log('🗺️  Service areas seeded');

  await TimeSlot.create([
    { name: 'ASAP', startTime: '00:00', endTime: '23:59', maxOrders: 100, isActive: true },
    { name: 'Morning (8AM-12PM)', startTime: '08:00', endTime: '12:00', maxOrders: 50, isActive: true, cutoffTime: '07:30' },
    { name: 'Afternoon (12PM-4PM)', startTime: '12:00', endTime: '16:00', maxOrders: 50, isActive: true, cutoffTime: '11:30' },
    { name: 'Evening (4PM-8PM)', startTime: '16:00', endTime: '20:00', maxOrders: 50, isActive: true, cutoffTime: '15:30' },
    { name: 'Night (8PM-10PM)', startTime: '20:00', endTime: '22:00', maxOrders: 30, isActive: true, cutoffTime: '19:30' },
  ]);
  console.log('⏰ Time slots seeded');

  await Settings.create({
    businessName: 'Pure RO Water Supply',
    phone: '9999999999',
    whatsapp: '9999999999',
    address: '123, Water Colony, Delhi - 110001',
    shopLatitude: 28.6139,
    shopLongitude: 77.2090,
    upiId: '6394746719@kotak', jarDepositAmount: 150, codEnabled: true, payLaterEnabled: false, paymentInstructions: 'Scan QR or pay to UPI ID. Upload screenshot and UTR after payment.', qrImage: '/uploads/qr_ajay_maurya.png',
    workingHours: '8:00 AM - 10:00 PM',
    maxDeliveryDistance: 10,
    trafficBufferMinutes: 0,
    maintenanceMode: false,
    announcementBanner: 'Welcome to Pure RO Water Supply!',
  });
  console.log('⚙️  Settings seeded');

  await Coupon.create([
    { code: 'WELCOME10', type: 'flat', value: 10, minOrder: 100, isActive: true, usageLimit: 0 },
    { code: 'SAVE20', type: 'percent', value: 20, minOrder: 200, maxDiscount: 50, isActive: true, usageLimit: 100 },
  ]);
  console.log('🎟️  Coupons seeded');

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:    admin@roapp.com    / Admin@12345');
  console.log('Customer: customer@test.com  / Customer@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  mongoose.disconnect();
};

seed().catch((err) => { console.error('❌ Seed error:', err.message); process.exit(1); });
