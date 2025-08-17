import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to maintain auth session on iOS by refreshing tokens when app regains focus
 * This helps prevent iOS from clearing sessions in certain conditions
 */
export const useAuthKeepAlive = () => {
  const { session } = useAuth();

  const refreshSession = useCallback(async () => {
    if (!session) return;

    try {
      console.log("AuthKeepAlive: Refreshing session on app focus");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.warn("AuthKeepAlive: Session refresh failed:", error);
        return;
      }
      
      if (data.session) {
        console.log("AuthKeepAlive: Session refreshed successfully");
      }
    } catch (error) {
      console.warn("AuthKeepAlive: Session refresh error:", error);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const handleFocus = () => {
      // Small delay to ensure app is fully active
      setTimeout(refreshSession, 100);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(refreshSession, 100);
      }
    };

    // Listen for app becoming active
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also refresh on page show (back button, etc.)
    window.addEventListener('pageshow', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleFocus);
    };
  }, [session, refreshSession]);
};