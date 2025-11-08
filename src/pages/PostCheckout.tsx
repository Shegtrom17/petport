import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MetaTags } from "@/components/MetaTags";

import { CreditCard, Plus, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function PostCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<"verifying" | "success" | "account_setup" | "error">("verifying");
  const [email, setEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [isAddonPurchase, setIsAddonPurchase] = useState<boolean>(false);
  const [needsAccountSetup, setNeedsAccountSetup] = useState<boolean>(false);
  
  // Account setup form state
  const [fullName, setFullName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session_id = params.get("session_id");
    if (!session_id) {
      setState("error");
      setMsg("Missing session id");
      return;
    }
    (async () => {
      try {
        // Force session refresh for iOS reliability
        try {
          await supabase.auth.getSession();
          await supabase.auth.refreshSession();
          console.log("✅ Session refreshed on PostCheckout");
        } catch (e) {
          console.warn("⚠️ Session refresh issue on PostCheckout:", e);
        }

        // Retry verification with backoff
        const verifyWithRetry = async (functionName: string) => {
          const maxRetries = 3;
          const baseDelay = 1200; // 1.2 seconds
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`Attempting ${functionName} (attempt ${attempt}/${maxRetries})`);
              const { data, error } = await supabase.functions.invoke(functionName, { body: { session_id } });
              
              if (!error && (data as any)?.success) {
                return { data, error: null };
              }
              
              if (attempt === maxRetries) {
                return { data, error: error || new Error(`${functionName} failed after ${maxRetries} attempts`) };
              }
              
              // Wait before retry with exponential backoff
              const delay = baseDelay * Math.pow(1.5, attempt - 1);
              console.log(`${functionName} failed, retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              
            } catch (e) {
              console.error(`${functionName} attempt ${attempt} error:`, e);
              if (attempt === maxRetries) {
                return { data: null, error: e };
              }
              
              const delay = baseDelay * Math.pow(1.5, attempt - 1);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        };

        // Try verify-checkout first
        const verifyResult = await verifyWithRetry("verify-checkout");
        if (!verifyResult.error && (verifyResult.data as any)?.success) {
          const d: any = verifyResult.data;
          setEmail(d.email || null);
          setNeedsAccountSetup(d.needsAccountSetup || false);
          
          if (d.needsAccountSetup) {
            setState("account_setup");
            setMsg("Payment verified! Now let's set up your account.");
          } else {
            setState("success");
            setMsg("Payment complete! Please sign in to access your account.");
          }
          return;
        }

        // Try verify-addons if checkout verification failed
        const addonResult = await verifyWithRetry("verify-addons");
        if (!addonResult.error && (addonResult.data as any)?.success) {
          const d: any = addonResult.data;
          setEmail(d.email || null);
          setState("success");
          setIsAddonPurchase(true);
          setMsg("Add-on purchase complete! Your additional pet slots are now available. Look for the dashed boxes in your pet selector to add new pets.");
          return;
        }

        throw new Error(
          (addonResult.error as any)?.message || 
          (verifyResult.error as any)?.message || 
          "We're still verifying your payment. Please refresh this page or sign in again."
        );
      } catch (e: any) {
        setState("error");
        setMsg(e?.message ?? "Verification failed");
        toast({ variant: "destructive", title: "Verification failed", description: e?.message ?? "Try again" });
      }
    })();
  }, [location.search, toast]);

  const handleAccountSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({ variant: "destructive", title: "Name required", description: "Please enter your full name" });
      return;
    }
    
    if (!email) {
      toast({ variant: "destructive", title: "Email missing", description: "Email not found from payment" });
      return;
    }
    
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Password too short", description: "Password must be at least 6 characters" });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match", description: "Please make sure both passwords match" });
      return;
    }

    setIsCreatingAccount(true);
    
    try {
      // Create the user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Update the subscribers table to link the user_id
        const { error: updateError } = await supabase
          .from("subscribers")
          .update({ user_id: signUpData.user.id })
          .eq("email", email);

        if (updateError) {
          console.error("Failed to link subscriber:", updateError);
          // Don't throw here - account was created successfully
        }

        toast({ title: "Account created!", description: "Welcome to PetPort!" });
        
        // Force session refresh and auto-login then redirect to app
        try {
          await supabase.auth.getSession();
          await supabase.auth.refreshSession();
          console.log("✅ Session refreshed after account creation");
        } catch (e) {
          console.warn("⚠️ Session refresh issue after account creation:", e);
        }
        
        navigate("/app");
      } else {
        throw new Error("Account creation failed");
      }
    } catch (error: any) {
      console.error("Account setup error:", error);
      toast({ 
        variant: "destructive", 
        title: "Account creation failed", 
        description: error.message || "Please try again or contact support" 
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <MetaTags title="Payment Completed - PetPort" description="Complete your account after payment." url={window.location.href} noindex={true} />
      <Card className="max-w-lg w-full bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>
            {state === "verifying" && "Verifying your payment"}
            {state === "account_setup" && "Set Up Your Account"}
            {state === "success" && "You're all set!"}
            {state === "error" && "Verification issue"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === "verifying" && <p>Please wait while we confirm your payment...</p>}
          
          {state === "account_setup" && (
            <div className="space-y-4">
              <p>{msg}</p>
              <form onSubmit={handleAccountSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">This email was used for your payment</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isCreatingAccount}
                >
                  {isCreatingAccount ? "Creating Account..." : "Create My Account"}
                </Button>
              </form>
            </div>
          )}
          
          {state === "success" && (
            <div className="space-y-3">
              <p>{msg}</p>
              {email && <p className="text-sm text-muted-foreground">Email: {email}</p>}
              <div className="flex flex-col gap-3">
                {/* Show Add Pet button for addon purchases */}
                {isAddonPurchase && (
                  <Button onClick={() => navigate("/add-pet")} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark">
                    <Plus className="h-4 w-4" />
                    Add Pet Now
                  </Button>
                )}
                
                {!needsAccountSetup && !isAddonPurchase && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium mb-2">Next step: Sign in to your new account</p>
                    <p className="text-xs text-blue-600">Use the email and password you just created to access PetPort</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/auth?mode=signin")} className="flex-1 text-white">
                    {needsAccountSetup ? "Sign In" : "Sign In to PetPort"}
                  </Button>
                  <Button variant="outline" onClick={() => navigate(isAddonPurchase ? "/app" : "/")} className="flex-1">
                    {isAddonPurchase ? "Go to App" : "Return Home"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {state === "error" && (
            <div className="space-y-3">
              <p>{msg || "We couldn't verify your payment."}</p>
              <Button onClick={() => navigate("/")}>Return Home</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}