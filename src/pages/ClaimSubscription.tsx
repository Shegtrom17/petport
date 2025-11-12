import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MetaTags } from "@/components/MetaTags";
import { GiftClaimInfoModal } from "@/components/GiftClaimInfoModal";
import { User, Mail, Lock, Eye, EyeOff, Gift } from "lucide-react";

export default function ClaimSubscription() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const giftCode = searchParams.get("code");
  
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    if (!giftCode) {
      toast({ variant: "destructive", title: "Invalid link", description: "Gift code is missing" });
      navigate("/");
    }
  }, [giftCode, navigate, toast]);

  const handleAccountSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({ variant: "destructive", title: "Name required", description: "Please enter your full name" });
      return;
    }
    
    if (!email.trim()) {
      toast({ variant: "destructive", title: "Email required", description: "Please enter your email address" });
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
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Claim the gift membership
        const { data: claimData, error: claimError } = await supabase.functions.invoke('claim-gift-membership', {
          body: {
            giftCode,
            userId: signUpData.user.id
          }
        });

        if (claimError) {
          console.error("Failed to claim gift:", claimError);
          toast({ 
            variant: "destructive", 
            title: "Gift claim failed", 
            description: "Your account was created but we couldn't activate your gift. Please contact support." 
          });
        } else {
          toast({ 
            title: "Gift activated!", 
            description: "Your PetPort membership is now active. Welcome!" 
          });
        }

        // Auto-login and redirect to app
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
      <MetaTags title="Claim Your Subscription - PetPort" description="Complete your account setup to access your PetPort subscription." url={window.location.href} />
      <Card className="max-w-lg w-full bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-[#5691af]">
            Claim Your Subscription
          </CardTitle>
          <p className="text-center text-sm text-gray-600">
            Your payment was successful! Set up your account to access PetPort.
          </p>
        </CardHeader>
        <CardContent>
          {/* Gift Value Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-[#5691af]/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-[#5691af] flex items-center gap-2">
                <Gift className="h-5 w-5" />
                You're Receiving Premium Access
              </h3>
              <span className="text-sm font-semibold text-green-600">$14.99 Value</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 mb-3">
              <li>✓ Full year of premium features</li>
              <li>✓ Photo gallery with 36 photos</li>
              <li>✓ Lost pet tools & LiveLinks</li>
              <li>✓ Resume builder & medical records</li>
            </ul>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowInfoModal(true)}
              className="w-full text-[#5691af] border-[#5691af] hover:bg-[#5691af] hover:text-white"
            >
              📚 See Full Feature List & Learn More
            </Button>
          </div>

          <form onSubmit={handleAccountSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-[#5691af]">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="border-[#5691af]/30 focus:border-[#5691af]"
              />
              <p className="text-xs text-gray-500">Use the email you paid with</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-[#5691af]">
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
                className="border-[#5691af]/30 focus:border-[#5691af]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-[#5691af]">
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
                  className="border-[#5691af]/30 focus:border-[#5691af] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-[#5691af]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#5691af]">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
                className="border-[#5691af]/30 focus:border-[#5691af]"
              />
            </div>
            
            <Button 
              type="submit" 
              variant="azure"
              className="w-full font-medium py-2 px-4 rounded-md"
              disabled={isCreatingAccount}
            >
              {isCreatingAccount ? "Creating Account..." : "Create My Account"}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/auth")}
                className="text-[#5691af] font-medium"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Educational Links Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Want to explore PetPort first?
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="/podcast" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#5691af] hover:underline text-center flex items-center justify-center gap-1"
              >
                🎧 Listen to Our Podcast (opens in new tab) →
              </a>
              <a 
                href="/demos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#5691af] hover:underline text-center flex items-center justify-center gap-1"
              >
                🎬 Watch Feature Demos (opens in new tab) →
              </a>
              <a 
                href="/learn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#5691af] hover:underline text-center flex items-center justify-center gap-1"
              >
                📖 Read Success Stories (opens in new tab) →
              </a>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Don't worry - this claim page will stay open!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gift Info Modal */}
      <GiftClaimInfoModal 
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}