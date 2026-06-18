const ServiceArea = require('../models/ServiceArea');
const asyncHandler = require('../utils/asyncHandler');

exports.getServiceAreas = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.$or = [{ pincode: { $regex: search, $options: 'i' } }, { areaName: { $regex: search, $options: 'i' } }];
  const areas = await ServiceArea.find(filter).sort({ pincode: 1 }).lean();
  res.json(areas);
});

exports.createServiceArea = asyncHandler(async (req, res) => {
  const area = await ServiceArea.create(req.body);
  res.status(201).json(area);
});

exports.updateServiceArea = asyncHandler(async (req, res) => {
  const area = await ServiceArea.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!area) return res.status(404).json({ message: 'Service area not found' });
  res.json(area);
});

exports.deleteServiceArea = asyncHandler(async (req, res) => {
  await ServiceArea.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

exports.checkServiceArea = asyncHandler(async (req, res) => {
  const { pincode } = req.body;
  if (!pincode) return res.status(400).json({ message: 'Pincode required' });
  const area = await ServiceArea.findOne({ pincode: pincode.trim(), isServiceable: true }).lean();
  if (!area) return res.json({ isServiceable: false, message: `Delivery not available for pincode ${pincode}` });
  res.json({
    isServiceable: true,
    areaName: area.areaName,
    pincode: area.pincode,
    city: area.city,
    deliveryFee: area.deliveryFee,
    minimumOrder: area.minimumOrder,
    etaMinutes: area.etaMinutes,
    message: `Delivery available! Fee: ₹${area.deliveryFee}, Min order: ₹${area.minimumOrder}, ETA: ~${area.etaMinutes} min`,
  });
});
