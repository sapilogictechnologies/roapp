const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    audience: { type: String, enum: ['admin', 'customer'], required: true },
    subject: { type: String, default: '' },
    body: { type: String, required: true, trim: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'EventBooking', default: null },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    readByAdmin: { type: Boolean, default: false },
    readByCustomer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ customer: 1, createdAt: -1 });
messageSchema.index({ audience: 1, readByAdmin: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, readByCustomer: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
