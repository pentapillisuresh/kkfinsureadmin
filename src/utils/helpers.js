// src/utils/helpers.js

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Get status color for badges
 * @param {string} status - Status string (active, inactive, pending, paid, etc.)
 * @returns {string} - Tailwind CSS color classes
 */
export const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  const statusMap = {
    // User statuses
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    
    // Investment statuses
    'in-progress': 'bg-yellow-100 text-yellow-800',
    matured: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
    
    // Payment/ROI statuses
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    
    // Ticket statuses
    open: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    
    // Partner types
    referral: 'bg-purple-100 text-purple-800',
    authorised: 'bg-indigo-100 text-indigo-800',
    hni: 'bg-pink-100 text-pink-800',
    none: 'bg-gray-100 text-gray-600',
    
    // Commission status
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    
    // Default
    default: 'bg-gray-100 text-gray-800'
  };
  
  // Check if status exists in map, otherwise return default
  return statusMap[status.toLowerCase()] || statusMap.default;
};

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a client ID (e.g., CL-0001)
 * @param {number} index - Index number
 * @returns {string} - Client ID
 */
export const generateClientId = (index = 0) => {
  const padded = String(index + 1).padStart(4, '0');
  return `CL-${padded}`;
};

/**
 * Generate a username from full name
 * @param {string} fullName - User's full name
 * @returns {string} - Generated username
 */
export const generateUsername = (fullName) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].toLowerCase();
  }
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
};

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth
 * @returns {number} - Age in years
 */
export const calculateAge = (dob) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Get initials from full name
 * @param {string} fullName - User's full name
 * @returns {string} - Initials (e.g., "JD")
 */
export const getInitials = (fullName) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return parts.map(part => part.charAt(0).toUpperCase()).join('');
};

/**
 * Mask sensitive data
 * @param {string} value - Value to mask
 * @param {string} type - 'email', 'phone', 'pan', 'aadhar'
 * @returns {string} - Masked value
 */
export const maskData = (value, type = 'email') => {
  if (!value) return '';
  
  switch(type) {
    case 'email':
      const [local, domain] = value.split('@');
      if (local.length <= 2) return value;
      return local[0] + '***' + local[local.length - 1] + '@' + domain;
    
    case 'phone':
      if (value.length <= 4) return value;
      return value.slice(0, 2) + '****' + value.slice(-2);
    
    case 'pan':
      if (value.length !== 10) return value;
      return value.slice(0, 5) + '****' + value.slice(9);
    
    case 'aadhar':
      if (value.length !== 12) return value;
      return '****' + value.slice(-4);
    
    default:
      return value;
  }
};

/**
 * Get month name from date
 * @param {string|Date} date - Date
 * @param {string} format - 'short' or 'long'
 * @returns {string} - Month name
 */
export const getMonthName = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleString('en-US', { month: 'short' });
  }
  return d.toLocaleString('en-US', { month: 'long' });
};

/**
 * Get week number from date
 * @param {string|Date} date - Date
 * @returns {number} - Week number
 */
export const getWeekNumber = (date) => {
  if (!date) return 0;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
};

/**
 * Get relative time string (e.g., "2 days ago")
 * @param {string|Date} date - Date
 * @returns {string} - Relative time
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a random color
 * @returns {string} - Hex color
 */
export const randomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#F0E68C', '#87CEEB',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#FF6FB5'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} - True if empty
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};