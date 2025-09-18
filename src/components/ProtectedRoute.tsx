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

  // Detect if we're in Lovable preview environment
  const isPreview = window.location.hostname.includes('lovableproject.com') || 
                   window.location.hostname.includes('lovable.app');

  useEffect(() => {
    console.log("Protected Route - Current location:", location.pathname);
    console.log("Protected Route - Auth Status:", { user: !!user, isLoading, pathname: location.pathname });
  }, [user, isLoading, location.pathname]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("subscribers")
          .select("subscribed, status, grace_period_end")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        // Consider subscription active if:
        // 1. subscribed = true (legacy check), OR
        // 2. status = 'active', OR  
        // 3. status = 'grace' and grace period hasn't ended
        const now = new Date();
        const isActive = data?.subscribed || 
                         data?.status === 'active' ||
                         (data?.status === 'grace' && 
                          (!data.grace_period_end || new Date(data.grace_period_end) > now));
        
        setSubscribed(isActive);
        console.log("Protected Route - Subscription status:", { 
          subscribed: data?.subscribed,
          status: data?.status,
          gracePeriodEnd: data?.grace_period_end,
          isActive 
        });
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

  // Show loading state with timeout (skip subscription check wait in test mode)
  if (isLoading || (user && checkingSub && !featureFlags.testMode)) {
    console.log("Protected Route - Showing loading state");
    
    // Add timeout fallback after 10 seconds
    setTimeout(() => {
      if (checkingSub) {
        console.warn("Protected Route - Subscription check timeout, allowing access");
        setCheckingSub(false);
        setSubscribed(true); // Default to allowing access on timeout
      }
    }, 10000);
    
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

  // In test mode or preview, bypass subscription gate
  if (featureFlags.testMode || isPreview) {
    console.log("Protected Route - Test mode or preview active; bypassing subscription gate");
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