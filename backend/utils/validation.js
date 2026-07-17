/**
 * Centralized validation functions for database operations
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required and must be a string' };
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }
  if (trimmed.length > 255) {
    return { valid: false, error: 'Email is too long (max 255 characters)' };
  }
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Email format is invalid' };
  }
  return { valid: true, value: trimmed };
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required and must be a string' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }
  // Check for at least one uppercase, one lowercase, and one number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, and numeric characters'
    };
  }
  return { valid: true };
};

const validateCustomerName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Customer name is required and must be a string' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Customer name cannot be empty' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Customer name must be at least 2 characters' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'Customer name is too long (max 100 characters)' };
  }
  return { valid: true, value: trimmed };
};

const validateLocation = (location) => {
  if (!location || typeof location !== 'string') {
    return { valid: false, error: 'Location is required and must be a string' };
  }
  const trimmed = location.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Location cannot be empty' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Location must be at least 2 characters' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'Location is too long (max 100 characters)' };
  }
  return { valid: true, value: trimmed };
};

const validateStatus = (status) => {
  const validStatuses = ['pending', 'in-transit', 'delivered', 'cancelled'];
  if (!status || typeof status !== 'string') {
    return { valid: false, error: 'Status is required and must be a string' };
  }
  const trimmed = status.toLowerCase().trim();
  if (!validStatuses.includes(trimmed)) {
    return {
      valid: false,
      error: `Status must be one of: ${validStatuses.join(', ')}`
    };
  }
  return { valid: true, value: trimmed };
};

const validateTrackingCode = (code) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Tracking code is required and must be a string' };
  }
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Tracking code cannot be empty' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Tracking code is too long (max 20 characters)' };
  }
  // Alphanumeric and hyphens only
  if (!/^[A-Z0-9-]+$/.test(trimmed)) {
    return { valid: false, error: 'Tracking code must contain only letters, numbers, and hyphens' };
  }
  return { valid: true, value: trimmed };
};

const validateShipmentData = (data) => {
  const errors = [];

  const customerName = validateCustomerName(data.customer_name);
  if (!customerName.valid) errors.push(customerName.error);

  const customerEmail = validateEmail(data.customer_email);
  if (!customerEmail.valid) errors.push(customerEmail.error);

  const origin = validateLocation(data.origin);
  if (!origin.valid) errors.push(origin.error);

  const destination = validateLocation(data.destination);
  if (!destination.valid) errors.push(destination.error);

  // Check that origin and destination are different
  if (origin.valid && destination.valid && origin.value === destination.value) {
    errors.push('Origin and destination must be different');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      customer_name: customerName.value,
      customer_email: customerEmail.value,
      origin: origin.value,
      destination: destination.value
    }
  };
};

const validateAdminData = (data) => {
  const errors = [];

  const email = validateEmail(data.email);
  if (!email.valid) errors.push(email.error);

  const password = validatePassword(data.password);
  if (!password.valid) errors.push(password.error);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      email: email.value
    }
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateCustomerName,
  validateLocation,
  validateStatus,
  validateTrackingCode,
  validateShipmentData,
  validateAdminData
};
