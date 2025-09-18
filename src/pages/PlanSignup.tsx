import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Check, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PRICING } from "@/config/pricing";

const stripePromise = loadStripe("pk_test_51QIDNRGWjWGZWj9YcGNqAOqrIiROFGHbIvPLMXqGqKw8IFoYEYjFp0L39a3Mop1j8VGLwqJcGJHgE6FGMT4wuFHC00fM6BsB95");

const SignupForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: ""
  });
  const [additionalPets, setAdditionalPets] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const plan = searchParams.get("plan") || "monthly";
  const planData = PRICING.plans.find(p => p.id === plan) || PRICING.plans[0];
  const addonData = PRICING.addons[0];

  const calculateTotal = () => {
    const planPrice = planData.priceCents;
    const addonPrice = additionalPets * addonData.getTierPrice(additionalPets);
    return { planPrice, addonPrice, total: planPrice + addonPrice };
  };

  const pricing = calculateTotal();

  useEffect(() => {
    if (!["monthly", "yearly"].includes(plan)) {
      navigate("/?error=invalid-plan");
    }
  }, [plan, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { data, error } = await supabase.functions.invoke("create-subscription-with-user", {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          plan: plan,
          additionalPets: additionalPets,
          cardElement: cardElement
        }
      });

      if (error) throw error;

      if (data?.sessionToken) {
        // Auto-login with the session token
        await supabase.auth.setSession({
          access_token: data.sessionToken,
          refresh_token: data.refreshToken
        });
        
        toast({
          title: "Welcome to PetPort! 🎉",
          description: "Your free trial has started. Add your first pet to get started!"
        });
        
        navigate("/app");
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive"
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
            {/* Account Details */}
            <div className="space-y-3">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Create a secure password"
                required
                minLength={6}
              />
            </div>

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
              <div className="p-3 border rounded-lg bg-background">
                <CardElement 
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>You will not be charged today. Trial starts immediately.</span>
              </div>
            </div>

            {/* Total Pricing */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
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
              disabled={isLoading || !stripe}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLoading ? "Setting up your account..." : "Start My Free Trial"}
            </Button>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span>Secure checkout</span>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="text-brand-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PlanSignup() {
  return (
    <Elements stripe={stripePromise}>
      <SignupForm />
    </Elements>
  );
}