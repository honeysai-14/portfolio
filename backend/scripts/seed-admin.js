import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Credentials from '../models/Credentials.js';

// Load environmental config from parent directory .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  const args = process.argv.slice(2);
  let username = '';
  let password = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) {
      username = args[i + 1];
      i++;
    } else if (args[i] === '--password' && args[i + 1]) {
      password = args[i + 1];
      i++;
    }
  }

  // Fallback defaults if parameters are missing
  if (!username || !password) {
    console.error('Error: Please provide both --username and --password arguments.');
    console.log('Usage: node scripts/seed-admin.js --username <username> --password <password>');
    process.exit(1);
  }

  const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

  try {
    console.log(`Connecting to database to seed admin user...`);
    await mongoose.connect(mongodbUri);
    console.log('Database connected.');

    // Check if credentials document already exists
    let creds = await Credentials.findOne({ username });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (creds) {
      console.log(`Admin user "${username}" already exists. Updating password...`);
      creds.password = hashedPassword;
      await creds.save();
      console.log(`Password updated successfully!`);
    } else {
      console.log(`Creating new Admin user "${username}"...`);
      creds = new Credentials({
        username,
        password: hashedPassword
      });
      await creds.save();
      console.log(`Admin user seeded successfully!`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
