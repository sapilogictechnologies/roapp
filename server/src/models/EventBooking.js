const mongoose = require('mongoose');
const eventBookingSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  phone:              { type: String, required: true },
  email:              { type: String, default: '' },
  eventType:          { type: String, required: true },
  eventDate:          { type: Date, required: true },
  venue:              { type: String, required: true },
  guestCount:         { type: Number, default: 0 },
  waterItems:         [{ name: String, qty: Number, unit: String, pricePerUnit: Number, subtotal: Number }],
  waterQuantity:      { type: String, default: '' },
  waterType:          { type: String, default: '' },
  chilledWaterNeeded: { type: Boolean, default: false },
  deliveryTiming:     { type: String, default: '' },
  notes:              { type: String, default: '' },
  estimatedTotal:     { type: Number, default: 0 },
  advanceRequired:    { type: Number, default: 0 },
  advancePaid:        { type: Number, default: 0 },
  quoteAmount:        { type: Number, default: 0 },
  quoteNotes:         { type: String, default: '' },
  quoteSentAt:        { type: Date, default: null },
  quoteResponse:      { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  quoteRespondedAt:   { type: Date, default: null },
  cancellationReason: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending','quoted','confirmed','completed','cancelled'],
    default: 'pending',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusHistory: [{
    status: { type: String },
    note: { type: String, default: '' },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    changedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

eventBookingSchema.index({ createdBy: 1, createdAt: -1 });
eventBookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('EventBooking', eventBookingSchema);
