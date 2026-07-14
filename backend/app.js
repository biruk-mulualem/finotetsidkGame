// backend/app.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();

// Debug: Check if env loaded
console.log("=== ENVIRONMENT VARIABLES ===");
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES" : "NO");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("===============================");

// ============================================================================
// CREATE ALL UPLOADS DIRECTORY IF NOT EXISTS
// ============================================================================
const uploadDirs = [
  // Profile pictures
  "uploads/profiles",
  
  // Document categories
  "uploads/documents/national_id",
  "uploads/documents/spouse",
  "uploads/documents/children",
  "uploads/documents/education",
  "uploads/documents/training",
  "uploads/documents/work_experience",
  "uploads/documents/guarantees",
  "uploads/documents/parent_support",
  "uploads/documents/nationality",
  "uploads/documents/health",
  "uploads/documents/legal",
  "uploads/documents/id_cards",
  "uploads/documents/cv_resumes",
  "uploads/documents/degrees",
  
  // Attendance
  "uploads/attendance/",
  
  // Items
  "uploads/items/specifications",
  
  // Store Balance
  "uploads/balances/",
  "uploads/balances/imports",
  "uploads/balances/exports",
  
  // ============================================
  // GAME QUESTIONS - IMAGE AND AUDIO
  // ============================================
  "uploads/questions/images",
  "uploads/questions/audio",
  "uploads/questions/temp",
  
  // Temp
  "uploads/temp/"
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// ============================================================================
// IMPORT MODELS
// ============================================================================
const { sequelize } = require("./models");

// ============================================================================
// IMPORT ROUTES
// ============================================================================
const gameRoutes = require("./routes/gameRoutes");
const teamRoutes = require('./routes/teamRoutes');
const questionRoutes = require('./routes/questionRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // NEW: Upload routes

// ============================================================================
// CORS CONFIGURATION
// ============================================================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));

app.options('*', cors());

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`📤 ${req.method} ${req.url}`);
  next();
});

// ============================================================================
// STATIC FILES
// ============================================================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      success: true,
      message: "Server is running",
      database: "Connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ============================================================================
// ROUTES
// ============================================================================
app.use('/api/questions', questionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/upload', uploadRoutes); // NEW: Upload routes
app.use("/api", gameRoutes);

// ============================================================================
// 404 HANDLER
// ============================================================================
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.url}`,
  });
});

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File too large. Max size is 5MB.",
    });
  }

  if (err.message && err.message.includes("Only image files")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err.message && err.message.includes("Only audio files")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err.message && err.message.includes("Only PDF, DOC, DOCX")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry found',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record not found',
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================================
// START CRON JOBS
// ============================================================================
if (process.env.NODE_ENV !== "test") {
  try {
    const { startAttendanceJobs } = require("./jobs");
    startAttendanceJobs();
  } catch (error) {
    console.error("Failed to start cron jobs:", error.message);
  }
}

module.exports = app;