import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Prevents Android back button from exiting PWA
 * Handles back navigation within the app instead
 */
export const useAndroidBackButton = () => {
  const location = useLocation();

  useEffect(() => {
    // Only intercept back button on root paths when history is empty
    const isRootPath = location.pathname === '/app' || location.pathname === '/';
    
    if (!isRootPath) return;

    const handlePopState = (e: PopStateEvent) => {
      // Only prevent exit if we're at the bottom of history stack
      if (window.history.length <= 2) {
        e.preventDefault();
        // Keep user in PWA by pushing state back
        window.history.pushState(null, '', location.pathname);
      }
    };

    // Push initial state only if needed
    if (window.history.state === null) {
      window.history.pushState(null, '', location.pathname);
    }
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);
};
