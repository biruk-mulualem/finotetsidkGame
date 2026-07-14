// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// ENSURE UPLOAD DIRECTORY EXISTS
// ============================================
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ============================================
// IMAGE STORAGE CONFIGURATION
// ============================================
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/questions/images/';
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `question-image-${baseName}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// ============================================
// AUDIO STORAGE CONFIGURATION
// ============================================
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/questions/audio/';
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `question-audio-${baseName}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// ============================================
// FILE FILTERS
// ============================================
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'));
  }
};

const audioFileFilter = (req, file, cb) => {
  const allowedTypes = /mp3|wav|ogg|m4a|aac|flac/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed (mp3, wav, ogg, m4a, aac, flac)'));
  }
};

// ============================================
// UPLOAD MIDDLEWARE
// ============================================
const uploadImage = multer({
  storage: imageStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: imageFileFilter
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { 
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: audioFileFilter
});

// ============================================
// HELPER: Get base URL
// ============================================
const getBaseUrl = (req) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

// ============================================
// ROUTES
// ============================================

// Upload a single image
router.post('/image', uploadImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }
    
    const baseUrl = getBaseUrl(req);
    const filePath = `/uploads/questions/images/${req.file.filename}`;
    const fullUrl = `${baseUrl}${filePath}`;
    
    console.log('✅ Image uploaded:', fullUrl);
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fullUrl, // Full URL for frontend
        path: filePath, // Relative path for storage
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload audio file
router.post('/audio', uploadAudio.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded'
      });
    }
    
    const baseUrl = getBaseUrl(req);
    const filePath = `/uploads/questions/audio/${req.file.filename}`;
    const fullUrl = `${baseUrl}${filePath}`;
    
    console.log('✅ Audio uploaded:', fullUrl);
    
    res.json({
      success: true,
      message: 'Audio uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fullUrl, // Full URL for frontend
        path: filePath, // Relative path for storage
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete uploaded file
router.delete('/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    let filePath;
    if (type === 'image') {
      filePath = path.join(__dirname, '../uploads/questions/images', filename);
    } else if (type === 'audio') {
      filePath = path.join(__dirname, '../uploads/questions/audio', filename);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Use "image" or "audio"'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;