import { PRICING } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Crown, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { useNavigate } from "react-router-dom";

interface PricingSectionProps {
  context?: "landing" | "profile";
}

export const PricingSection: React.FC<PricingSectionProps> = ({ context = "landing" }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const startCheckout = async (plan: "monthly" | "yearly") => {
    if (context === "landing") {
      navigate(`/auth?plan=${plan}`);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan },
      });
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

  const buyAddon = async (count: 1 | 3 | 5) => {
    if (context === "landing") {
      navigate(`/auth?addon=${count}`);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("purchase-addons", {
        body: { bundle: count },
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
              <Button className="w-full" onClick={() => startCheckout(plan.id === "monthly" ? "monthly" : "yearly")}> 
                <CreditCard className="w-4 h-4" />
                <span>Subscribe {plan.name}</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <article className="mt-4">
        <h3 className="text-lg font-medium mb-3">Additional Pet Accounts (annual)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRICING.addons.map((addon) => (
            <Card key={addon.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>{addon.count} Pet{addon.count > 1 ? "s" : ""}</span>
                </CardTitle>
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
      </article>
    </section>
  );
};

export default PricingSection;
