const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
require('express-async-errors');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://civictrack-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
  if (err.code === 11000) return res.status(400).json({ message: 'Email already registered' });
  res.status(500).json({ message: 'Internal server error' });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected — reconnecting...');
  setTimeout(connectDB, 3000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
});

connectDB();

const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;