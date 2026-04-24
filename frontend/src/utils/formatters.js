// frontend/src/utils/formatters.js

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-BW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BW', {
    style: 'currency',
    currency: 'BWP'
  }).format(amount);
};

export const formatQueuePosition = (position, total) => {
  if (!position) return 'N/A';
  return `${position} of ${total || '?'}`;
};

export const formatApplicationNumber = (appNumber) => {
  if (!appNumber) return '';
  return appNumber.replace(/(.{3})(.{4})(.{6})/, '$1-$2-$3');
};

export const formatUserNumber = (userNumber) => {
  return userNumber || 'USR-000000';
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  if (phone.length === 8) {
    return `+267 ${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5)}`;
  }
  return phone;
};