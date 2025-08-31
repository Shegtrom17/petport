import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { featureFlags } from "@/config/featureFlags";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [checkingSub, setCheckingSub] = useState<boolean>(true);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("Protected Route - Current location:", location.pathname);
    console.log("Protected Route - Auth Status:", { user: !!user, isLoading, pathname: location.pathname });
  }, [user, isLoading, location.pathname]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      try {
        // Use direct query until types are regenerated
        const { data, error } = await supabase
          .from("subscribers")
          .select("status, grace_period_end")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        // Check if subscription is active (active status or grace period not expired)
        let isActive = false;
        if (data) {
          if (data.status === 'active') {
            isActive = true;
          } else if (data.status === 'grace' && data.grace_period_end) {
            isActive = new Date(data.grace_period_end) > new Date();
          }
        }
        
        setSubscribed(isActive);
        console.log("Protected Route - Subscription status:", isActive);
      } catch (e) {
        console.warn("Protected Route - Subscription check failed, treating as unsubscribed", e);
        setSubscribed(false);
      } finally {
        setCheckingSub(false);
      }
    };
    if (user) {
      setCheckingSub(true);
      checkSubscription();
    }
  }, [user]);

  // Show loading state (skip subscription check wait in test mode)
  if (isLoading || (user && checkingSub && !featureFlags.testMode)) {
    console.log("Protected Route - Showing loading state");
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-100">
        <div className="animate-pulse text-navy-800">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("Protected Route - No user, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // In test mode, bypass subscription gate
  if (featureFlags.testMode) {
    console.log("Protected Route - Test mode active; bypassing subscription gate");
    return <>{children}</>;
  }

  // Enforce subscription gate except on allowed pages
  const allowedPaths = ["/subscribe", "/post-checkout", "/reactivate"];
  if (subscribed === false && !allowedPaths.includes(location.pathname)) {
    console.log("Protected Route - Unsubscribed, redirecting to /reactivate");
    return <Navigate to="/reactivate" state={{ from: location }} replace />;
  }

  console.log("Protected Route - User authenticated (and subscribed if required), rendering children");
  return <>{children}</>;
}