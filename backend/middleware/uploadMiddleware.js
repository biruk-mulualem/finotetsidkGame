const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ============================================================================
// CREATE ALL REQUIRED DIRECTORIES
// ============================================================================
const createDirectories = () => {
  const dirs = [
    // Profile pictures
    'uploads/profiles',
    
    // Document categories
    'uploads/documents/national_id',
    'uploads/documents/spouse',
    'uploads/documents/children',
    'uploads/documents/education',
    'uploads/documents/training',
    'uploads/documents/work_experience',
    'uploads/documents/guarantees',
    'uploads/documents/parent_support',
    'uploads/documents/nationality',
    'uploads/documents/health',
    'uploads/documents/legal',
    'uploads/documents/contracts',
    'uploads/documents/performance',
    
    // Attendance
    'uploads/attendance/',
    
    // Item specifications
    'uploads/items/specifications',
    
    // ============================================
    // STORE BALANCE - ADD THESE DIRECTORIES
    // ============================================
    'uploads/balances/',
    'uploads/balances/imports',
    'uploads/balances/exports',
  ];
  dirs.forEach(dir => ensureDirectoryExists(dir));
};
createDirectories();

// ============================================================================
// STORE BALANCE - IMPORT STORAGE
// ============================================================================
const balanceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/balances/imports/';
    ensureDirectoryExists(dir);
    console.log('💾 Balance import destination:', dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `balance-import-${sanitizedName}-${uniqueSuffix}${ext}`;
    console.log('📄 Balance import filename:', filename);
    cb(null, filename);
  }
});

// ============================================================================
// STORE BALANCE - FILE FILTER
// ============================================================================
const balanceFileFilter = (req, file, cb) => {
  const allowedTypes = /csv|xlsx|xls/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed (.csv, .xlsx, .xls)'));
  }
};

// ============================================================================
// STORE BALANCE - UPLOAD INSTANCE
// ============================================================================
const uploadBalance = multer({
  storage: balanceStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: balanceFileFilter
});

// ============================================================================
// STORE BALANCE - MIDDLEWARE
// ============================================================================
const uploadSingleBalance = (req, res, next) => {
  console.log('=== uploadSingleBalance called ===');
  uploadBalance.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer balance error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
          return res.status(400).json({
            success: false,
            error: 'File too large. Maximum size is 10MB.'
          });
        }
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    console.log('✅ File uploaded:', req.file.filename);
    console.log('📊 File size:', req.file.size);
    console.log('📁 File path:', req.file.path);
    
    next();
  });
};

// ============================================================================
// HELPER: Get document folder based on type
// ============================================================================
const getDocumentFolder = (documentType, subType = null) => {
  // Profile pictures are handled separately
  if (documentType === 'profile_picture') {
    return null;
  }
  
  // Item specifications
  if (documentType === 'item_specification') {
    return 'items/specifications';
  }
  
  // Store balance imports
  if (documentType === 'balance_import') {
    return 'balances/imports';
  }
  
  const folders = {
    // Identity Documents
    'national_id': 'national_id',
    'id_card': 'national_id',
    'passport': 'national_id',
    
    // Spouse documents
    'spouse_profile': 'spouse',
    'marriage_certificate': 'spouse',
    
    // Child documents
    'child_birth_certificate': 'children',
    'child_medical_report': 'children',
    'child_adoption_certificate': 'children',
    'child_profile': 'children',
    
    // Education
    'education_certificate': 'education',
    'degree': 'education',
    'certificate': 'education',
    'cv': 'education',
    'resume': 'education',
    
    // Training
    'training_certificate': 'training',
    
    // Work Experience
    'experience_letter': 'work_experience',
    
    // Guarantee
    'guarantee_letter': 'guarantees',
    'sdt_letter': 'guarantees',
    'guarantee_other': 'guarantees',
    
    // Parent Support
    'parent_support_document': 'parent_support',
    
    // Nationality
    'naturalization_certificate': 'nationality',
    
    // Health & Legal
    'health_document': 'health',
    'legal_document': 'legal',
    
    // Contracts & Performance
    'contract': 'contracts',
    'performance-review': 'performance'
  };
  
  const folder = folders[documentType];
  if (!folder) {
    console.warn(`Unknown document type: ${documentType}, using 'others'`);
    return 'others';
  }
  
  return folder;
};

// ============================================================================
// PROFILE PICTURE STORAGE
// ============================================================================
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles/';
    ensureDirectoryExists(dir);
    console.log('💾 Profile destination:', dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const employeeId = req.params.id;
    const ext = path.extname(file.originalname);
    const filename = `${employeeId}-profile-${Date.now()}${ext}`;
    console.log('📄 Profile filename:', filename);
    cb(null, filename);
  }
});

// ============================================================================
// ITEM SPECIFICATION STORAGE
// ============================================================================
const itemSpecStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/items/specifications/';
    ensureDirectoryExists(dir);
    console.log('💾 Item spec destination:', dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const itemId = req.params.id || req.params.itemId;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `spec_${itemId}_${sanitizedName}_${Date.now()}${ext}`;
    console.log('📄 Item spec filename:', filename);
    cb(null, filename);
  }
});

// ============================================================================
// DOCUMENT STORAGE - DYNAMIC BASED ON TYPE
// ============================================================================
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentType = req.params.type;
    
    console.log('📍 documentStorage.destination - Type:', documentType);
    
    if (documentType === 'profile_picture') {
      console.error('❌ ERROR: profile_picture reached documentStorage!');
      return cb(new Error('Profile pictures should use profile storage, not document storage'), null);
    }
    
    const folder = getDocumentFolder(documentType);
    
    if (!folder || folder === 'others') {
      console.warn(`⚠️ Unknown document type: ${documentType}, using 'others'`);
    }
    
    const dir = `uploads/documents/${folder || 'others'}/`;
    ensureDirectoryExists(dir);
    console.log(`💾 Saving to: ${dir}`);
    cb(null, dir);
  },
  filename: async (req, file, cb) => {
    const { Employee } = require('../models');
    const employeeId = req.params.id;
    
    let employeeCode = `EMP${employeeId}`;
    try {
      const employee = await Employee.findByPk(employeeId);
      if (employee && employee.employeeCode) {
        employeeCode = employee.employeeCode;
      }
    } catch (err) {
      console.error('Error fetching employee code:', err);
    }
    
    const documentType = req.params.type;
    const index = req.body.index || '';
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    
    let filename = `${employeeCode}-${documentType}`;
    if (index !== '') filename += `-${index}`;
    filename += `-${timestamp}${ext}`;
    
    console.log('📄 Generated filename:', filename);
    
    cb(null, filename);
  }
});

// ============================================================================
// FILE FILTERS
// ============================================================================
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, XLS, XLSX, and image files are allowed'));
  }
};

// Specific filter for profile pictures (only images)
const profileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures'));
  }
};

// Filter for item specifications (only PDF)
const itemSpecFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for item specifications'));
  }
};

// Filter for legal/important documents (only PDF)
const legalDocumentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for legal documents'));
  }
};

// ============================================================================
// UPLOAD CONFIGURATIONS
// ============================================================================
const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: profileFilter
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: documentFilter
});

const uploadLegalDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: legalDocumentFilter
});

// ============================================================================
// ITEM SPECIFICATION UPLOAD CONFIG
// ============================================================================
const uploadItemSpecification = multer({
  storage: itemSpecStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: itemSpecFilter
});

// ============================================================================
// ATTENDANCE IMPORT STORAGE
// ============================================================================
const attendanceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/attendance/';
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attendance-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const attendanceFileFilter = (req, file, cb) => {
  const allowedTypes = /csv|xlsx|xls/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed (.csv, .xlsx, .xls)'));
  }
};

const uploadAttendance = multer({
  storage: attendanceStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: attendanceFileFilter
});

// ============================================================================
// MIDDLEWARE EXPORTS
// ============================================================================
const uploadSingleProfile = (req, res, next) => {
  console.log('=== uploadSingleProfile called ===');
  uploadProfile.single('profilePicture')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

const uploadSingleDocument = (req, res, next) => {
  uploadDocument.single('document')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

const uploadMultipleDocuments = (req, res, next) => {
  uploadDocument.array('documents', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

const uploadSingleAttendance = (req, res, next) => {
  uploadAttendance.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// ============================================================================
// ITEM SPECIFICATION UPLOAD MIDDLEWARE
// ============================================================================
const uploadItemSpec = (req, res, next) => {
  console.log('=== uploadItemSpec called ===');
  uploadItemSpecification.single('specification')(req, res, (err) => {
    if (err) {
      console.error('Multer item spec error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// Generic upload handler that accepts document type from request body
const uploadDynamicDocument = (req, res, next) => {
  const documentType = req.params.type;
  
  console.log('🔄 uploadDynamicDocument - Type from params:', documentType);
  
  if (!documentType) {
    return res.status(400).json({ 
      success: false, 
      error: 'Document type is required in the URL' 
    });
  }
  
  // ✅ PROFILE PICTURES - MUST use uploadProfile FIRST
  if (documentType === 'profile_picture') {
    console.log('📸 Routing to uploadProfile for profile picture');
    return uploadProfile.single('file')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer profile error:', err);
        return res.status(400).json({ success: false, error: err.message });
      }
      console.log('✅ Profile picture processed, file:', req.file?.filename);
      next();
    });
  } 
  // ✅ LEGAL DOCUMENTS
  else if (documentType === 'naturalization_certificate' || 
           documentType === 'legal_document' ||
           documentType === 'contract' ||
           documentType === 'performance-review') {
    console.log('⚖️ Routing to uploadLegalDocument');
    return uploadLegalDocument.single('file')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer legal error:', err);
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  } 
  // ✅ REGULAR DOCUMENTS
  else {
    console.log('📄 Routing to uploadDocument');
    return uploadDocument.single('file')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer document error:', err);
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  }
};

// ============================================================================
// EXPORT ALL
// ============================================================================
module.exports = {
  // Main upload handlers
  uploadSingleProfile,
  uploadSingleDocument,
  uploadMultipleDocuments,
  uploadSingleAttendance,
  uploadAttendance,
  uploadDynamicDocument,
  
  // Item specification upload
  uploadItemSpec,
  
  // Store Balance upload
  uploadSingleBalance,
  uploadBalance,
  
  // Raw multer instances (for advanced use)
  uploadProfile,
  uploadDocument,
  uploadLegalDocument,
  uploadItemSpecification,
  
  // Utilities
  getDocumentFolder,
  ensureDirectoryExists
};