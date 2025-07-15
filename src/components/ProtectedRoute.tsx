
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("Protected Route - Current location:", location.pathname);
    console.log("Protected Route - Auth Status:", { 
      user: !!user, 
      isLoading, 
      pathname: location.pathname 
    });
  }, [user, isLoading, location.pathname]);

  // Show loading state
  if (isLoading) {
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

  console.log("Protected Route - User authenticated, rendering children");
  return <>{children}</>;
}
