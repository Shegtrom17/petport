import { PRICING } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreditCard, Crown, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { featureFlags } from "@/config/featureFlags";

interface PricingSectionProps {
  context?: "landing" | "profile";
  referralCode?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ context = "landing", referralCode }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [additionalPetsForCheckout, setAdditionalPetsForCheckout] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = async (plan: "monthly" | "yearly") => {
    try {
      setIsLoading(true);
      
      // Landing page uses public checkout (no auth required)
      // Profile/subscribe page uses authenticated checkout
      const functionName = context === "landing" ? "public-create-checkout" : "create-checkout";
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          plan,
          referral_code: referralCode,
          additional_pets: additionalPetsForCheckout
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to start checkout process",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({
        title: "Error", 
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buyAdditionalPets = async (quantity: number) => {
    try {
      setIsLoading(true);
      
      // Landing page uses public checkout, profile uses authenticated
      const fn = context === "landing" ? "public-create-checkout" : "purchase-addons";
      const body = context === "landing" 
        ? { plan: "monthly", referral_code: referralCode }
        : { quantity };
      
      const { data, error } = await supabase.functions.invoke(fn, {
        body
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

  const totalPetsForCheckout = 1 + additionalPetsForCheckout;
  const additionalPetsCost = additionalPetsForCheckout * 3.99;

  return (
    <section aria-labelledby="pricing-heading" className="space-y-6">
      <div className="text-center">
        <h2 id="pricing-heading" className="text-2xl md:text-3xl font-semibold">
          Plans & Pricing
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with one pet, add more during checkout. Additional pet slots are charged annually.
        </p>
      </div>

      {/* Pet Quantity Selector */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center">
              <Label className="text-base font-medium">How many pets?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Select total number of pet accounts you need
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdditionalPetsForCheckout(Math.max(0, additionalPetsForCheckout - 1))}
                disabled={additionalPetsForCheckout === 0}
              >
                -
              </Button>
              <div className="text-center min-w-[120px]">
                <div className="text-3xl font-bold text-primary">{totalPetsForCheckout}</div>
                <div className="text-xs text-muted-foreground">
                  pet account{totalPetsForCheckout !== 1 ? 's' : ''}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdditionalPetsForCheckout(Math.min(19, additionalPetsForCheckout + 1))}
                disabled={additionalPetsForCheckout === 19}
              >
                +
              </Button>
            </div>
            {additionalPetsForCheckout > 0 && (
              <div className="text-center text-sm space-y-1 p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Price Breakdown:</div>
                <div className="text-muted-foreground">Base membership: included in plan</div>
                <div className="text-muted-foreground">
                  {additionalPetsForCheckout} additional pet{additionalPetsForCheckout !== 1 ? 's' : ''}: ${additionalPetsCost.toFixed(2)}/year
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRICING.plans.map((plan) => {
          const basePriceNum = plan.priceCents / 100;
          // Both plans show total cost, but monthly shows plan cost separately
          const totalPrice = plan.id === "yearly" 
            ? basePriceNum + additionalPetsCost
            : basePriceNum;
          const upfrontPetCost = plan.id === "monthly" && additionalPetsForCheckout > 0 
            ? additionalPetsCost 
            : 0;
          
          return (
            <Card key={plan.id} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  <span>{plan.name} Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold">
                    ${totalPrice.toFixed(2)}/{plan.interval}
                  </p>
                  {additionalPetsForCheckout > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.id === "yearly" 
                        ? `$${basePriceNum.toFixed(2)} base + $${additionalPetsCost.toFixed(2)} for ${additionalPetsForCheckout} pet${additionalPetsForCheckout !== 1 ? 's' : ''}`
                        : `$${basePriceNum.toFixed(2)}/${plan.interval} + $${additionalPetsCost.toFixed(2)} upfront for ${additionalPetsForCheckout} pet${additionalPetsForCheckout !== 1 ? 's' : ''} (annual)`
                      }
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Includes {totalPetsForCheckout} pet account{totalPetsForCheckout !== 1 ? 's' : ''}
                </p>
                {plan.id === "monthly" && additionalPetsForCheckout > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Additional pets charged annually ($3.99/year each)
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  7-day free trial. Card required; billed after trial unless canceled.
                </p>
                <Button 
                  variant="azure" 
                  className="w-full" 
                  onClick={() => startCheckout(plan.id === "monthly" ? "monthly" : "yearly")}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Start 7-day free trial</span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Need to add more pets later? You can purchase additional slots anytime from your billing page.
        </p>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Cancel anytime. Manage from your account or the Customer Portal. See our
        <a href="/terms#cancellation" className="underline ml-1">cancellation policy</a>.
      </p>
    </section>
  );
};

export default PricingSection;
