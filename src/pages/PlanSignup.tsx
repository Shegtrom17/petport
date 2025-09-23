import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Check, Shield, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PRICING } from "@/config/pricing";
import { useIOSResilience } from "@/hooks/useIOSResilience";
import { isIOSDevice } from "@/utils/iosDetection";
import { useAuth } from "@/context/AuthContext";

const stripePromise = loadStripe("pk_test_51QIDNRGWjWGZWj9YcGNqAOqrIiROFGHbIvPLMXqGqKw8IFoYEYjFp0L39a3Mop1j8VGLwqJcGJHgE6FGMT4wuFHC00fM6BsB95");

const SignupForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  
  // iOS resilience for signup flow
  const { safeAsync, withTimeout } = useIOSResilience({
    enableMemoryMonitoring: true,
    enableVisibilityRecovery: true,
    enableTimeoutProtection: true,
    timeoutMs: 30000 // 30 second timeout for iOS
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: ""
  });
  const [additionalPets, setAdditionalPets] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showFallbackNavigation, setShowFallbackNavigation] = useState(false);
  const { signInWithPassword } = useAuth();

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
    
    // Pre-warm the edge function for faster response
    const warmupFunction = async () => {
      try {
        console.log(`⚡ [${corrId.current}] Pre-warming edge function...`);
        await supabase.functions.invoke("create-subscription-with-user", {
          body: { warmUp: true }
        });
        console.log(`✅ [${corrId.current}] Edge function pre-warmed`);
      } catch (error) {
        console.log(`⚠️ [${corrId.current}] Edge function warmup failed (this is okay):`, error);
      }
    };
    
    // Warm up after a short delay to not interfere with page load
    setTimeout(warmupFunction, 1000);
  }, [plan, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.time(`PlanSignup-${corrId.current}`);
    console.log(`🚀 [${corrId.current}] Starting signup process for plan: ${plan}, additional pets: ${additionalPets}`);
    
    if (!stripe || !elements) return;

    try {
      setIsLoading(true);
      setSignupSuccess(false);
      setShowFallbackNavigation(false);

      // Get the Stripe token first
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: stripeError, token } = await stripe.createToken(cardElement);
      
      if (stripeError) {
        console.error(`❌ [${corrId.current}] Stripe token creation failed:`, stripeError);
        toast({
          title: "Payment Error",
          description: stripeError.message || "Failed to process payment information",
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ [${corrId.current}] Stripe token created successfully:`, token?.id);

      // Call the provisioning function with correlation ID
      console.log(`📞 [${corrId.current}] Calling create-subscription-with-user function...`);
      const provisioningStartTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke("create-subscription-with-user", {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          plan: plan,
          additionalPets: additionalPets,
          corrId: corrId.current,
        }
      });
      
      const provisioningTime = Date.now() - provisioningStartTime;
      console.log(`⏱️ [${corrId.current}] Provisioning function completed in ${provisioningTime}ms`);

      if (error) {
        console.error(`❌ [${corrId.current}] Provisioning failed:`, error);
        let errorMessage = "Failed to create account. Please try again.";
        
        if (error.message?.includes('EMAIL_EXISTS')) {
          errorMessage = "This email is already registered. Please sign in instead.";
        } else if (error.message?.includes('PAYMENT_FAILED')) {
          errorMessage = "Payment failed. Please check your card details and try again.";
        } else if (error.message?.includes('RATE_LIMITED')) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
        
        toast({
          title: "Signup Failed",
          description: `${errorMessage} (Error ID: ${corrId.current})`,
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ [${corrId.current}] Provisioning successful:`, data);

      // Auto-login the user
      console.log(`🔐 [${corrId.current}] Attempting auto-login...`);
      const loginStartTime = Date.now();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      const loginTime = Date.now() - loginStartTime;
      console.log(`⏱️ [${corrId.current}] Login attempt completed in ${loginTime}ms`);
      
      if (signInData.session && !signInError) {
        console.log(`✅ [${corrId.current}] Auto-login successful`);
        setSignupSuccess(true);
        
        toast({
          title: "Welcome to PetPort!",
          description: `Your ${plan} plan is active with a 7-day free trial.`,
        });

        // Navigate to dashboard after a brief delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        console.error(`❌ [${corrId.current}] Auto-login failed:`, signInError);
        
        // Show fallback message with sign-in option
        toast({
          title: "Account Created Successfully!",
          description: `Please sign in to continue. (ID: ${corrId.current})`,
        });
        
        // Navigate to sign-in page after delay
        setTimeout(() => {
          navigate('/auth', { 
            state: { 
              email: formData.email, 
              message: "Your account was created successfully. Please sign in to continue." 
            } 
          });
        }, 3000);
      }

    } catch (err: any) {
      console.error(`❌ [${corrId.current}] Signup error:`, err);
      toast({
        title: "Signup Error",
        description: `${err.message || "An unexpected error occurred. Please try again."} (ID: ${corrId.current})`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.timeEnd(`PlanSignup-${corrId.current}`);
    }
  };

  // Remove localStorage recovery logic - no longer needed

  const handleFallbackNavigation = () => {
    window.location.href = '/app';
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
              {isLoading ? (
                isIOSDevice() ? "Setting up your account (iOS)..." : "Setting up your account..."
              ) : "Start My Free Trial"}
            </Button>

            {/* Enhanced iOS Fallback Navigation */}
            {signupSuccess && showFallbackNavigation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        ✅ Account created successfully!
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Your PetPort account is ready to use. Choose an option below:
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={handleFallbackNavigation}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        Continue to My Account
                      </Button>
                      <Button 
                        onClick={() => navigate("/auth")}
                        variant="outline"
                        className="w-full border-green-300 text-green-700 hover:bg-green-50"
                        size="sm"
                      >
                        Try Login Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trial Transparency Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">
                    ⚠️ You won't be charged today.
                  </p>
                  <p className="text-sm text-amber-700">
                    Your 7-day free trial ends on <strong>{getTrialEndDate()}</strong>.
                  </p>
                  <p className="text-sm text-amber-700">
                    Cancel anytime before that date to avoid being charged. After that, your card will be billed <strong>${(pricing.total / 100).toFixed(2)}/{planData.interval}</strong> unless canceled.
                  </p>
                </div>
              </div>
            </div>

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