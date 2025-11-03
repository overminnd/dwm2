import { API_ENDPOINTS, API_CONFIG, ROUTES } from '../config.js';
import { User } from '../models/User.js';
import storage from '../storage.js';
import { handleApiError } from '../utils.js';

/**
 * Authentication Service
 */
class AuthService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.useMockAuth = true; // Set to false when backend is ready
  }

  /**
   * Login
   */
  async login(email, password, remember = false) {
    try {
      if (this.useMockAuth) {
        // Mock login
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: 1,
          firstName: 'Usuario',
          lastName: 'Demo',
          email: email,
          phone: '+56912345678',
          role: 'customer'
        };
        
        const mockToken = 'mock_token_' + Date.now();
        
        storage.setToken(mockToken);
        storage.setUser(mockUser);
        
        return {
          success: true,
          data: {
            user: new User(mockUser),
            token: mockToken
          }
        };
      } else {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.LOGIN}`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ email, password, remember })
        });
        
        const data = await response.json();
        
        if (data.token) {
          storage.setToken(data.token);
          storage.setUser(data.user);
        }
        
        return {
          success: true,
          data: {
            user: new User(data.user),
            token: data.token
          }
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Register
   */
  async register(userData) {
    try {
      if (this.useMockAuth) {
        // Mock register
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          message: 'Cuenta creada exitosamente'
        };
      } else {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REGISTER}`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify(userData)
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
   * Logout
   */
  async logout() {
    try {
      storage.removeToken();
      storage.removeUser();
      storage.clearCart();
      
      window.location.href = ROUTES.HOME;
      
      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return storage.getUser();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return storage.has(storage.constructor.name === 'Storage' ? 'marazul_auth_token' : 'token');
  }

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      if (this.useMockAuth) {
        const user = storage.getUser();
        return {
          success: true,
          data: user ? new User(user) : null
        };
      } else {
        const token = storage.getToken();
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PROFILE}`, {
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        return {
          success: true,
          data: new User(data)
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Update profile
   */
  async updateProfile(profileData) {
    try {
      if (this.useMockAuth) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentUser = storage.getUser();
        const updatedUser = { ...currentUser, ...profileData };
        storage.setUser(updatedUser);
        
        return {
          success: true,
          data: new User(updatedUser)
        };
      } else {
        const token = storage.getToken();
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PROFILE}`, {
          method: 'PUT',
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });
        
        const data = await response.json();
        storage.setUser(data);
        
        return {
          success: true,
          data: new User(data)
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData) {
    try {
      if (this.useMockAuth) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          message: 'Contraseña actualizada correctamente'
        };
      } else {
        const token = storage.getToken();
        const response = await fetch(`${this.baseUrl}/auth/change-password`, {
          method: 'POST',
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(passwordData)
        });
        
        const data = await response.json();
        
        return {
          success: true,
          message: data.message
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;
export { AuthService };