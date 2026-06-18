const express = require('express');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Products
const productRouter = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleProduct } = require('../controllers/productController');
productRouter.get('/', optionalAuth, getProducts);
productRouter.get('/:id', optionalAuth, getProduct);
productRouter.post('/', protect, adminOnly, upload.single('image'), createProduct);
productRouter.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
productRouter.delete('/:id', protect, adminOnly, deleteProduct);
productRouter.patch('/:id/toggle', protect, adminOnly, toggleProduct);

// Categories
const categoryRouter = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
categoryRouter.get('/', optionalAuth, getCategories);
categoryRouter.post('/', protect, adminOnly, createCategory);
categoryRouter.put('/:id', protect, adminOnly, updateCategory);
categoryRouter.delete('/:id', protect, adminOnly, deleteCategory);

// Pricing
const pricingRouter = express.Router();
const { getRules, createRule, updateRule, deleteRule, calculateDelivery } = require('../controllers/pricingController');
pricingRouter.get('/rules', getRules);
pricingRouter.post('/rules', protect, adminOnly, createRule);
pricingRouter.put('/rules/:id', protect, adminOnly, updateRule);
pricingRouter.delete('/rules/:id', protect, adminOnly, deleteRule);
pricingRouter.post('/calculate', calculateDelivery);

// Service Areas
const serviceAreaRouter = express.Router();
const { getServiceAreas, createServiceArea, updateServiceArea, deleteServiceArea, checkServiceArea } = require('../controllers/serviceAreaController');
serviceAreaRouter.get('/', getServiceAreas);
serviceAreaRouter.post('/', protect, adminOnly, createServiceArea);
serviceAreaRouter.put('/:id', protect, adminOnly, updateServiceArea);
serviceAreaRouter.delete('/:id', protect, adminOnly, deleteServiceArea);
serviceAreaRouter.post('/check', checkServiceArea);

// Time Slots
const timeSlotRouter = express.Router();
const { getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } = require('../controllers/timeSlotController');
timeSlotRouter.get('/', optionalAuth, getTimeSlots);
timeSlotRouter.post('/', protect, adminOnly, createTimeSlot);
timeSlotRouter.put('/:id', protect, adminOnly, updateTimeSlot);
timeSlotRouter.delete('/:id', protect, adminOnly, deleteTimeSlot);

// Orders
const orderRouter = express.Router();
const { createOrder, getMyOrders, getAllOrders, getOrder, updateOrderStatus, updatePaymentStatus, reorder } = require('../controllers/orderController');
orderRouter.post('/', protect, createOrder);
orderRouter.get('/my', protect, getMyOrders);
orderRouter.get('/', protect, adminOnly, getAllOrders);
orderRouter.get('/:id', protect, getOrder);
orderRouter.patch('/:id/status', protect, adminOnly, updateOrderStatus);
orderRouter.patch('/:id/payment-status', protect, adminOnly, updatePaymentStatus);
orderRouter.post('/:id/reorder', protect, reorder);

// Payments
const paymentRouter = express.Router();
const { submitProof, getMyPayments, getAllPayments, approvePayment, rejectPayment, partialPayment, markCashReceived } = require('../controllers/paymentController');
paymentRouter.post('/proof', protect, upload.single('screenshot'), submitProof);
paymentRouter.get('/my', protect, getMyPayments);
paymentRouter.get('/', protect, adminOnly, getAllPayments);
paymentRouter.patch('/:id/approve', protect, adminOnly, approvePayment);
paymentRouter.patch('/:id/reject', protect, adminOnly, rejectPayment);
paymentRouter.patch('/:id/partial', protect, adminOnly, partialPayment);
paymentRouter.patch('/order/:id/cash-received', protect, adminOnly, markCashReceived);

// Bills
const billRouter = express.Router();
const { generateBill, getMyBills, getAllBills, getBill, markBillPaid } = require('../controllers/billController');
billRouter.post('/generate', protect, adminOnly, generateBill);
billRouter.get('/my', protect, getMyBills);
billRouter.get('/', protect, adminOnly, getAllBills);
billRouter.get('/:id', protect, getBill);
billRouter.patch('/:id/mark-paid', protect, adminOnly, markBillPaid);

// Jars
const jarRouter = express.Router();
const { getMyJars, getAllJars, addJarEntry, getJarSummary, updateJarEntry, requestJarReturn } = require('../controllers/jarController');
jarRouter.get('/my', protect, getMyJars);
jarRouter.post('/return-request', protect, requestJarReturn);
jarRouter.get('/', protect, adminOnly, getAllJars);
jarRouter.post('/', protect, adminOnly, addJarEntry);
jarRouter.get('/summary/:userId', protect, adminOnly, getJarSummary);
jarRouter.patch('/:id', protect, adminOnly, updateJarEntry);

// Subscriptions
const subscriptionRouter = express.Router();
const { createSubscription, getMySubscriptions, getAllSubscriptions, pauseSubscription, resumeSubscription, skipDelivery, updateSubscription, processDue } = require('../controllers/subscriptionController');
subscriptionRouter.post('/', protect, createSubscription);
subscriptionRouter.get('/my', protect, getMySubscriptions);
subscriptionRouter.get('/', protect, adminOnly, getAllSubscriptions);
subscriptionRouter.patch('/:id/pause', protect, pauseSubscription);
subscriptionRouter.patch('/:id/resume', protect, resumeSubscription);
subscriptionRouter.patch('/:id/skip', protect, skipDelivery);
subscriptionRouter.patch('/:id', protect, updateSubscription);
subscriptionRouter.post('/process-due', protect, adminOnly, processDue);

// Events
const eventRouter = express.Router();
const {
  createEvent, getMyEvents, getMyEvent, getAllEvents, getEvent,
  updateQuote, respondToQuote, acceptQuote, rejectQuote, updateStatus,
} = require('../controllers/eventController');
eventRouter.post('/', protect, createEvent);
eventRouter.get('/my', protect, getMyEvents);
eventRouter.get('/my/:id', protect, getMyEvent);
eventRouter.patch('/:id/quote-response', protect, respondToQuote);
eventRouter.patch('/:id/quote/accept', protect, acceptQuote);
eventRouter.patch('/:id/quote/reject', protect, rejectQuote);
eventRouter.get('/', protect, adminOnly, getAllEvents);
eventRouter.get('/:id', protect, adminOnly, getEvent);
eventRouter.patch('/:id/quote', protect, adminOnly, updateQuote);
eventRouter.patch('/:id/status', protect, adminOnly, updateStatus);

// Notifications
const notificationRouter = express.Router();
const { getNotifications, getUnreadCount, markRead, markAllRead, sendAnnouncement } = require('../controllers/notificationController');
notificationRouter.get('/', protect, getNotifications);
notificationRouter.get('/unread-count', protect, getUnreadCount);
notificationRouter.patch('/read-all', protect, markAllRead);
notificationRouter.patch('/:id/read', protect, markRead);
notificationRouter.post('/admin-announcement', protect, adminOnly, sendAnnouncement);

// Settings
const settingsRouter = express.Router();
const { getPublicSettings, getSettings, updateSettings, uploadQR, uploadLogo } = require('../controllers/settingsController');
settingsRouter.get('/public', getPublicSettings);
settingsRouter.get('/', protect, adminOnly, getSettings);
settingsRouter.put('/', protect, adminOnly, updateSettings);
settingsRouter.post('/upload-qr', protect, adminOnly, upload.single('qr'), uploadQR);
settingsRouter.post('/upload-logo', protect, adminOnly, upload.single('logo'), uploadLogo);

// Reports
const reportRouter = express.Router();
const { getDashboard, getSalesReport, getProductsReport, getCustomersReport, getPaymentsReport, getJarsReport } = require('../controllers/reportController');
reportRouter.get('/dashboard', protect, adminOnly, getDashboard);
reportRouter.get('/sales', protect, adminOnly, getSalesReport);
reportRouter.get('/products', protect, adminOnly, getProductsReport);
reportRouter.get('/customers', protect, adminOnly, getCustomersReport);
reportRouter.get('/payments', protect, adminOnly, getPaymentsReport);
reportRouter.get('/jars', protect, adminOnly, getJarsReport);

// Coupons
const couponRouter = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');
couponRouter.get('/', protect, adminOnly, getCoupons);
couponRouter.post('/', protect, adminOnly, createCoupon);
couponRouter.put('/:id', protect, adminOnly, updateCoupon);
couponRouter.delete('/:id', protect, adminOnly, deleteCoupon);
couponRouter.post('/validate', validateCoupon);

// Customers & Addresses
const customerRouter = express.Router();
const { getAllCustomers, getCustomer, toggleCustomer, getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/customerController');
customerRouter.get('/', protect, adminOnly, getAllCustomers);
customerRouter.get('/addresses', protect, getAddresses);
customerRouter.post('/addresses', protect, addAddress);
customerRouter.put('/addresses/:id', protect, updateAddress);
customerRouter.delete('/addresses/:id', protect, deleteAddress);
customerRouter.get('/:id', protect, adminOnly, getCustomer);
customerRouter.patch('/:id/toggle', protect, adminOnly, toggleCustomer);
customerRouter.patch('/:id/pay-later', protect, adminOnly, async (req, res) => {
  const User = require('../models/User');
  const user = await User.findByIdAndUpdate(req.params.id, { allowPayLater: req.body.allowPayLater }, { new: true }).select('-password');
  res.json(user);
});

// Export
const exportRouter = express.Router();
const { exportCustomers, exportOrders, exportPayments } = require('../controllers/exportController');
exportRouter.get('/customers', protect, adminOnly, exportCustomers);
exportRouter.get('/orders', protect, adminOnly, exportOrders);
exportRouter.get('/payments', protect, adminOnly, exportPayments);

// Activity Logs
const logRouter = express.Router();
const { getLogs } = require('../controllers/activityLogController');
logRouter.get('/', protect, adminOnly, getLogs);

// Messages
const messageRouter = express.Router();
const {
  getMyMessages,
  getAllMessages,
  getUnreadCount: getMessageUnreadCount,
  sendCustomerMessage,
  sendAdminMessage,
  markMessageRead,
  markAllMessagesRead,
} = require('../controllers/messageController');
messageRouter.get('/my', protect, getMyMessages);
messageRouter.get('/unread-count', protect, getMessageUnreadCount);
messageRouter.get('/', protect, adminOnly, getAllMessages);
messageRouter.post('/customer', protect, sendCustomerMessage);
messageRouter.post('/admin', protect, adminOnly, sendAdminMessage);
messageRouter.patch('/read-all', protect, markAllMessagesRead);
messageRouter.patch('/:id/read', protect, markMessageRead);

module.exports = {
  productRouter, categoryRouter, pricingRouter, timeSlotRouter, orderRouter,
  paymentRouter, billRouter, jarRouter, subscriptionRouter, eventRouter,
  notificationRouter, settingsRouter, reportRouter, couponRouter,
  customerRouter, exportRouter, logRouter, serviceAreaRouter,
  messageRouter,
};
