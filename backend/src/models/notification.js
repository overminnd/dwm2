// ===================================
// src/models/Notification.js
// ===================================
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  type: {
    type: String,
    enum: ['order_paid', 'order_shipped', 'order_delivered', 'order_cancelled'],
    required: true
  },
  sentAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);