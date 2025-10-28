/**
 * Email Template Selection Helper
 * Switches between standard and holiday-themed templates based on HOLIDAY_MODE env variable
 */

export type GiftEmailType = 
  | 'gift-purchase-confirmation'
  | 'gift-notification'
  | 'gift-activated'
  | 'gift-renewal-reminder-60'
  | 'gift-renewal-reminder-30'
  | 'gift-renewal-reminder-7'
  | 'gift-expired';

/**
 * Get the appropriate email template ID based on holiday mode
 * @param baseTemplate - The base template name (e.g., 'gift-notification')
 * @returns The template ID to use (e.g., 'gift-notification-holiday' or 'gift-notification')
 */
export function getGiftEmailTemplate(baseTemplate: GiftEmailType): string {
  const isHolidayMode = Deno.env.get('HOLIDAY_MODE') === 'true';
  
  if (isHolidayMode) {
    console.log(`🎄 Holiday mode active: Using ${baseTemplate}-holiday template`);
    return `${baseTemplate}-holiday`;
  }
  
  console.log(`Using standard ${baseTemplate} template`);
  return baseTemplate;
}

/**
 * Standard template variables shared across all gift emails
 */
export interface GiftEmailVariables {
  sender_name?: string;
  recipient_email: string;
  recipient_name?: string;
  gift_message?: string;
  redemption_link?: string;
  gift_code?: string;
  expires_at?: string;
  days_remaining?: number;
  pet_name?: string;
}
