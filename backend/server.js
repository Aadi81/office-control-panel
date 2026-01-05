// backend/server.js - COMPLETE FIX
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeSocket } = require('./utils/socket');
const mongoose = require("mongoose");


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ FIX 1: Increase all timeouts
server.timeout = 600000; // 10 minutes
server.keepAliveTimeout = 610000; // 10 minutes + 10 seconds
server.headersTimeout = 620000; // 10 minutes + 20 seconds

const io = initializeSocket(server);

// ✅ FIX 2: CORS with credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ FIX 3: Increase body limits
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ✅ FIX 4: Disable default timeout middleware
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/master', require('./routes/master'));
app.use('/api/upload', require('./routes/upload'));

// ===== HEALTH CHECK =====

// API Health
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "OK",
    service: "Office Control Panel Backend",
    uptime: process.uptime(),
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development"
  });
});

// MongoDB Health
app.get("/api/health-db", (req, res) => {
  try {
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];

    return res.status(200).json({
      status: "OK",
      api: "Running",
      database: states[mongoose.connection.readyState],
      uptime: process.uptime(),
      timestamp: new Date()
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Database Health Failed"
    });
  }
});


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Office Control Panel API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});






const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   🚀 Office Control Panel Server Running              ║
║   📡 Server: http://localhost:${PORT}                   ║
║   🗄️  Database: MongoDB Atlas Connected                ║
║   🔌 Socket.io: Real-time Sync Active                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
╚════════════════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;


































