import { API_ENDPOINTS, API_CONFIG } from '../config.js';
import { Category } from '../models/Category.js';
import { categories as mockCategories } from '../data/categories.js';
import { handleApiError } from '../utils.js';

/**
 * Category Service
 */
class CategoryService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.useMockData = true;
  }

  /**
   * Get all categories
   */
  async getCategories() {
    try {
      if (this.useMockData) {
        return {
          success: true,
          data: mockCategories.map(c => new Category(c))
        };
      } else {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CATEGORIES}`);
        const data = await response.json();
        
        return {
          success: true,
          data: data.categories.map(c => new Category(c))
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id) {
    try {
      if (this.useMockData) {
        const category = mockCategories.find(c => c.id === parseInt(id));
        return {
          success: true,
          data: category ? new Category(category) : null
        };
      } else {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CATEGORY_BY_ID(id)}`);
        const data = await response.json();
        
        return {
          success: true,
          data: new Category(data)
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
export { CategoryService };