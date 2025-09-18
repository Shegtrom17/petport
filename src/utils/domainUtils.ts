import { featureFlags } from '@/config/featureFlags';

/**
 * Get the base URL for the application based on the current environment
 * @returns The appropriate base URL for the current environment
 */
export const getBaseURL = (): string => {
  // In test mode, use Supabase domain for development/testing
  if (featureFlags.testMode) {
    return 'https://dxghbhujugsfmaecilrq.supabase.co';
  }
  
  // In production, use the branded domain
  return 'https://petport.app';
};

/**
 * Get the edge function base URL for the current environment
 * @returns The appropriate edge function base URL
 */
export const getEdgeFunctionBaseURL = (): string => {
  const baseURL = getBaseURL();
  return `${baseURL}/functions/v1`;
};

/**
 * Generate a share URL using the appropriate edge function
 * @param functionName The edge function name (e.g., 'profile-share', 'missing-pet-share')
 * @param petId The pet ID
 * @param redirectUrl The URL to redirect to after social media crawling
 * @returns The complete share URL
 */
export const generateShareURL = (
  functionName: string,
  petId: string,
  redirectUrl: string
): string => {
  const edgeBaseURL = getEdgeFunctionBaseURL();
  const redirectParam = encodeURIComponent(redirectUrl);
  const cacheBuster = `v=${Date.now()}`;
  
  return `${edgeBaseURL}/${functionName}?petId=${encodeURIComponent(petId)}&redirect=${redirectParam}&${cacheBuster}`;
};