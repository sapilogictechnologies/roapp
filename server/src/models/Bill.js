const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    subtotal: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true },
    status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    dueDate: { type: Date },
    billingPeriodStart: { type: Date },
    billingPeriodEnd: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

billSchema.index({ user: 1 });
billSchema.index({ status: 1 });

module.exports = mongoose.model('Bill', billSchema);
