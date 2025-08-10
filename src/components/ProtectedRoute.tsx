import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
        const { data, error } = await supabase
          .from("subscribers")
          .select("subscribed")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        const isSub = data?.subscribed === true;
        setSubscribed(isSub);
        console.log("Protected Route - Subscription status:", isSub);
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

  // Show loading state
  if (isLoading || (user && checkingSub)) {
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

  // Enforce subscription gate except on allowed pages
  const allowedPaths = ["/subscribe", "/post-checkout"];
  if (subscribed === false && !allowedPaths.includes(location.pathname)) {
    console.log("Protected Route - Unsubscribed, redirecting to /subscribe");
    return <Navigate to="/subscribe" state={{ from: location }} replace />;
  }

  console.log("Protected Route - User authenticated (and subscribed if required), rendering children");
  return <>{children}</>;
}
