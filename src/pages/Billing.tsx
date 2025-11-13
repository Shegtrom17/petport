import { useEffect, useMemo, useState } from "react";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AzureButton } from "@/components/ui/azure-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MetaTags } from "@/components/MetaTags";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PRICING } from "@/config/pricing";
import { CreditCard, RefreshCcw, ShieldCheck } from "lucide-react";
import { featureFlags } from "@/config/featureFlags";

interface SubStatus {
  subscribed?: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

const openUrlWithFallback = async (url: string, onCopied: (msg: string) => void) => {
  // Use same-tab navigation to avoid popup blocking issues
  window.location.href = url;
};

export default function Billing() {
  const { toast } = useToast();
  const [status, setStatus] = useState<SubStatus>({});
  const [loading, setLoading] = useState(false);
  const [individualQuantity, setIndividualQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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
      const { data, error } = await supabase.functions.invoke("check-subscription-safe");
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
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: {}
      });
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

  const buyAddon = async (quantity: number = 1) => {
    try {
      setIsLoading(true);
      const fn = "purchase-addons";
      const { data, error } = await supabase.functions.invoke(fn, {
        body: { quantity }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error starting addon checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endDate = status.subscription_end ? new Date(status.subscription_end) : null;

  return (
    <PWALayout>
      <MetaTags
        title="Billing & Add-ons – PetPort"
        description="Manage subscription, update billing, and purchase additional pet accounts."
        url={canonicalUrl}
        noindex={true}
      />
      <AppHeader title="Billing & Add-ons" showHelpIcon />
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
              <AzureButton onClick={handleManageSubscription}>Manage Subscription</AzureButton>
              <Button variant="outline" onClick={fetchStatus} disabled={loading}>
                <RefreshCcw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <section aria-labelledby="addons-heading" className="space-y-3">
          <h2 id="addons-heading" className="text-lg font-medium">Additional Pet Accounts (annual)</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Pet Accounts</CardTitle>
              <CardDescription>
                Add capacity for more pets with tiered pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {individualQuantity >= 5 ? "$2.60/year" : "$3.99/year"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {individualQuantity >= 5 ? "Volume pricing (5+ pets)" : "Standard pricing (1-4 pets)"}
                  </div>
                  {individualQuantity >= 5 && (
                    <div className="text-xs text-green-600 font-medium">
                      Save with volume pricing!
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <Label htmlFor="individual-quantity" className="text-sm">Quantity:</Label>
                  <Select value={individualQuantity.toString()} onValueChange={(value) => setIndividualQuantity(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  Total: ${(((individualQuantity >= 5 ? 260 : 399) * individualQuantity) / 100).toFixed(2)}/year
                </div>
                
                <AzureButton 
                  onClick={() => buyAddon(individualQuantity)} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Add Pet Accounts"}
                </AzureButton>
                
                <div className="text-xs text-muted-foreground text-center">
                  Deleting a pet frees a slot immediately. To stop paying for extra slots, reduce quantity in "Manage Subscription".
                </div>
              </div>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Cancel anytime. Manage from your account or the Customer Portal. See our
            <a href="/terms#cancellation" className="underline ml-1">cancellation policy</a>.
          </p>
        </section>

        {/* Billing Contact */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>Billing questions? Email <a href="mailto:billing@petport.app" className="text-primary hover:underline">billing@petport.app</a></p>
          <p className="text-xs mt-1">We respond within 24 hours</p>
        </div>
      </div>
    </PWALayout>
  );
}
