import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to capture and persist referral codes across all pages
 * Stores in localStorage so codes persist throughout user journey
 */
export const useReferralCode = () => {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      localStorage.setItem('petport_referral', refCode);
      console.log('[Referral] Code captured:', refCode);
    }
  }, [location.search]);

  /**
   * Get the current referral code from URL or localStorage
   */
  const getReferralCode = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('ref');
    const storedCode = localStorage.getItem('petport_referral');
    
    return urlCode || storedCode;
  };

  /**
   * Clear the referral code (useful after successful conversion)
   */
  const clearReferralCode = () => {
    localStorage.removeItem('petport_referral');
    console.log('[Referral] Code cleared');
  };

  return { getReferralCode, clearReferralCode };
};
