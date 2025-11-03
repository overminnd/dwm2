import { formatCurrency } from '../utils.js';

/**
 * Product Model
 */
export class Product {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.name = data.name || '';
    this.slug = data.slug || '';
    this.categoryId = data.categoryId || null;
    this.category = data.category || '';
    this.description = data.description || '';
    this.longDescription = data.longDescription || '';
    this.price = data.price || 0;
    this.originalPrice = data.originalPrice || null;
    this.discount = data.discount || 0;
    this.unit = data.unit || 'kg';
    this.stock = data.stock || 0;
    this.minStock = data.minStock || 0;
    this.rating = data.rating || 0;
    this.reviewCount = data.reviewCount || 0;
    this.mainImage = data.mainImage || '/assets/images/placeholder.jpg';
    this.images = data.images || [this.mainImage];
    this.features = data.features || [];
    this.specifications = data.specifications || {};
    this.tags = data.tags || [];
    this.featured = data.featured || false;
    this.bestSeller = data.bestSeller || false;
    this.isNew = data.isNew || false;
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get formattedPrice() {
    return formatCurrency(this.price);
  }

  get formattedOriginalPrice() {
    return this.originalPrice ? formatCurrency(this.originalPrice) : null;
  }

  get hasDiscount() {
    return this.discount > 0 && this.originalPrice > 0;
  }

  get isInStock() {
    return this.stock > 0;
  }

  get isLowStock() {
    return this.stock > 0 && this.stock <= this.minStock;
  }

  get stockStatus() {
    if (!this.isInStock) return 'out_of_stock';
    if (this.isLowStock) return 'low_stock';
    return 'in_stock';
  }

  get stockStatusText() {
    const statuses = {
      out_of_stock: 'Agotado',
      low_stock: 'Pocas unidades',
      in_stock: 'En stock'
    };
    return statuses[this.stockStatus];
  }

  get ratingStars() {
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return {
      full: fullStars,
      half: hasHalfStar ? 1 : 0,
      empty: emptyStars
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      categoryId: this.categoryId,
      category: this.category,
      description: this.description,
      longDescription: this.longDescription,
      price: this.price,
      originalPrice: this.originalPrice,
      discount: this.discount,
      unit: this.unit,
      stock: this.stock,
      minStock: this.minStock,
      rating: this.rating,
      reviewCount: this.reviewCount,
      mainImage: this.mainImage,
      images: this.images,
      features: this.features,
      specifications: this.specifications,
      tags: this.tags,
      featured: this.featured,
      bestSeller: this.bestSeller,
      isNew: this.isNew,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Product;