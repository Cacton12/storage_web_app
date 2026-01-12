// utils/apiErrorHandler.js

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error codes for different scenarios
 */
export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELDS: 'MISSING_FIELDS',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  
  // Rate limiting
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Unknown
  UNKNOWN: 'UNKNOWN'
};

/**
 * User-friendly error messages
 */
const errorMessages = {
  [ErrorCodes.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorCodes.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCodes.UNAUTHORIZED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.MISSING_FIELDS]: 'Please fill in all required fields.',
  [ErrorCodes.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.CONFLICT]: 'This resource already exists.',
  [ErrorCodes.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCodes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Parse fetch errors into ApiError
 */
export const parseApiError = async (response, fallbackMessage = 'Request failed') => {
  let errorData = null;
  let message = fallbackMessage;
  let code = ErrorCodes.UNKNOWN;

  try {
    // Try to parse JSON error response
    errorData = await response.json();
    message = errorData.message || errorData.error || fallbackMessage;
  } catch {
    // If parsing fails, use status text
    message = response.statusText || fallbackMessage;
  }

  // Determine error code based on status
  switch (response.status) {
    case 400:
      code = ErrorCodes.VALIDATION_ERROR;
      break;
    case 401:
      code = ErrorCodes.UNAUTHORIZED;
      break;
    case 403:
      code = ErrorCodes.UNAUTHORIZED;
      break;
    case 404:
      code = ErrorCodes.NOT_FOUND;
      break;
    case 409:
      code = ErrorCodes.CONFLICT;
      break;
    case 429:
      code = ErrorCodes.RATE_LIMIT;
      break;
    case 500:
    case 502:
    case 503:
      code = ErrorCodes.SERVER_ERROR;
      break;
    case 504:
      code = ErrorCodes.TIMEOUT;
      break;
    default:
      code = ErrorCodes.UNKNOWN;
  }

  return new ApiError(message, response.status, code, errorData);
};

/**
 * Enhanced fetch with timeout and error handling
 */
export const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new ApiError(
        errorMessages[ErrorCodes.TIMEOUT],
        408,
        ErrorCodes.TIMEOUT
      );
    }
    
    throw new ApiError(
      errorMessages[ErrorCodes.NETWORK_ERROR],
      0,
      ErrorCodes.NETWORK_ERROR,
      error
    );
  }
};

/**
 * Retry logic for failed requests
 */
export const retryRequest = async (
  requestFn,
  maxRetries = 3,
  delayMs = 1000,
  backoff = 2
) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (i === maxRetries - 1) {
        break;
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(backoff, i)));
    }
  }
  
  throw lastError;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  if (error instanceof ApiError) {
    return errorMessages[error.code] || error.message;
  }
  return errorMessages[ErrorCodes.UNKNOWN];
};

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export const logError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
      context
    });
  }
  
  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // Example: Sentry.captureException(error, { extra: context });
};

/**
 * Check if error is due to auth issue
 */
export const isAuthError = (error) => {
  return error instanceof ApiError && 
    (error.code === ErrorCodes.UNAUTHORIZED || 
     error.code === ErrorCodes.TOKEN_EXPIRED);
};

/**
 * Validate JWT token expiration
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};