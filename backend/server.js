const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for Multer
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'NexCart E-Commerce API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Route Handlers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/pincode', require('./routes/pincodeRoutes'));
app.use('/api/qa', require('./routes/qaRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/stock-alert', require('./routes/stockAlertRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Custom Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 NexCart Backend Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});
