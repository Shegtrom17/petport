import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MetaTags } from "@/components/MetaTags";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function ClaimSubscription() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("susanloren.coach@gmail.com");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

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
        // Update the subscribers table to link the user_id
        const { error: updateError } = await supabase
          .from("subscribers")
          .update({ user_id: signUpData.user.id })
          .eq("email", email.trim());

        if (updateError) {
          console.error("Failed to link subscriber:", updateError);
          // Don't throw here - account was created successfully
        }

        toast({ title: "Account created!", description: "Welcome to PetPort!" });
        
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
              className="w-full bg-[#5691af] text-white font-medium py-2 px-4 rounded-md" 
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
        </CardContent>
      </Card>
    </div>
  );
}