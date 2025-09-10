import { PRICING } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Crown, Plus, Minus, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { featureFlags } from "@/config/featureFlags";

interface PricingSectionProps {
  context?: "landing" | "profile";
}

export const PricingSection: React.FC<PricingSectionProps> = ({ context = "landing" }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [individualQuantity, setIndividualQuantity] = useState(1);

  const startCheckout = async (plan: "monthly" | "yearly") => {
    try {
      const fn = featureFlags.testMode ? "public-create-checkout-sandbox" : "public-create-checkout";
      const { data, error } = await supabase.functions.invoke(fn, { body: { plan } });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast({ title: "Unable to start checkout", description: "Please try again." });
      }
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e?.message ?? "Please try again." });
    }
  };

  const buyIndividualAddon = async (quantity: number) => {
    if (context === "landing") {
      navigate(`/auth?addon=individual&quantity=${quantity}`);
      return;
    }
    try {
      const fn = featureFlags.testMode ? "purchase-addons-sandbox" : "purchase-addons";
      const { data, error } = await supabase.functions.invoke(fn, {
        body: { type: "individual", quantity },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast({ title: "Unable to open Stripe", description: "Please try again." });
      }
    } catch (e: any) {
      toast({ title: "Purchase failed", description: e?.message ?? "Please try again." });
    }
  };

  const buyBundleAddon = async () => {
    if (context === "landing") {
      navigate(`/auth?addon=bundle`);
      return;
    }
    try {
      const fn = featureFlags.testMode ? "purchase-addons-sandbox" : "purchase-addons";
      const { data, error } = await supabase.functions.invoke(fn, {
        body: { type: "bundle", quantity: 5 },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast({ title: "Unable to open Stripe", description: "Please try again." });
      }
    } catch (e: any) {
      toast({ title: "Purchase failed", description: e?.message ?? "Please try again." });
    }
  };

  return (
    <section aria-labelledby="pricing-heading" className="space-y-6">
      <div className="text-center">
        <h2 id="pricing-heading" className="text-2xl md:text-3xl font-semibold">
          Plans & Pricing
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Includes one pet account. Add more anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRICING.plans.map((plan) => (
          <Card key={plan.id} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                <span>{plan.name} Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-bold">{plan.priceText}</p>
              <p className="text-sm text-muted-foreground">{plan.includes}</p>
              <p className="text-xs text-muted-foreground">7-day free trial. Card required; billed after trial unless canceled.</p>
              <Button className="w-full bg-brand-primary text-white hover:bg-brand-primary-dark" onClick={() => startCheckout(plan.id === "monthly" ? "monthly" : "yearly")}>
                <CreditCard className="w-4 h-4" />
                <span>Start 7-day free trial</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <article className="mt-4">
        <h3 className="text-lg font-medium mb-3">Additional Pet Accounts (annual)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Individual Pet Addon with Quantity Selector */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Individual Pet Accounts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xl font-semibold">$3.99/year each</p>
                <p className="text-sm text-muted-foreground">Add as many as you need</p>
              </div>
              
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIndividualQuantity(Math.max(1, individualQuantity - 1))}
                    disabled={individualQuantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{individualQuantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIndividualQuantity(Math.min(10, individualQuantity + 1))}
                    disabled={individualQuantity >= 10}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Total: ${(3.99 * individualQuantity).toFixed(2)}/year
                </p>
                <p className="text-xs text-muted-foreground mb-3">No free trial on add-ons.</p>
                <Button 
                  className="w-full border-brand-primary text-brand-primary bg-background hover:bg-brand-primary hover:text-white" 
                  variant="outline" 
                  onClick={() => buyIndividualAddon(individualQuantity)}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Add {individualQuantity} Pet{individualQuantity > 1 ? "s" : ""}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle Addon */}
          <Card className="h-full border-2 border-brand-primary/20 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-brand-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                BEST VALUE
              </span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-brand-primary" />
                <span>Foster & Multi-Pet Bundle</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xl font-semibold">$12.99/year</p>
                <p className="text-sm text-muted-foreground">5 additional pet accounts</p>
                <p className="text-xs text-brand-primary font-medium">Save $7 vs individual pricing</p>
              </div>
              
              <div className="bg-brand-primary/5 rounded-lg p-3">
                <p className="text-sm font-medium text-brand-primary mb-1">Perfect for:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Foster families</li>
                  <li>• Multi-pet households</li>
                  <li>• Dogs, cats, horses & more</li>
                </ul>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">No free trial on add-ons.</p>
                <Button 
                  className="w-full bg-brand-primary text-white hover:bg-brand-primary-dark"
                  onClick={() => buyBundleAddon()}
                >
                  <Heart className="w-4 h-4" />
                  <span>Add 5 Pet Bundle</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>
      <p className="text-xs text-muted-foreground text-center">
        Cancel anytime. Manage from your account or the Customer Portal. See our
        <a href="/terms#cancellation" className="underline ml-1">cancellation policy</a>.
      </p>
    </section>
  );
};

export default PricingSection;
