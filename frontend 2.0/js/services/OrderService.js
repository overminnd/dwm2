import { API_ENDPOINTS, API_CONFIG } from '../config.js';
import storage from '../storage.js';
import { handleApiError } from '../utils.js';

/**
 * Order Service
 */
class OrderService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.useMockData = true;
  }

  /**
   * Get user orders
   */
  async getUserOrders() {
    try {
      if (this.useMockData) {
        // Mock orders
        return {
          success: true,
          data: []
        };
      } else {
        const token = storage.getToken();
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ORDERS}`, {
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        return {
          success: true,
          data: data.orders
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id) {
    try {
      if (this.useMockData) {
        return {
          success: true,
          data: null
        };
      } else {
        const token = storage.getToken();
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ORDER_BY_ID(id)}`, {
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        return {
          success: true,
          data: data
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Create order
   */
  async createOrder(orderData) {
    try {
      if (this.useMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          data: {
            orderNumber: 'ORD-' + Date.now(),
            ...orderData
          }
        };
      } else {
        const token = storage.getToken();
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CREATE_ORDER}`, {
          method: 'POST',
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        return {
          success: true,
          data: data
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
}

const orderService = new OrderService();
export default orderService;
export { OrderService };