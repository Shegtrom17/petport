import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CreditCard, RefreshCw } from "lucide-react";

interface SubscriptionStatus {
  status: 'active' | 'grace' | 'suspended' | 'canceled';
  grace_period_end?: string;
  payment_failed_at?: string;
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
        const { data, error } = await supabase
          .from("subscribers")
          .select("status, grace_period_end, payment_failed_at")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (error) throw error;
        if (data) {
          setStatus(data as SubscriptionStatus);
          // If user is actually active, redirect to app
          if (data.status === 'active') {
            navigate('/app');
          }
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
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
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { testMode: false }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
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

  const getStatusMessage = () => {
    if (!status) return { title: "Subscription Required", message: "Please reactivate your subscription to continue." };
    
    switch (status.status) {
      case 'grace':
        const graceEnd = status.grace_period_end ? new Date(status.grace_period_end) : null;
        const daysLeft = graceEnd ? Math.ceil((graceEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
        return {
          title: "Payment Failed - Grace Period",
          message: `Your payment failed but you have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to resolve this. Please update your payment method to continue using PetPort.`
        };
      case 'suspended':
        return {
          title: "Subscription Suspended",
          message: "Your subscription has been suspended due to payment issues. Please reactivate your subscription to regain access to your pet profiles."
        };
      case 'canceled':
        return {
          title: "Subscription Canceled",
          message: "Your subscription has been canceled. Reactivate your subscription to continue managing your pet profiles."
        };
      default:
        return {
          title: "Subscription Required",
          message: "Please activate a subscription to access your pet profiles."
        };
    }
  };

  const statusInfo = getStatusMessage();

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
              {statusInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center leading-relaxed">
              {statusInfo.message}
            </p>
            
            {status?.status === 'grace' && status.grace_period_end && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Grace period ends:</strong>{' '}
                  {new Date(status.grace_period_end).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
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
                {status?.status === 'grace' ? 'Update Payment Method' : 'Reactivate Subscription'}
              </Button>
              
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