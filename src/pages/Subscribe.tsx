import { MetaTags } from "@/components/MetaTags";
import PricingSection from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [loadingCopy, setLoadingCopy] = useState(false);

  const openPortal = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const url = data?.url as string | undefined;
      if (url) {
        const win = window.open(url, "_blank", "noopener,noreferrer");
        if (!win) {
          try {
            await navigator.clipboard.writeText(url);
            toast({ title: "Pop-up blocked", description: "Link copied. Paste it into a new tab." });
          } catch {
            toast({ title: "Pop-up blocked", description: "Copy failed. Please allow pop-ups or try again." });
          }
        }
      } else {
        toast({ title: "Unable to open portal", description: "Please try again." });
      }
    } catch (e: any) {
      toast({ title: "Portal error", description: e?.message ?? "Please try again." });
    } finally {
      setLoadingPortal(false);
    }
  };

  const copyPortalLink = async () => {
    setLoadingCopy(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const url = data?.url as string | undefined;
      if (url) {
        await navigator.clipboard.writeText(url);
        toast({ title: "Portal link copied", description: "Paste it in your browser to manage subscription." });
      } else {
        toast({ title: "Unable to get link", description: "Please try again." });
      }
    } catch (e: any) {
      toast({ title: "Portal error", description: e?.message ?? "Please try again." });
    } finally {
      setLoadingCopy(false);
    }
  };

  const refreshStatus = async () => {
    setLoadingRefresh(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      const active = data?.subscribed ? "Active" : "Inactive";
      const tier = data?.subscription_tier ?? "—";
      const end = data?.subscription_end ? new Date(data.subscription_end).toLocaleDateString() : null;
      toast({
        title: `Subscription: ${active}`,
        description: `Plan: ${tier}${end ? `, current period ends ${end}` : ""}`,
      });
    } catch (e: any) {
      toast({ title: "Status check failed", description: e?.message ?? "Please try again." });
    } finally {
      setLoadingRefresh(false);
    }
  };

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
                <Button variant="outline" onClick={copyPortalLink} disabled={loadingCopy}>
                  {loadingCopy ? "Copying..." : "Copy portal link"}
                </Button>
                <Button variant="ghost" onClick={refreshStatus} disabled={loadingRefresh}>
                  {loadingRefresh ? "Refreshing..." : "Refresh status"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: If the portal doesn't open, allow pop-ups or use the copy link.
              </p>
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
