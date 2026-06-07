import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadsDir = path.join(__dirname, '../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Multer in-memory storage (we handle the upload ourselves depending on Cloudinary configuration)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp, gif) and PDFs are allowed!'));
  }
});

// Configure Cloudinary if credentials are provided
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const configureCloudinary = () => {
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
};


// @route   GET /api/upload/health
// @desc    Check if Cloudinary settings are active
// @access  Private
router.get('/health', auth, (req, res) => {
  const configured = isCloudinaryConfigured();
  if (configured) {
    configureCloudinary();
  }
  res.json({
    cloudinaryConfigured: configured,
    message: configured 
      ? 'Cloudinary API is fully configured and ready.' 
      : 'Cloudinary is not configured. Falling back to local server folder storage.'
  });
});

// @route   POST /api/upload
// @desc    Upload an image or document (with local fallback)
// @access  Private
router.post('/', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const file = req.file;

  try {
    // Check if Cloudinary is configured
    if (isCloudinaryConfigured()) {
      configureCloudinary();
      // Upload to Cloudinary using stream
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'portfolio',
              resource_type: isPdf ? 'raw' : 'auto'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
      };

      const result = await uploadStream();
      return res.json({
        url: result.secure_url,
        publicId: result.public_id,
        source: 'cloudinary'
      });
    } else {
      // Fallback: Upload to local server directory
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const filename = file.fieldname + '-' + uniqueSuffix + ext;
      const localFilePath = path.join(localUploadsDir, filename);

      // Write file buffer to local disk
      fs.writeFileSync(localFilePath, file.buffer);

      // Return local server path relative to the root
      // The frontend will prepend the server address if needed
      const relativeUrl = `/uploads/${filename}`;

      return res.json({
        url: relativeUrl,
        filename,
        source: 'local'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed.', error: error.message });
  }
});

export default router;
