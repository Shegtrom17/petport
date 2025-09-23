import { MetaTags } from "@/components/MetaTags";
import PricingSection from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { featureFlags } from "@/config/featureFlags";

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const openPortal = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { testMode: featureFlags.testMode }
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
    } catch (e: any) {
      toast({ title: "Status check failed", description: e?.message ?? "Please try again." });
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
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <MetaTags title="Complete Subscription - PetPort" description="Subscribe to continue using PetPort." url={window.location.href} />
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Complete Your Subscription</h1>
          <p className="text-sm text-muted-foreground mt-2">All plans include a 7-day free trial. Card required; billed after trial unless canceled.</p>
          {user && (
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button onClick={openPortal} disabled={loadingPortal}>
                  {loadingPortal ? "Opening..." : "Manage Subscription"}
                </Button>
              </div>
              {featureFlags.showBillingTroubleshooting && (
                <p className="text-xs text-muted-foreground">
                  Tip: If the portal doesn't open, allow pop-ups; we’ll copy the link for you.
                </p>
              )}
            </div>
          )}
        </header>
        <PricingSection context="profile" />
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
