// src/utils/validators.js

export const validateOmang = (omang) => {
  return /^\d{9}$/.test(omang);
};

export const validatePhone = (phone) => {
  return /^[7][0-9]{7}$/.test(phone);
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateBotswanaPhone = (phone) => {
  // Accepts both 8-digit mobile (7XXXXXXX) and 7-digit landline
  return /^([7][0-9]{7}|[0-9]{7})$/.test(phone);
};

export const formatBotswanaPhone = (phone) => {
  if (!phone) return '';
  if (phone.length === 8 && phone.startsWith('7')) {
    return `+267 ${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5)}`;
  }
  return phone;
};