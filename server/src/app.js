const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const {
  productRouter, categoryRouter, pricingRouter, timeSlotRouter, orderRouter,
  paymentRouter, billRouter, jarRouter, subscriptionRouter, eventRouter,
  notificationRouter, settingsRouter, reportRouter, couponRouter,
  customerRouter, exportRouter, logRouter, serviceAreaRouter,
  messageRouter,
} = require('./routes/index');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    if (process.env.NODE_ENV === 'development' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: 'Too many requests' });
app.use('/api/', limiter);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Serve uploaded files
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'src/uploads');
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/service-areas', serviceAreaRouter);
app.use('/api/time-slots', timeSlotRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/bills', billRouter);
app.use('/api/jars', jarRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/events', eventRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reports', reportRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/customers', customerRouter);
app.use('/api/export', exportRouter);
app.use('/api/logs', logRouter);
app.use('/api/messages', messageRouter);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'OK', timestamp: new Date() }));

app.use(errorMiddleware);

module.exports = app;
