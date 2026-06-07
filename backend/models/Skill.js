import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Technical', 'Programming Languages', 'Frameworks', 'Tools', 'Soft Skills', 'Certifications', 'Languages'],
    required: true 
  },
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true 
  },
  icon: { type: String }, // Can be a lucide-react icon name or image path
  description: { type: String },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Skill', SkillSchema);
