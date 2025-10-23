/**
 * Formats a phone number to (XXX) XXX-XXXX format
 * Handles US numbers with or without country code
 * Returns original input for partial or non-US numbers
 */
export function formatPhoneNumber(input: string): string {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');
  
  // Handle empty input
  if (!digits) return '';
  
  // Handle US numbers with country code (1)
  if (digits.length === 11 && digits[0] === '1') {
    const area = digits.slice(1, 4);
    const mid = digits.slice(4, 7);
    const last = digits.slice(7, 11);
    return `(${area}) ${mid}-${last}`;
  }
  
  // Handle standard 10-digit US numbers
  if (digits.length === 10) {
    const area = digits.slice(0, 3);
    const mid = digits.slice(3, 6);
    const last = digits.slice(6, 10);
    return `(${area}) ${mid}-${last}`;
  }
  
  // Return original for partial or non-US numbers
  return input;
}
