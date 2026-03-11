import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { mockLogin, mockRegister } from '../utils/mockAuth';

/**
 * Custom hook for authentication operations
 * Wraps the auth store and provides additional functionality
 * 
 * @returns {Object} Auth state and methods
 */
const useAuth = () => {
  const navigate = useNavigate();
  
  // Get auth state and actions from store
  const {
    user,
    token,
    isAuthenticated,
    login: setAuthState,
    logout: clearAuthState,
    setUser,
    updateUser,
    hasRole,
    isAdmin,
    isHOD,
    isTeacher,
    isStudent,
  } = useAuthStore();

  // Check if we should use mock auth (when backend is not available)
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

  /**
   * Login user with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember user login
   * @returns {Promise<Object>} User data
   */
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      let userData, authToken;

      if (useMock) {
        // Use mock authentication for development
        console.log('[useAuth] Using mock authentication');
        const mockResponse = await mockLogin(email, password);
        userData = mockResponse.user;
        authToken = mockResponse.tokens.accessToken;
      } else {
        // Use real API
        const response = await api.post('/auth/login', {
          email,
          password,
          rememberMe,
        });

        // Handle nested response structure from backend
        // Backend returns: { success, data: { user, tokens: { accessToken, ... } }, message }
        // API interceptor already unwraps response.data, so response is the body
        // response = { success: true, data: { user, tokens }, message }
        // We need to access response.data to get { user, tokens }
        userData = response.data.user;
        authToken = response.data.tokens.accessToken;
      }

      // Set auth state in store
      setAuthState(userData, authToken);

      return userData;
    } catch (error) {
      console.error('[useAuth] Login failed:', error);
      throw error;
    }
  }, [setAuthState, useMock]);

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user data
   */
  const register = useCallback(async (userData) => {
    try {
      let newUser, authToken;

      if (useMock) {
        // Use mock authentication for development
        console.log('[useAuth] Using mock registration');
        const mockResponse = await mockRegister(userData);
        newUser = mockResponse.user;
        authToken = mockResponse.token;
      } else {
        // Use real API
        const response = await api.post('/auth/register', userData);
        const responseData = response.data;
        newUser = responseData.user;
        authToken = responseData.token;
      }

      // Auto-login after registration
      setAuthState(newUser, authToken);

      return newUser;
    } catch (error) {
      console.error('[useAuth] Registration failed:', error);
      throw error;
    }
  }, [setAuthState, useMock]);

  /**
   * Logout user and redirect to login
   */
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[useAuth] Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear auth state
      clearAuthState();
      
      // Redirect to login page
      navigate('/login', { replace: true });
    }
  }, [clearAuthState, navigate]);

  /**
   * Fetch current user data from server
   * Useful for refreshing user data after updates
   * @returns {Promise<Object>} Current user data
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;

      // Update user in store
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('[useAuth] Fetch current user failed:', error);
      
      // If fetch fails due to invalid token, logout
      if (error.response?.status === 401) {
        clearAuthState();
        navigate('/login', { replace: true });
      }
      
      throw error;
    }
  }, [setUser, clearAuthState, navigate]);

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user data
   */
  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates);
      const updatedUser = response.data;

      // Update user in store
      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('[useAuth] Update profile failed:', error);
      throw error;
    }
  }, [setUser]);

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('[useAuth] Change password failed:', error);
      throw error;
    }
  }, []);

  /**
   * Request password reset email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  const forgotPassword = useCallback(async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('[useAuth] Forgot password failed:', error);
      throw error;
    }
  }, []);

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
    } catch (error) {
      console.error('[useAuth] Reset password failed:', error);
      throw error;
    }
  }, []);

  /**
   * Check if user is authorized (has required role)
   * @param {string|string[]} requiredRoles - Required role(s)
   * @returns {boolean}
   */
  const isAuthorized = useCallback((requiredRoles) => {
    if (!isAuthenticated || !user) return false;
    
    // No role requirement means just need to be authenticated
    if (!requiredRoles) return true;
    
    return hasRole(requiredRoles);
  }, [isAuthenticated, user, hasRole]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    
    // Utilities
    isAuthorized,
    hasRole,
    isAdmin,
    isHOD,
    isTeacher,
    isStudent,
    updateUser,
  };
};

export default useAuth;
