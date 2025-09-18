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
}

export const PricingSection: React.FC<PricingSectionProps> = ({ context = "landing" }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = (plan: "monthly" | "yearly") => {
    navigate(`/signup?plan=${plan}`);
  };

  const buyAdditionalPets = async (quantity: number) => {
    if (context === "landing") {
      navigate("/signup?plan=monthly");
      return;
    }
    
    try {
      setIsLoading(true);
      const fn = featureFlags.testMode ? "purchase-addons-sandbox" : "purchase-addons";
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

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-center">Additional Pet Accounts</h3>
        
        {/* Additional Pet Accounts */}
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl">{PRICING.addons[0].name}</CardTitle>
            <CardDescription>
              {PRICING.addons[0].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {PRICING.addons[0].getTierText(selectedQuantity)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedQuantity >= PRICING.addons[0].tierBreakpoint ? "Volume pricing (5+ pets)" : "Standard pricing (1-4 pets)"}
                </div>
              </div>
              
              {selectedQuantity >= PRICING.addons[0].tierBreakpoint && (
                <div className="text-xs text-green-600 font-medium text-center">
                  Save with volume pricing!
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <Label htmlFor="quantity" className="text-sm">Quantity:</Label>
              <Select value={selectedQuantity.toString()} onValueChange={(value) => setSelectedQuantity(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: PRICING.addons[0].maxQuantity }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Total: ${((PRICING.addons[0].getTierPrice(selectedQuantity) * selectedQuantity) / 100).toFixed(2)}/year
            </div>
            
            <Button 
              onClick={() => buyAdditionalPets(selectedQuantity)} 
              className="w-full bg-brand-primary text-white hover:bg-brand-primary-dark"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Add Pet Accounts"}
            </Button>
            
            <div className="text-xs text-muted-foreground text-center">
              Deleting a pet frees a slot immediately. To stop paying for extra slots, reduce quantity in "Manage Subscription".
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Cancel anytime. Manage from your account or the Customer Portal. See our
        <a href="/terms#cancellation" className="underline ml-1">cancellation policy</a>.
      </p>
    </section>
  );
};

export default PricingSection;
