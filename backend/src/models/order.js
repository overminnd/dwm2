// ===================================
// src/models/Order.js
// ===================================
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  status: {
    type: String,
    enum: ['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending_payment'
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Auto-generar número de orden
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `ORD-${timestamp}-${count + 1}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);