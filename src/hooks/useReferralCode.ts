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
      // Store in multiple places for redundancy
      localStorage.setItem('petport_referral', refCode);
      sessionStorage.setItem('petport_referral', refCode);
      
      // Also store in cookie (expires in 30 days)
      document.cookie = `petport_referral=${refCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      console.log('[Referral] Code captured and stored in localStorage, sessionStorage, and cookie:', refCode);
    }
    
    // Debug: Log what's currently stored
    const stored = localStorage.getItem('petport_referral');
    const cookieMatch = document.cookie.match(/petport_referral=([^;]+)/);
    const cookieValue = cookieMatch ? cookieMatch[1] : null;
    
    if (stored || cookieValue) {
      console.log('[Referral] Current stored code:', { localStorage: stored, cookie: cookieValue });
    }
  }, [location.search]);

  /**
   * Get the current referral code from URL, cookie, or localStorage
   */
  const getReferralCode = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('ref');
    
    // Check cookie
    const cookieMatch = document.cookie.match(/petport_referral=([^;]+)/);
    const cookieCode = cookieMatch ? cookieMatch[1] : null;
    
    const storedCode = localStorage.getItem('petport_referral');
    
    return urlCode || cookieCode || storedCode;
  };

  /**
   * Clear the referral code (useful after successful conversion)
   */
  const clearReferralCode = () => {
    localStorage.removeItem('petport_referral');
    sessionStorage.removeItem('petport_referral');
    document.cookie = 'petport_referral=; path=/; max-age=0';
    console.log('[Referral] Code cleared from all storage');
  };

  return { getReferralCode, clearReferralCode };
};
