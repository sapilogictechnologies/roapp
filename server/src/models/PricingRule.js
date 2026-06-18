const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema(
  {
    minDistance: { type: Number, required: true },
    maxDistance: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    minimumOrder: { type: Number, required: true },
    etaMinutes: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
