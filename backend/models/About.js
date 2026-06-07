import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: [{ type: String }], // Array of titles for typewriter animation
  bio: { type: String, required: true }, // About section biography
  heroBio: { type: String }, // Hero section description
  avatarUrl: { type: String }, // Hero section avatar
  aboutAvatarUrl: { type: String }, // About section avatar
  resumeUrl: { type: String },
  socialLinks: {
    github: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    email: { type: String }
  },
  location: { type: String }
}, { timestamps: true });

export default mongoose.model('About', AboutSchema);
