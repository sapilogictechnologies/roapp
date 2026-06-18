const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema(
  {
    areaName: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    isServiceable: { type: Boolean, default: true },
    deliveryFee: { type: Number, required: true },
    minimumOrder: { type: Number, required: true },
    etaMinutes: { type: Number, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

serviceAreaSchema.index({ pincode: 1 });
serviceAreaSchema.index({ isServiceable: 1 });

module.exports = mongoose.model('ServiceArea', serviceAreaSchema);
