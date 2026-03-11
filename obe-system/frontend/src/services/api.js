import axios from 'axios';
import useAuthStore from '../store/authStore';

/**
 * Base API URL from environment variables
 * Defaults to localhost:5000 if not specified
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Axios instance with default configuration
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

/**
 * Request Interceptor
 * Automatically adds JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from auth store
    const token = useAuthStore.getState().token;
    
    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    // Handle request error
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors globally and manages token expiration
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    // Return response data directly
    return response.data;
  },
  (error) => {
    // Handle response error
    console.error('[API Response Error]', error);

    // Default error message
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Extract error message from response
      errorMessage = data?.message || data?.error || errorMessage;

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          console.warn('[API] 401 Unauthorized');
          
          // Only logout and redirect if user was previously authenticated
          // This prevents logout loops during development
          const isAuthenticated = useAuthStore.getState().isAuthenticated;
          
          if (isAuthenticated) {
            console.warn('[API] Logging out due to 401');
            
            // Logout user and clear auth state
            useAuthStore.getState().logout();
            
            // Redirect to login page (if not already there)
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
              window.location.href = '/login';
            }
          }
          
          errorMessage = 'Authentication required. Please login.';
          break;

        case 403:
          // Forbidden - Insufficient permissions
          errorMessage = data?.message || 'You do not have permission to perform this action';
          break;

        case 404:
          // Not Found
          errorMessage = data?.message || 'Resource not found';
          break;

        case 422:
          // Validation Error
          errorMessage = data?.message || 'Validation failed';
          // Attach validation errors if available
          if (data?.errors) {
            error.validationErrors = data.errors;
          }
          break;

        case 429:
          // Too Many Requests - Rate limiting
          errorMessage = 'Too many requests. Please try again later.';
          break;

        case 500:
          // Internal Server Error
          errorMessage = 'Server error. Please try again later.';
          break;

        default:
          // Other errors
          errorMessage = data?.message || `Error: ${status}`;
      }

      // Log error details in development
      if (import.meta.env.DEV) {
        console.error('[API Error Details]', {
          status,
          message: errorMessage,
          data,
          validationErrors: error.validationErrors,
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error. Please check your connection.';
      console.error('[API] No response received', error.request);
    } else {
      // Error in request configuration
      errorMessage = error.message || errorMessage;
      console.error('[API] Request setup error', error.message);
    }

    // Attach user-friendly error message to error object
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

/**
 * Helper function to handle file uploads
 * @param {string} url - API endpoint
 * @param {FormData} formData - Form data with files
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise}
 */
export const uploadFile = (url, formData, onUploadProgress) => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

/**
 * Helper function to download files
 * @param {string} url - API endpoint
 * @param {string} filename - Name for downloaded file
 * @returns {Promise}
 */
export const downloadFile = async (url, filename) => {
  const response = await api.get(url, {
    responseType: 'blob',
  });

  // Create blob link to download
  const urlBlob = window.URL.createObjectURL(new Blob([response]));
  const link = document.createElement('a');
  link.href = urlBlob;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return response;
};

export default api;
