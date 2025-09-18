import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AzureButton } from "@/components/ui/azure-button";
import { MetaTags } from "@/components/MetaTags";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import { AlertCircle, CreditCard, RefreshCw } from "lucide-react";

interface SubscriptionStatus {
  subscribed?: boolean;
}

export default function Reactivate() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const url = typeof window !== 'undefined' ? window.location.href : 'https://petport.app/reactivate';

  const checkStatus = async (showToast = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setLastError(null);
      const { data, error } = await supabase
        .from("subscribers")
        .select("subscribed, status, grace_period_end")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Check if subscription is active using same logic as ProtectedRoute
      const now = new Date();
      const isActive = data?.subscribed || 
                       data?.status === 'active' ||
                       (data?.status === 'grace' && 
                        (!data.grace_period_end || new Date(data.grace_period_end) > now));
      
      console.log("Reactivate - Subscription check:", { 
        subscribed: data?.subscribed,
        status: data?.status,
        gracePeriodEnd: data?.grace_period_end,
        isActive 
      });
      
      if (isActive) {
        if (showToast) {
          toast({
            title: "Success",
            description: "Subscription reactivated! Redirecting...",
          });
        }
        navigate('/app');
        return;
      } else if (showToast) {
        toast({
          title: "Still Inactive",
          description: "Subscription still inactive. Please try again or contact support.",
          variant: "destructive"
        });
      }
      
      setStatus({ subscribed: false });
    } catch (error) {
      console.error("Error checking subscription status:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to check subscription status";
      setLastError(errorMsg);
      if (showToast) {
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
      setStatus({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user, navigate]);

  // Listen for window focus to recheck subscription when user returns from Stripe
  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused - rechecking subscription status");
      checkStatus(true);
    };

    window.addEventListener('focus', handleFocus);
    
    // Also check periodically while on this page
    const interval = setInterval(() => {
      checkStatus();
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user]);

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setPortalLoading(true);
    setRetryAttempts(prev => prev + 1);
    
    try {
      // For unsubscribed users, create a new checkout session with trial
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'monthly' }
      });

      if (error) throw error;

      if (data?.url) {
        try {
          // If running inside an iframe (Lovable preview), open in a new tab to avoid X-Frame-Options issues
          if (window.top !== window.self) {
            window.open(data.url, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = data.url;
          }
          
          toast({
            title: "Checkout Opened",
            description: "Opening subscription checkout with 7-day free trial...",
          });
          
          // Start checking for reactivation after user goes to checkout
          setTimeout(() => {
            checkStatus(true);
          }, 5000);
        } catch {
          // Fallback to opening in a new tab
          window.open(data.url, '_blank', 'noopener,noreferrer');
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error accessing checkout:', error);
      const errorMsg = error instanceof Error ? error.message : "Unable to access subscription checkout";
      setLastError(errorMsg);
      toast({
        title: "Error",
        description: `${errorMsg}. Please contact support.`,
        variant: "destructive"
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRetryCheck = () => {
    setRetryAttempts(prev => prev + 1);
    checkStatus(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <PWALayout>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-100">
          <div className="animate-pulse text-navy-800">Loading...</div>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout>
      <MetaTags
        title="Reactivate Subscription - PetPort"
        description="Reactivate your PetPort subscription to continue managing your pet profiles."
        url={url}
      />
      <AppHeader title="Subscription Required" />
      
      <main className="p-4 max-w-2xl mx-auto">
        <Card className="border-destructive/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">
              Subscription Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center leading-relaxed">
              Please reactivate your subscription to continue managing your pet profiles.
            </p>

            <div className="flex flex-col gap-3">
              <AzureButton 
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full"
                size="lg"
              >
                {portalLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Reactivate Subscription
              </AzureButton>
              
              <Button 
                variant="secondary" 
                onClick={handleRetryCheck}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Check Status
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
              
              {lastError && (
                <div className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <strong>Error:</strong> {lastError}
                  {retryAttempts > 0 && (
                    <span className="block mt-1 text-xs opacity-75">
                      Retry attempts: {retryAttempts}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Need help? Contact us at{' '}
              <a href="mailto:support@petport.app" className="text-primary hover:underline">
                support@petport.app
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </PWALayout>
  );
}