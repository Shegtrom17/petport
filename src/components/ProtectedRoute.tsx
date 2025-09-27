import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { useIOSResilience } from "@/hooks/useIOSResilience";
import { SafeErrorBoundary } from "@/components/SafeErrorBoundary";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [checkingSub, setCheckingSub] = useState<boolean>(true);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const { safeAsync, isIOSDevice } = useIOSResilience();

  // Link subscriber before checking subscription status
  const [linkingSubscription, setLinkingSubscription] = useState<boolean>(false);

  useEffect(() => {
    console.log("Protected Route - Current location:", location.pathname);
    console.log("Protected Route - Auth Status:", { user: !!user, isLoading, pathname: location.pathname });
  }, [user, isLoading, location.pathname]);

  useEffect(() => {
    const linkAndCheckSubscription = async () => {
      if (!user) return;
      
      setLinkingSubscription(true);
      
      const result = await safeAsync(
        async () => {
          // First, try to link any orphaned subscription
          console.log("Protected Route - Linking subscription for user:", user.email);
          
          const { data: linkResult, error: linkError } = await supabase.functions.invoke('link-subscriber');
          
          if (linkError) {
            console.warn("Protected Route - Link subscriber error:", linkError);
          } else {
            console.log("Protected Route - Link subscriber result:", linkResult);
          }
          
          // Then check subscription status
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
          
          console.log("Protected Route - Subscription status after linking:", { 
            subscribed: data?.subscribed,
            status: data?.status,
            gracePeriodEnd: data?.grace_period_end,
            isActive 
          });
          
          return isActive;
        },
        true, // Fallback to allowing access on error
        'subscription-link-and-check'
      );
      
      setSubscribed(result);
      setLinkingSubscription(false);
      setCheckingSub(false);
    };
    
    if (user) {
      setCheckingSub(true);
      linkAndCheckSubscription();
    }
  }, [user, safeAsync]);

  // Show loading state with timeout
  if (isLoading || (user && (checkingSub || linkingSubscription))) {
    console.log("Protected Route - Showing loading state");
    
    // Shorter timeout for iOS devices
    const timeoutMs = isIOSDevice ? 5000 : 8000;
    
    setTimeout(() => {
      if (checkingSub) {
        console.warn("Protected Route - Subscription check timeout, allowing access");
        setCheckingSub(false);
        setSubscribed(true); // Default to allowing access on timeout
      }
    }, timeoutMs);
    
    return (
      <SafeErrorBoundary level="page" name="Loading Protection">
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-100">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-pulse text-navy-800">
              {linkingSubscription ? "Linking subscription..." : "Loading PetPort..."}
            </div>
            {isIOSDevice && (
              <div className="text-xs text-navy-600">
                iOS detected - optimizing experience
              </div>
            )}
          </div>
        </div>
      </SafeErrorBoundary>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("Protected Route - No user, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }


  // Enforce subscription gate except on allowed pages
  const allowedPaths = ["/subscribe", "/post-checkout", "/reactivate"];
  if (subscribed === false && !allowedPaths.includes(location.pathname)) {
    console.log("Protected Route - Unsubscribed, redirecting to /subscribe");
    return <Navigate to="/subscribe" state={{ from: location }} replace />;
  }

  console.log("Protected Route - User authenticated (and subscribed if required), rendering children");
  return (
    <SafeErrorBoundary level="page" name="Protected Route">
      {children}
    </SafeErrorBoundary>
  );
}