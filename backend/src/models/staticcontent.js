// ===================================
// src/models/StaticContent.js
// ===================================
import mongoose from 'mongoose';

const staticContentSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('StaticContent', staticContentSchema);