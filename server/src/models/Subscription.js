const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    frequency: { type: String, enum: ['daily', 'alternate', 'weekly', '15day', 'monthly', 'custom'], default: 'daily' },
    customDays: [{ type: Number }],
    address: { type: String, default: '' },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    nextDeliveryDate: { type: Date },
    pauseUntil: { type: Date, default: null },
    skipDates: [{ type: Date }],
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1, nextDeliveryDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
