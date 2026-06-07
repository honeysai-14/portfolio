import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  category: { type: String, required: true },
  tags: [{ type: String }],
  demoUrl: { type: String },
  githubUrl: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);
