
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StorageWarningBanner } from "@/components/StorageWarningBanner";

export default function Auth() {
  console.log("Auth: Component rendering");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract URL params
  const searchParams = new URLSearchParams(location.search);
  const transferToken = searchParams.get('transfer_token');
  const plan = searchParams.get('plan');
  const mode = searchParams.get('mode'); // 'signin' or 'signup'
  
  // Default to signin if coming from post-checkout, otherwise signup for new users
  const [isSignIn, setIsSignIn] = useState(mode === 'signin' || location.state?.mode === 'signin' || false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn } = useAuth();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Auth: Form submitted", { isSignIn, email, fullName });
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    if (!isSignIn && !fullName) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter your full name.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isSignIn) {
        console.log("Auth: Attempting sign in");
        await signIn(email, password);
        console.log("Auth: Sign in completed");

        // Redirect based on transfer token presence
        if (transferToken) {
          navigate(`/transfer/accept/${transferToken}`);
        } else {
          navigate("/app");
        }
      } else {
        console.log("Auth: Attempting sign up");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (error) {
          throw error;
        }

        console.log("Auth: Sign up completed, redirecting...");
        
        // Send welcome email
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              subject: 'Welcome to PetPort!',
              html: `<h1>Welcome to PetPort, ${fullName}!</h1><p>Thank you for signing up. We're excited to have you join our community of pet lovers.</p><p>Get started by creating your pet's profile and exploring all the features PetPort has to offer.</p>`
            }
          });
          console.log("Auth: Welcome email sent");
        } catch (emailError) {
          console.error("Auth: Failed to send welcome email:", emailError);
          // Don't block signup if email fails
        }
        
        // Check for referral code and append to subscribe redirect
        const referralCode = localStorage.getItem('petport_referral');
        const baseUrl = transferToken 
          ? `/subscribe?transfer_token=${transferToken}`
          : '/subscribe';
        
        const finalUrl = referralCode 
          ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}ref=${referralCode}`
          : baseUrl;
        
        // Clear referral code immediately after use
        if (referralCode) {
          localStorage.removeItem('petport_referral');
        }
        
        navigate(finalUrl);
      }
    } catch (error) {
      console.error("Auth: Authentication error:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('invalid credentials') || errorMessage.includes('invalid login')) {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: "Invalid email or password. Please check your credentials and try again.",
          });
        } else if (errorMessage.includes('email not confirmed') || errorMessage.includes('email_not_confirmed')) {
          toast({
            variant: "destructive",
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
          });
        } else if (errorMessage.includes('user already registered') || errorMessage.includes('email already registered')) {
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: "An account with this email already exists. Try signing in instead.",
          });
          setIsSignIn(true);
        } else if (errorMessage.includes('duplicate key') || errorMessage.includes('pet pass id')) {
          toast({
            variant: "destructive",
            title: "Account creation failed",
            description: "There was an issue setting up your account. Please try again in a moment.",
          });
        } else if (errorMessage.includes('invalid token') || errorMessage.includes('signature')) {
          toast({
            variant: "destructive",
            title: "Email confirmation failed",
            description: "There was an issue with email confirmation. Please check your email settings or try again.",
          });
        } else if (errorMessage.includes('password') && errorMessage.includes('characters')) {
          toast({
            variant: "destructive",
            title: "Password too weak",
            description: "Password must be at least 6 characters long.",
          });
        } else {
          toast({
            variant: "destructive",
            title: isSignIn ? "Sign in failed" : "Sign up failed",
            description: error.message,
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-brand-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/90 shadow-lg flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" 
                alt="PetPort Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-brand-primary">
            PetPort
          </h1>
          <p className="text-gray-600">Digital Pet Passport</p>
        </div>
        
        <StorageWarningBanner />
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{isSignIn ? "Welcome Back" : "Start Your Free Trial"}</CardTitle>
            <CardDescription>
              {isSignIn ? "Sign in to access your pet profiles" : "Create your account - 7 days free, cancel anytime"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!isSignIn && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isSignIn}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={isSignIn ? "Enter your password" : "Minimum 6 characters"}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white border border-white/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : isSignIn ? "Sign In" : "Start Free Trial"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <div className="text-center">
              {isSignIn ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignIn(false)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Need an account? Start your free trial
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignIn(true)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Already have an account? Sign in
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Read our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
