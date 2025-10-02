import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Prevents Android back button from exiting PWA
 * Handles back navigation within the app instead
 */
export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Prevent exiting PWA when at root
      if (location.pathname === '/app' || location.pathname === '/') {
        e.preventDefault();
        // Push current state back to prevent exit
        window.history.pushState(null, '', location.pathname);
        return;
      }
    };

    // Add a state to history to catch back button
    window.history.pushState(null, '', location.pathname);
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);
};
