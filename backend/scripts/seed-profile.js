import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import About from '../models/About.js';

// Load environmental config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedProfile = async () => {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

  try {
    console.log(`Connecting to database to seed/update profile...`);
    await mongoose.connect(mongodbUri);
    console.log('Database connected.');

    // Look for an existing profile
    let profile = await About.findOne();

    if (profile) {
      console.log('Profile already exists. Updating details to HoneySai K...');
      profile.name = 'HoneySai K';
      profile.title = ['Full-Stack Engineer', 'UI/UX Designer', 'MERN Developer'];
      
      // Update bio if it doesn't match default or contains Narsimulu references
      if (!profile.bio || profile.bio.includes('Narsimulu')) {
        profile.bio = 'Passionate software engineer focused on building elegant, high-performance, and visually stunning web applications. Experienced in React, Node.js, Express, MongoDB, and modern cloud infrastructures. I love turning complex problems into simple, beautiful, and intuitive designs.';
      }
      
      // Seed heroBio if empty
      if (!profile.heroBio) {
        profile.heroBio = 'Passionate software engineer focused on building elegant, high-performance, and visually stunning web applications. I love turning complex problems into simple, beautiful, and intuitive designs.';
      }
      
      // Make sure avatar urls are set properly
      if (!profile.avatarUrl) profile.avatarUrl = '/uploads/narsimulu_avatar.png';
      if (!profile.aboutAvatarUrl) profile.aboutAvatarUrl = '/uploads/narsimulu_avatar.png';
      
      await profile.save();
      console.log('Profile updated successfully:', profile);
    } else {
      console.log('Creating fresh profile document for HoneySai K...');
      profile = new About({
        name: 'HoneySai K',
        title: ['Full-Stack Engineer', 'UI/UX Designer', 'MERN Developer'],
        bio: 'Passionate software engineer focused on building elegant, high-performance, and visually stunning web applications. Experienced in React, Node.js, Express, MongoDB, and modern cloud infrastructures. I love turning complex problems into simple, beautiful, and intuitive designs.',
        heroBio: 'Passionate software engineer focused on building elegant, high-performance, and visually stunning web applications. I love turning complex problems into simple, beautiful, and intuitive designs.',
        avatarUrl: '/uploads/narsimulu_avatar.png',
        aboutAvatarUrl: '/uploads/narsimulu_avatar.png',
        resumeUrl: '',
        socialLinks: {
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
          twitter: 'https://twitter.com',
          email: 'honey.sai@example.com'
        },
        location: 'Hyderabad, India'
      });
      await profile.save();
      console.log('Profile created successfully:', profile);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding profile:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedProfile();
