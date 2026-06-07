import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date, required: true },
  credentialId: { type: String },
  credentialUrl: { type: String },
  image: { type: String }
}, { timestamps: true });

export default mongoose.model('Certificate', CertificateSchema);
