require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const designRoutes = require('./routes/designs');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const postRoutes = require('./routes/posts');
const refundRoutes = require('./routes/refunds');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

// Connect to DB
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Passport
require('./config/passport');
app.use(passport.initialize());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CustomFlex API is running 🚀', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Stripe webhook (raw body needed)
app.use('/api/webhook', express.raw({ type: 'application/json' }));
const webhookRoute = require('./routes/webhook');
app.use('/api/webhook', webhookRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

// Cron job: Check refund eligibility every hour
cron.schedule('0 * * * *', async () => {
  const { checkRefundEligibility } = require('./utils/refundChecker');
  await checkRefundEligibility();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CustomFlex API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
// Trigger nodemon env reload 2

