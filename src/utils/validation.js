// utils/validation.js

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    throw new ValidationError('email', 'Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('email', 'Please enter a valid email address');
  }

  return true;
};

/**
 * Password validation
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 1,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false
  } = options;

  if (!password || password.trim() === '') {
    throw new ValidationError('password', 'Password is required');
  }

  if (password.length < minLength) {
    throw new ValidationError(
      'password',
      `Password must be at least ${minLength} characters long`
    );
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    throw new ValidationError(
      'password',
      'Password must contain at least one uppercase letter'
    );
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    throw new ValidationError(
      'password',
      'Password must contain at least one lowercase letter'
    );
  }

  if (requireNumber && !/\d/.test(password)) {
    throw new ValidationError(
      'password',
      'Password must contain at least one number'
    );
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new ValidationError(
      'password',
      'Password must contain at least one special character'
    );
  }

  return true;
};

/**
 * Name validation
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim() === '') {
    throw new ValidationError(
      fieldName.toLowerCase(),
      `${fieldName} is required`
    );
  }

  if (name.trim().length < 2) {
    throw new ValidationError(
      fieldName.toLowerCase(),
      `${fieldName} must be at least 2 characters long`
    );
  }

  if (name.trim().length > 50) {
    throw new ValidationError(
      fieldName.toLowerCase(),
      `${fieldName} must be less than 50 characters`
    );
  }

  return true;
};

/**
 * File validation
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fieldName = 'File'
  } = options;

  if (!file) {
    throw new ValidationError('file', `${fieldName} is required`);
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    throw new ValidationError(
      'file',
      `${fieldName} size must be less than ${maxSizeMB}MB`
    );
  }

  if (!allowedTypes.includes(file.type)) {
    const types = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    throw new ValidationError(
      'file',
      `${fieldName} must be one of: ${types}`
    );
  }

  return true;
};

/**
 * Validate login form
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  try {
    validateEmail(email);
  } catch (error) {
    errors.email = error.message;
  }

  try {
    validatePassword(password);
  } catch (error) {
    errors.password = error.message;
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

/**
 * Validate signup form
 */
export const validateSignupForm = (name, email, password, confirmPassword) => {
  const errors = {};

  try {
    validateName(name);
  } catch (error) {
    errors.name = error.message;
  }

  try {
    validateEmail(email);
  } catch (error) {
    errors.email = error.message;
  }

  try {
    validatePassword(password, {
      minLength: 6,
      requireNumber: false,
      requireUppercase: false
    });
  } catch (error) {
    errors.password = error.message;
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

/**
 * Generic field validator
 */
export const validateField = (value, rules) => {
  for (const rule of rules) {
    try {
      rule(value);
    } catch (error) {
      return error.message;
    }
  }
  return null;
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};