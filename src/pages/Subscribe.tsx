import { MetaTags } from "@/components/MetaTags";
import PricingSection from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { featureFlags } from "@/config/featureFlags";
import { X } from "lucide-react";

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [processingTransfer, setProcessingTransfer] = useState(false);

  // Extract transfer token from URL params
  const searchParams = new URLSearchParams(location.search);
  const transferToken = searchParams.get('transfer_token');
  const upgrade = searchParams.get('upgrade');
  const referralCode = searchParams.get('ref');

  const openPortal = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: {}
      });
      if (error) throw error;
      const url = data?.url as string | undefined;
      if (url) {
        window.location.href = url;
      } else {
        toast({ title: "Unable to open portal", description: "Please try again." });
      }
    } catch (e: any) {
      toast({ title: "Portal error", description: e?.message ?? "Please try again." });
    } finally {
      setLoadingPortal(false);
    }
  };

  // Auto-refresh subscription status on mount/focus; no manual button
  const refreshStatus = async () => {
    try {
      await supabase.functions.invoke("check-subscription");
      
      // If there's a transfer token, check if we can complete the transfer now
      if (transferToken && user) {
        await checkAndCompleteTransfer();
      }
    } catch (e: any) {
      toast({ title: "Status check failed", description: e?.message ?? "Please try again." });
    }
  };

  // Check if transfer can be completed after subscription verification
  const checkAndCompleteTransfer = async () => {
    if (!transferToken || !user || processingTransfer) return;
    
    setProcessingTransfer(true);
    try {
      // Check transfer status first
      const { data: statusData, error: statusError } = await supabase.functions.invoke("transfer-pet", {
        body: { action: "status", token: transferToken },
      });

      if (statusError || !statusData) {
        console.log("Transfer status check failed:", statusError);
        return;
      }

      // If user doesn't need subscription or upgrade anymore, try to complete transfer
      if (!statusData.recipient_needs_subscription && !statusData.recipient_needs_upgrade) {
        const { data, error } = await supabase.functions.invoke("transfer-pet", {
          body: { action: "accept", token: transferToken },
        });

        if (data?.ok) {
          toast({ 
            title: "Transfer complete!", 
            description: `${statusData.pet_name || 'Pet'} has been added to your account.` 
          });
          navigate("/app");
        } else if (error) {
          console.log("Transfer completion failed:", error);
        }
      }
    } catch (e: any) {
      console.error("Error checking transfer:", e);
    } finally {
      setProcessingTransfer(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    const onFocus = () => refreshStatus();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshStatus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [transferToken, user]); // Re-run when transfer token or user changes


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <MetaTags title="Complete Subscription - PetPort" description="Subscribe to continue using PetPort." url={window.location.href} noindex={true} />
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/app")}
          className="absolute top-4 right-4 z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
        <header className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">
            {transferToken ? "Complete Your Subscription to Claim Pet Profile" : "Complete Your Subscription"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {transferToken 
              ? "Subscribe now to receive the pet profile that was shared with you. All plans include a 7-day free trial."
              : "All plans include a 7-day free trial. Card required; billed after trial unless canceled."
            }
          </p>
          {processingTransfer && (
            <div className="mt-4 p-3 bg-azure/10 border border-azure/20 rounded-lg">
              <p className="text-sm text-azure">Checking transfer status...</p>
            </div>
          )}
        </header>
        <PricingSection context="profile" referralCode={referralCode || undefined} />
        <section aria-labelledby="cancellation-policy" className="mt-6 space-y-3">
          <h2 id="cancellation-policy" className="text-lg font-medium">Cancellation Policy</h2>
          <p className="text-sm text-muted-foreground">
            You may cancel your PetPort subscription at any time by logging into your account settings. When you cancel, your subscription will remain active until the end of your current billing cycle. We do not provide prorated refunds for partial months or years. For monthly plans, access will continue until the end of the current month. For annual plans, access will continue until the end of the current year.
          </p>
          <p className="text-sm text-muted-foreground">
            Your account and stored pet information will remain accessible until your subscription expires. You may download your records at any time before the end date. See our
            <a href="/terms#cancellation" className="underline ml-1">full cancellation terms</a>.
          </p>
        </section>
      </div>
    </div>
  );
}