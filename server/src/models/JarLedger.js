const mongoose = require('mongoose');

const jarLedgerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    type: { type: String, enum: ['delivered', 'returned', 'lost', 'damaged', 'deposit'], required: true },
    quantity: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

jarLedgerSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('JarLedger', jarLedgerSchema);
