import mongoose from 'mongoose';

const CredentialsSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // Hashed using bcryptjs
}, { timestamps: true });

export default mongoose.model('Credentials', CredentialsSchema);
