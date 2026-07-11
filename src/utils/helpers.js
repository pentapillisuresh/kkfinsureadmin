export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const generateClientId = () => {
  const count = JSON.parse(localStorage.getItem('clients') || '[]').length;
  return `KKF${String(count + 1).padStart(6, '0')}`;
};

export const generateUsername = (name) => {
  return name.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);
};

export const calculateMonthlyROI = (amount, roi) => {
  return (amount * roi) / 100;
};

export const getStatusColor = (status) => {
  const colors = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'suspended': 'bg-red-100 text-red-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};