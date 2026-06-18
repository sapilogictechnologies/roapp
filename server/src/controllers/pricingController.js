const PricingRule = require('../models/PricingRule');
const ServiceArea = require('../models/ServiceArea');
const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const { haversineDistance } = require('../utils/haversine');

exports.getRules = asyncHandler(async (req, res) => {
  const rules = await PricingRule.find().sort({ minDistance: 1 }).lean();
  res.json(rules);
});

exports.createRule = asyncHandler(async (req, res) => {
  const rule = await PricingRule.create(req.body);
  res.status(201).json(rule);
});

exports.updateRule = asyncHandler(async (req, res) => {
  const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!rule) return res.status(404).json({ message: 'Rule not found' });
  res.json(rule);
});

exports.deleteRule = asyncHandler(async (req, res) => {
  await PricingRule.findByIdAndDelete(req.params.id);
  res.json({ message: 'Rule deleted' });
});

exports.calculateDelivery = asyncHandler(async (req, res) => {
  const { latitude, longitude, pincode, locationSource } = req.body;

  // GPS/coordinate-based
  if ((locationSource === 'gps' || (!pincode && latitude && longitude))) {
    if (!latitude || !longitude) return res.status(400).json({ message: 'Coordinates required' });
    const settings = await Settings.findOne().lean();
    if (!settings) return res.status(400).json({ message: 'Settings not configured' });

    const distanceKm = haversineDistance(settings.shopLatitude, settings.shopLongitude, latitude, longitude);

    if (distanceKm > (settings.maxDeliveryDistance || 10)) {
      return res.json({ isServiceable: false, message: `Outside delivery range (${distanceKm.toFixed(1)} km)`, distanceKm: parseFloat(distanceKm.toFixed(2)) });
    }

    const rule = await PricingRule.findOne({ minDistance: { $lte: distanceKm }, maxDistance: { $gte: distanceKm }, isActive: true }).lean();
    if (!rule) return res.json({ isServiceable: false, message: 'No pricing rule for this distance', distanceKm: parseFloat(distanceKm.toFixed(2)) });

    const etaMinutes = rule.etaMinutes + (settings.trafficBufferMinutes || 0);
    return res.json({
      isServiceable: true,
      locationSource: 'gps',
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      deliveryFee: rule.deliveryFee,
      minimumOrder: rule.minimumOrder,
      etaMinutes,
      message: `Delivery available in ~${etaMinutes} minutes`,
    });
  }

  // Pincode-based fallback
  if (pincode) {
    const area = await ServiceArea.findOne({ pincode: pincode.trim(), isServiceable: true }).lean();
    if (!area) return res.json({ isServiceable: false, message: `Delivery not available for pincode ${pincode}` });
    return res.json({
      isServiceable: true,
      locationSource: 'pincode',
      pincode: area.pincode,
      areaName: area.areaName,
      city: area.city,
      deliveryFee: area.deliveryFee,
      minimumOrder: area.minimumOrder,
      etaMinutes: area.etaMinutes,
      message: `Delivery available to ${area.areaName}! Fee: ₹${area.deliveryFee}`,
    });
  }

  res.status(400).json({ message: 'Provide coordinates or pincode' });
});
