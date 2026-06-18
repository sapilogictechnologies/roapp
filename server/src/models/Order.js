const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number,
  isJarProduct: Boolean,
  hasEmptyJar: Boolean,
  jarOption: { type: String, enum: ['returning', 'no_jar', 'return_later', 'own_container'], default: 'no_jar' },
  depositAmount: Number,
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  note: String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  changedAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestName: { type: String, default: '' },
    guestPhone: { type: String, default: '' },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    depositFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod', 'upi', 'wallet', 'credit'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'partial', 'refunded'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['placed', 'payment_pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    statusHistory: [statusHistorySchema],
    paymentStatusHistory: [statusHistorySchema],
    address: { type: String, default: '' },
    area: { type: String, default: '' },
    pincode: { type: String, default: '' },
    city: { type: String, default: '' },
    locationSource: { type: String, enum: ['gps', 'manual', 'pincode'], default: 'manual' },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    distanceKm: { type: Number, default: 0 },
    etaMinutes: { type: Number, default: 0 },
    timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot', default: null },
    orderNotes: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    jarStatus: { type: String, enum: ['na', 'pending', 'delivered', 'partial'], default: 'na' },
    outstandingAdded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ pincode: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
