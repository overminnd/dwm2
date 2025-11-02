// ===================================
// src/models/Cart.js
// ===================================
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'abandoned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Solo aplica unicidad a carritos activos
cartSchema.index(
  { userId: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { status: 'active' } 
  }
);

export default mongoose.model('Cart', cartSchema);