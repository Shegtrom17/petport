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
import { featureFlags } from "@/config/featureFlags";
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

  const url = typeof window !== 'undefined' ? window.location.href : 'https://petport.app/reactivate';

  useEffect(() => {
    if (!user) return;
    
    const checkStatus = async () => {
      try {
        // Use old schema until migration is properly applied
        const { data, error } = await supabase
          .from("subscribers")
          .select("subscribed")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data?.subscribed) {
          // If user is subscribed, redirect to app
          navigate('/app');
          return;
        }
        
        setStatus({ subscribed: false });
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setStatus({ subscribed: false });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, navigate]);

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setPortalLoading(true);
    try {
      // In test mode, simulate subscription reactivation for preview testing
      if (featureFlags.testMode) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        toast({
          title: "Test Mode - Subscription Reactivated",
          description: "This is a test simulation. Your subscription has been marked as active.",
        });
        // Redirect to app after successful "reactivation"
        setTimeout(() => {
          navigate('/app');
        }, 1500);
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { testMode: false }
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
        } catch {
          // Fallback to opening in a new tab
          window.open(data.url, '_blank', 'noopener,noreferrer');
        }
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast({
        title: "Error",
        description: "Unable to access subscription management. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setPortalLoading(false);
    }
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
                variant="outline" 
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
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