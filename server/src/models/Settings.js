const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({
  businessName:        { type: String, default: 'AquaFlow RO Water' },
  phone:               { type: String, default: '9876543210' },
  whatsapp:            { type: String, default: '9876543210' },
  address:             { type: String, default: '' },
  shopLatitude:        { type: Number, default: 28.6139 },
  shopLongitude:       { type: Number, default: 77.209 },
  upiId:               { type: String, default: '6394746719@kotak' },
  accountName:         { type: String, default: '' },
  qrImage:             { type: String, default: '' },
  logoImage:           { type: String, default: '' },
  workingHours:        { type: String, default: '9:00 AM - 9:00 PM' },
  maxDeliveryDistance: { type: Number, default: 10 },
  trafficBufferMinutes:{ type: Number, default: 0 },
  maintenanceMode:     { type: Boolean, default: false },
  holidayNotice:       { type: String, default: '' },
  announcementBanner:  { type: String, default: '' },
  // New business-critical fields
  jarDepositAmount:    { type: Number, default: 150 },
  codEnabled:          { type: Boolean, default: true },
  payLaterEnabled:     { type: Boolean, default: false },
  paymentInstructions: { type: String, default: 'Scan QR or pay to UPI ID. Upload screenshot after payment.' },
}, { timestamps: true });
module.exports = mongoose.model('Settings', settingsSchema);
