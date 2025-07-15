
// Utility functions for input sanitization and validation
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters and HTML tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Create a temporary div element to safely parse HTML
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic phone number validation - adjust regex as needed
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const validateTextLength = (text: string, maxLength: number): boolean => {
  return text ? text.length <= maxLength : true;
};

// Security-focused validation
export const containsSuspiciousContent = (input: string): boolean => {
  if (!input) return false;
  
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /document\.write/i,
    /innerHTML/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
};
