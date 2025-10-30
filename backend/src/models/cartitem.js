// ===================================
// src/models/CartItem.js
// ===================================
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Virtual para subtotal
cartItemSchema.virtual('subtotal').get(function() {
  return this.quantity * this.unitPrice;
});

export default mongoose.model('CartItem', cartItemSchema);