// ⚠️ WARNING: FROZEN MODULE — DO NOT MODIFY WITHOUT OWNER APPROVAL
// This file contains verified production logic for domain routing, edge function URLs, and share URL generation.
// Last verified: October 2025
// Changes require explicit approval from Susan Hegstrom after:
//   1. Regression testing on iOS Safari, Android Chrome, Desktop
//   2. Verification that OG images still load from Cloudflare R2
//   3. Confirmation that share URLs route correctly through edge functions
// Any refactor proposals must be discussed in chat-and-plan mode first.
// @lovable:protect begin

import { featureFlags } from '@/config/featureFlags';

// @lovable:protect-function - Base URL generation for test/prod environments (Oct 2025)
/**
 * Get the base URL for the application based on the current environment
 * @returns The appropriate base URL for the current environment
 */
export const getBaseURL = (): string => {
  // In test mode or Lovable preview environments, use the current origin
  if (featureFlags.testMode && typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isPreview = host.includes('lovableproject.com') || host.includes('lovable.app');
    if (isPreview) {
      return window.location.origin;
    }
  }
  // Production domain
  return 'https://petport.app';
};

// @lovable:protect-function - Edge function base URL (Oct 2025)
/**
 * Get the edge function base URL for the current environment
 * @returns The appropriate edge function base URL
 */
export const getEdgeFunctionBaseURL = (): string => {
  // Edge functions always run on Supabase domain regardless of test mode
  return 'https://dxghbhujugsfmaecilrq.supabase.co/functions/v1';
};

// @lovable:protect-function - Share URL generation for OG bypass (Oct 2025 Fix #1)
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

// @lovable:protect end
