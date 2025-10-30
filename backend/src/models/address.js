// ===================================
// src/models/Address.js
// ===================================
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  street: {
    type: String,
    required: [true, 'La calle es obligatoria'],
    trim: true
  },
  number: {
    type: String,
    required: [true, 'El número es obligatorio'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'La ciudad es obligatoria'],
    trim: true
  },
  region: {
    type: String,
    required: [true, 'La región es obligatoria'],
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'Chile',
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Solo una dirección por defecto por usuario
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.model('Address', addressSchema);