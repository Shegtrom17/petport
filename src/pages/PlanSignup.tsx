import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PRICING } from "@/config/pricing";
import { featureFlags } from "@/config/featureFlags";

const SignupForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [additionalPets, setAdditionalPets] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const plan = searchParams.get("plan") || "monthly";
  const planData = PRICING.plans.find(p => p.id === plan) || PRICING.plans[0];
  const addonData = PRICING.addons[0];
  
  // Generate correlation ID for debugging
  const corrId = useRef(`signup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const calculateTotal = () => {
    const planPrice = planData.priceCents;
    const addonPrice = additionalPets * addonData.getTierPrice(additionalPets);
    return { planPrice, addonPrice, total: planPrice + addonPrice };
  };

  const pricing = calculateTotal();

  // Calculate trial end date (7 days from now)
  const getTrialEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    if (!["monthly", "yearly"].includes(plan)) {
      navigate("/?error=invalid-plan");
    }
  }, [plan, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log(`🚀 [${corrId.current}] Starting hosted checkout process for plan: ${plan}, additional pets: ${additionalPets}`);
    
    try {
      setIsLoading(true);
      console.log(`🔁 [${corrId.current}] Redirecting to hosted Stripe Checkout...`);
      const fnName = featureFlags.testMode ? "public-create-checkout-sandbox" : "public-create-checkout";
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: { plan }
      });
      if (error || !data?.url) {
        console.error(`❌ [${corrId.current}] Failed to create Stripe Checkout session:`, error || data);
        toast({
          title: "Payment Error",
          description: `Could not start checkout. Please try again. (ID: ${corrId.current})`,
          variant: "destructive",
        });
        return;
      }
      window.location.href = data.url;
    } catch (err: any) {
      console.error(`❌ [${corrId.current}] Checkout error:`, err);
      toast({
        title: "Checkout Error",
        description: `${err.message || "An unexpected error occurred. Please try again."} (ID: ${corrId.current})`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PP</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PetPort</span>
          </div>
          
          <div>
            <CardTitle className="text-2xl">Start Your Free Trial</CardTitle>
            <CardDescription>Complete your signup and begin your 7-day free trial</CardDescription>
          </div>

          {/* Selected Plan Display */}
          <div className="bg-brand-subtle p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-primary">{planData.name} Plan</p>
                <p className="text-sm text-muted-foreground">{planData.includes}</p>
              </div>
              <Badge variant="secondary">{planData.priceText}</Badge>
            </div>
            
            {additionalPets > 0 && (
              <>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span>{additionalPets} additional pet{additionalPets > 1 ? 's' : ''}</span>
                  <span>${(pricing.addonPrice / 100).toFixed(2)}/{planData.interval}</span>
                </div>
              </>
            )}
            
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>7-day free trial • Cancel anytime</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Additional Pets */}
            <div className="space-y-3">
              <Label>Additional Pet Accounts (Optional)</Label>
              <Select value={additionalPets.toString()} onValueChange={(value) => setAdditionalPets(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 21 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i === 0 ? "No additional pets" : `${i} additional pet${i > 1 ? 's' : ''} - ${addonData.getTierText(i)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="p-4 border rounded-lg bg-background text-sm text-muted-foreground">
                You'll complete payment securely on Stripe's checkout page.
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>You will not be charged today. Trial starts immediately.</span>
              </div>
            </div>

            {/* Total Pricing */}
            <div className="bg-background border rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>{planData.name} Plan</span>
                <span>${(pricing.planPrice / 100).toFixed(2)}/{planData.interval}</span>
              </div>
              {additionalPets > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{additionalPets} additional pet{additionalPets > 1 ? 's' : ''}</span>
                  <span>${(pricing.addonPrice / 100).toFixed(2)}/{planData.interval}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total after trial</span>
                <span>${(pricing.total / 100).toFixed(2)}/{planData.interval}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white"
              disabled={isLoading}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLoading ? "Starting checkout..." : "Start My Free Trial"}
            </Button>

            {/* Trust Signals */}
            <div className="flex flex-col items-center gap-3 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span>Stripe Protected</span>
                </div>
              </div>
              
              <p className="text-center">
                By continuing, you agree to our{" "}
                <Link to="/terms" className="text-brand-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-brand-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PlanSignup() {
  // Pure hosted checkout flow - no PaymentElement integration
  return <SignupForm />;
}