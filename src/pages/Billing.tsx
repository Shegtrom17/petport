import { useEffect, useMemo, useState } from "react";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PRICING } from "@/config/pricing";
import { CreditCard, RefreshCcw, ShieldCheck } from "lucide-react";

interface SubStatus {
  subscribed?: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

const openUrlWithFallback = async (url: string, onCopied: (msg: string) => void) => {
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    try {
      await navigator.clipboard.writeText(url);
      onCopied("Pop-ups blocked. Portal link copied to clipboard.");
    } catch {
      onCopied("Pop-ups blocked. Please allow pop-ups or copy this URL: " + url);
    }
  }
};

export default function Billing() {
  const { toast } = useToast();
  const [status, setStatus] = useState<SubStatus>({});
  const [loading, setLoading] = useState(false);

  const origin = useMemo(() => window.location.origin, []);
  const canonicalUrl = `${origin}/billing`;

  useEffect(() => {
    const linkId = "canonical-link";
    let link = document.querySelector(`link#${linkId}`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
  }, [canonicalUrl]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setStatus(data as SubStatus);
    } catch (e: any) {
      console.error("check-subscription error", e);
      toast({ title: "Unable to fetch subscription", description: e?.message ?? "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        await openUrlWithFallback(data.url, (msg) => toast({ title: "Link copied", description: msg }));
      } else {
        throw new Error("No portal URL received");
      }
    } catch (e: any) {
      const message: string = e?.message || String(e);
      const configuredMsg = message.includes("No configuration provided")
        ? "Stripe Customer Portal isn’t configured for this mode. Save a default configuration in Stripe → Settings → Billing → Customer Portal."
        : message;
      toast({ title: "Couldn't open customer portal", description: configuredMsg });
    }
  };

  const buyAddon = async (count: 1 | 3 | 5) => {
    try {
      const { data, error } = await supabase.functions.invoke("purchase-addons", { body: { bundle: count } });
      if (error) throw error;
      if (data?.url) {
        await openUrlWithFallback(data.url, (msg) => toast({ title: "Link copied", description: msg }));
      } else {
        toast({ title: "Unable to open Stripe", description: "Please try again." });
      }
    } catch (e: any) {
      toast({ title: "Purchase failed", description: e?.message ?? "Please try again." });
    }
  };

  const endDate = status.subscription_end ? new Date(status.subscription_end) : null;

  return (
    <PWALayout>
      <MetaTags
        title="Billing & Add-ons – PetPort"
        description="Manage subscription, update billing, and purchase additional pet accounts."
        url={canonicalUrl}
      />
      <AppHeader title="Billing & Add-ons" />
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Subscription Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {status.subscribed ? (
                <div>
                  <p>Active plan: <span className="font-medium text-foreground">{status.subscription_tier ?? "—"}</span></p>
                  {endDate && (
                    <p>Renews on: <span className="font-medium text-foreground">{endDate.toLocaleDateString()}</span></p>
                  )}
                </div>
              ) : (
                <p>You don’t have an active subscription yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleManageSubscription}>Manage Subscription</Button>
              <Button variant="outline" onClick={fetchStatus} disabled={loading}>
                <RefreshCcw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <section aria-labelledby="addons-heading" className="space-y-3">
          <h2 id="addons-heading" className="text-lg font-medium">Additional Pet Accounts (annual)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING.addons.map((addon) => (
              <Card key={addon.id}>
                <CardHeader>
                  <CardTitle>{addon.count} Pet{addon.count > 1 ? "s" : ""}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xl font-semibold">{addon.priceText}</p>
                  <Button className="w-full" variant="outline" onClick={() => buyAddon(addon.count as 1 | 3 | 5)}>
                    <CreditCard className="w-4 h-4" />
                    <span>Add {addon.count} Pet{addon.count > 1 ? "s" : ""}</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Cancel anytime. Manage from your account or the Customer Portal. See our
            <a href="/terms#cancellation" className="underline ml-1">cancellation policy</a>.
          </p>
        </section>
      </div>
    </PWALayout>
  );
}
