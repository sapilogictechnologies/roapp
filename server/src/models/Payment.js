const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', default: null },
    amount: { type: Number, required: true },
    expectedAmount: { type: Number, default: 0 },
    approvedAmount: { type: Number, default: 0 },
    method: { type: String, enum: ['upi', 'cash', 'bank', 'wallet'], default: 'upi' },
    status: {
      type: String,
      enum: ['pending_verification', 'pending', 'approved', 'rejected', 'partial'],
      default: 'pending_verification',
    },
    utrNumber: { type: String, default: '' },
    screenshot: { type: String, default: '' },
    notes: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
