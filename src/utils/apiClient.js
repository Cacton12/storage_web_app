// utils/apiClient.js
import { 
  fetchWithTimeout, 
  parseApiError, 
  retryRequest, 
  logError,
  isTokenExpired,
  ErrorCodes,
  ApiError
} from './apiErrorHandler';
import { API_BASE_URL } from '../config';

/**
 * Centralized API client with error handling, retries, and auth
 */
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.tokenRefreshInProgress = false;
  }

  /**
   * Get auth token from session storage
   */
  getToken() {
    return sessionStorage.getItem('token');
  }

  /**
   * Set auth token in session storage
   */
  setToken(token) {
    sessionStorage.setItem('token', token);
  }

  /**
   * Clear auth data
   */
  clearAuth() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isDemo');
  }

  /**
   * Handle token refresh (if you implement refresh tokens)
   */
  async refreshToken() {
    // TODO: Implement token refresh logic if your backend supports it
    throw new ApiError(
      'Session expired',
      401,
      ErrorCodes.TOKEN_EXPIRED
    );
  }

  /**
   * Build headers for requests
   */
  buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Main request method with error handling
   */
  async request(endpoint, options = {}, retry = true) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    // Check if token is expired before making request
    if (token && isTokenExpired(token)) {
      this.clearAuth();
      throw new ApiError(
        'Your session has expired. Please log in again.',
        401,
        ErrorCodes.TOKEN_EXPIRED
      );
    }

    const requestOptions = {
      ...options,
      headers: this.buildHeaders(options.headers)
    };

    try {
      const makeRequest = async () => {
        const response = await fetchWithTimeout(url, requestOptions);

        // Handle successful responses
        if (response.ok) {
          // Handle 204 No Content
          if (response.status === 204) {
            return null;
          }
          return await response.json();
        }

        // Handle errors
        const error = await parseApiError(response);
        
        // If unauthorized, clear auth and redirect
        if (error.status === 401) {
          this.clearAuth();
        }
        
        throw error;
      };

      // Use retry logic for GET requests and server errors
      if (retry && (options.method === 'GET' || !options.method)) {
        return await retryRequest(makeRequest, 3);
      }

      return await makeRequest();
    } catch (error) {
      // Log error
      logError(error, { endpoint, method: options.method || 'GET' });
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    }, false); // Don't retry POST by default
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    }, false);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    }, false);
  }

  /**
   * Upload file with multipart/form-data
   */
  async uploadFile(endpoint, formData, onProgress = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary

    try {
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        // Track upload progress
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              onProgress(percentComplete);
            }
          });
        }

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch {
              resolve(xhr.responseText);
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              const error = new ApiError(
                errorData.message || 'Upload failed',
                xhr.status,
                ErrorCodes.UNKNOWN,
                errorData
              );
              logError(error, { endpoint, method: 'POST' });
              reject(error);
            } catch {
              const error = new ApiError(
                'Upload failed',
                xhr.status,
                ErrorCodes.UNKNOWN
              );
              logError(error, { endpoint, method: 'POST' });
              reject(error);
            }
          }
        });

        xhr.addEventListener('error', () => {
          const error = new ApiError(
            'Network error during upload',
            0,
            ErrorCodes.NETWORK_ERROR
          );
          logError(error, { endpoint, method: 'POST' });
          reject(error);
        });

        xhr.addEventListener('timeout', () => {
          const error = new ApiError(
            'Upload timed out',
            408,
            ErrorCodes.TIMEOUT
          );
          logError(error, { endpoint, method: 'POST' });
          reject(error);
        });

        xhr.open('POST', url);
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
        xhr.timeout = 120000; // 2 minutes for file uploads
        xhr.send(formData);
      });
    } catch (error) {
      logError(error, { endpoint, method: 'POST' });
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;