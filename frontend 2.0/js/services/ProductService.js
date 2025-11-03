import { API_ENDPOINTS, API_CONFIG } from '../config.js';
import { Product } from '../models/Product.js';
import { products as mockProducts } from '../data/products.js';
import { handleApiError } from '../utils.js';

/**
 * Product Service
 * Handles all product-related API calls
 */
class ProductService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.useMockData = true; // Set to false when backend is ready
  }

  /**
   * Get all products with filters
   */
  async getProducts(params = {}) {
    try {
      if (this.useMockData) {
        // Use mock data
        let filteredProducts = [...mockProducts];
        
        // Filter by category
        if (params.categoryId) {
          filteredProducts = filteredProducts.filter(p => p.categoryId === parseInt(params.categoryId));
        }
        
        // Filter by search query
        if (params.search) {
          const query = params.search.toLowerCase();
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tags.some(tag => tag.includes(query))
          );
        }
        
        // Sort
        if (params.sort) {
          switch (params.sort) {
            case 'price_asc':
              filteredProducts.sort((a, b) => a.price - b.price);
              break;
            case 'price_desc':
              filteredProducts.sort((a, b) => b.price - a.price);
              break;
            case 'name_asc':
              filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case 'name_desc':
              filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case 'rating':
              filteredProducts.sort((a, b) => b.rating - a.rating);
              break;
          }
        }
        
        return {
          success: true,
          data: filteredProducts.map(p => new Product(p)),
          total: filteredProducts.length
        };
      } else {
        // Make API call
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PRODUCTS}?${new URLSearchParams(params)}`);
        const data = await response.json();
        
        return {
          success: true,
          data: data.products.map(p => new Product(p)),
          total: data.total
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    try {
      if (this.useMockData) {
        const product = mockProducts.find(p => p.id === parseInt(id));
        if (product) {
          return {
            success: true,
            data: new Product(product)
          };
        }
        return {
          success: false,
          message: 'Producto no encontrado'
        };
      } else {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PRODUCT_BY_ID(id)}`);
        const data = await response.json();
        
        return {
          success: true,
          data: new Product(data)
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts() {
    try {
      if (this.useMockData) {
        const featured = mockProducts.filter(p => p.featured);
        return {
          success: true,
          data: featured.map(p => new Product(p))
        };
      } else {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PRODUCTS}?featured=true`);
        const data = await response.json();
        
        return {
          success: true,
          data: data.products.map(p => new Product(p))
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Search products
   */
  async searchProducts(query) {
    try {
      if (this.useMockData) {
        const lowerQuery = query.toLowerCase();
        const results = mockProducts.filter(p =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.tags.some(tag => tag.includes(lowerQuery))
        );
        
        return {
          success: true,
          data: results.map(p => new Product(p))
        };
      } else {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PRODUCT_SEARCH}?q=${query}`);
        const data = await response.json();
        
        return {
          success: true,
          data: data.products.map(p => new Product(p))
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
}

// Create singleton instance
const productService = new ProductService();
export default productService;
export { ProductService };