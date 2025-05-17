const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Set up multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed!'));
  }
}).single('image');

// Upload image to local storage
exports.uploadImage = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }
    
    try {
      // Generate URL for the uploaded file
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const filePath = `/uploads/images/${req.file.filename}`;
      const fileUrl = `${baseUrl}${filePath}`;
      
      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: fileUrl,
        fileName: req.file.filename,
        originalName: req.file.originalname
      });
    } catch (error) {
      console.error('Error processing upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during upload'
      });
    }
  });
};

// Get all uploaded images (optional)
exports.getImages = (req, res) => {
  const uploadDir = path.join(__dirname, '../../uploads/images');
  
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading image directory:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to read images directory'
      });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const images = files.map(file => ({
      name: file,
      url: `${baseUrl}/uploads/images/${file}`
    }));
    
    return res.status(200).json({
      success: true,
      images
    });
  });
};

// Delete an image (optional)
exports.deleteImage = (req, res) => {
  const { filename } = req.params;
  
  if (!filename) {
    return res.status(400).json({
      success: false,
      message: 'Filename is required'
    });
  }
  
  const filePath = path.join(__dirname, '../../uploads/images', filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(404).json({
        success: false,
        message: 'Image not found or could not be deleted'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  });
}; 