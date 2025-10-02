import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Prevents Android back button from exiting PWA
 * Handles back navigation within the app instead
 */
export const useAndroidBackButton = () => {
  const location = useLocation();

  useEffect(() => {
    // Only handle back button on root paths
    const isRootPath = location.pathname === '/app' || location.pathname === '/';
    
    if (!isRootPath) return;

    const handlePopState = () => {
      // Keep user in PWA by pushing state back
      window.history.pushState(null, '', location.pathname);
    };

    // Push initial state
    window.history.pushState(null, '', location.pathname);
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);
};
