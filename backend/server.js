import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Normalize both incoming origin and allowed origins to compare without trailing slashes
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = corsOrigins.some(allowed => {
      const normalizedAllowed = allowed.trim().replace(/\/$/, '');
      return normalizedAllowed === '*' || normalizedAllowed === normalizedOrigin;
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Map route middleware
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Database Connection
const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
mongoose.connect(mongodbUri)
  .then(() => console.log('MongoDB Connected Successfully.'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    console.log('Ensure MongoDB is installed and running, or verify your MONGODB_URI in the .env file.');
  });

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowed origins:`, corsOrigins);
});
