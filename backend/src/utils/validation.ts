export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
  return phoneRegex.test(phone.trim());
};

export const isValidDate = (dateStr: any): boolean => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

export const isDateRangeValid = (startDate: any, endDate: any): boolean => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  return new Date(startDate).getTime() <= new Date(endDate).getTime();
};

export const isPositiveNumber = (num: any): boolean => {
  if (num === '' || num === null || num === undefined || typeof num === 'boolean') return false;
  if (typeof num === 'string' && num.trim() === '') return false;
  const n = Number(num);
  return !isNaN(n) && n > 0;
};

export const isNonNegativeNumber = (num: any): boolean => {
  if (num === '' || num === null || num === undefined || typeof num === 'boolean') return false;
  if (typeof num === 'string' && num.trim() === '') return false;
  const n = Number(num);
  return !isNaN(n) && n >= 0;
};

export const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
  return usernameRegex.test(username.trim());
};
