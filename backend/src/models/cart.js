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

// Un usuario solo puede tener un carrito activo
cartSchema.index({ userId: 1, status: 1 }, { unique: true, sparse: true });

export default mongoose.model('Cart', cartSchema);