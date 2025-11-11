
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
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { Menu } from "lucide-react";

export default function Auth() {
  console.log("Auth: Component rendering");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract URL params
  const searchParams = new URLSearchParams(location.search);
  const transferToken = searchParams.get('transfer_token');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { signIn } = useAuth();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Auth: Sign in form submitted", { email });
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Auth: Attempting sign in");
      await signIn(email, password);
      console.log("Auth: Sign in completed");

      // Redirect based on transfer token presence
      if (transferToken) {
        navigate(`/transfer/accept/${transferToken}`);
      } else {
        navigate("/app");
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
        } else {
          toast({
            variant: "destructive",
            title: "Sign in failed",
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
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 bg-white/90 hover:bg-white shadow-md"
        onClick={() => setMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <PublicNavigationMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 text-center block hover:opacity-80 transition-opacity">
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
        </Link>
        
        <StorageWarningBanner />
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your pet profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                    placeholder="Enter your password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="azure"
                  className="w-full border border-white/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/#pricing" className="text-primary hover:underline font-medium">
                  Start your free trial
                </Link>
              </p>
            </div>
            
            <div className="w-full border-t pt-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Want to learn more?
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <Link 
                  to="/#pricing" 
                  className="text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                >
                  💰 View Pricing
                </Link>
                <Link 
                  to="/demos" 
                  className="text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                >
                  🎬 See Demos
                </Link>
                <Link 
                  to="/gift" 
                  className="text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                >
                  🎁 Give as Gift
                </Link>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                >
                  🏠 Back to Home
                </Link>
              </div>
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
