/**
 * Category Model
 */
export class Category {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.name = data.name || '';
    this.slug = data.slug || '';
    this.description = data.description || '';
    this.image = data.image || '/assets/images/placeholder.jpg';
    this.icon = data.icon || 'bi-grid';
    this.productCount = data.productCount || 0;
    this.featured = data.featured !== undefined ? data.featured : false;
    this.order = data.order || 0;
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get hasProducts() {
    return this.productCount > 0;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      image: this.image,
      icon: this.icon,
      productCount: this.productCount,
      featured: this.featured,
      order: this.order,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Category;