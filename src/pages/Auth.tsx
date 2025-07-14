
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        console.log("Auth: Sign in completed, navigating to home");
        navigate("/");
      } else {
        console.log("Auth: Attempting sign up");
        await signUp(email, password, fullName);
        console.log("Auth: Sign up completed");
        
        // Reset form after successful signup
        setEmail("");
        setPassword("");
        setFullName("");
        
        // Show success message for signup
        toast({
          title: "Account created successfully!",
          description: "Please check your email to confirm your account.",
        });
        
        // Small delay to let the auth state settle, then navigate if user is logged in
        setTimeout(() => {
          // If signup was successful and user is immediately logged in, navigate
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Auth: Authentication error:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate key') || error.message.includes('Pet Pass ID')) {
          toast({
            variant: "destructive",
            title: "Account creation failed",
            description: "There was an issue setting up your account. Please try again in a moment.",
          });
        } else if (error.message.includes('Invalid Token') || error.message.includes('signature')) {
          toast({
            variant: "destructive",
            title: "Email confirmation failed",
            description: "There was an issue with email confirmation. Please check your email settings or try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/90 shadow-lg flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/1af9fe70-ed76-44c5-a1e1-1a058e497a10.png" 
                alt="PetPort Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-navy-900 to-gold-500 bg-clip-text text-transparent">
            PetPort
          </h1>
          <p className="text-gray-600">Digital Pet Passport</p>
        </div>
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{isSignIn ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription>
              {isSignIn 
                ? "Enter your credentials to access your pet profiles" 
                : "Sign up to create and manage pet passports"}
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
                  className="w-full bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : isSignIn ? "Sign In" : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="w-full text-navy-800"
              onClick={() => {
                setIsSignIn(!isSignIn);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
            >
              {isSignIn
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
