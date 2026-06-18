const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    maxOrders: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true },
    cutoffTime: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
