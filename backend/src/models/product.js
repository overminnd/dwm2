// ===================================
// src/models/Product.js
// ===================================
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 200
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'retired'],
    default: 'draft'
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: {
    type: Number // en gramos
  },
  featured: {
    type: Boolean,
    default: false
  },
  images: [{
    url: String,
    order: Number
  }],
  mainImage: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-generar slug
productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Virtuals
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'published' && this.stock > 0;
});

export default mongoose.model('Product', productSchema);
