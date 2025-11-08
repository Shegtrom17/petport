import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a guest user ID for non-authenticated users
      const guestUserId = crypto.randomUUID();
      
      const { error } = await supabase
        .from("email_preferences")
        .upsert({
          email: email.toLowerCase().trim(),
          user_id: guestUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "email",
        });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "You've been added to our newsletter. Check your inbox for updates!",
      });
      
      setEmail("");
    } catch (error: any) {
      console.error("Newsletter signup error:", error);
      toast({
        title: "Signup Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-[#5691af]/10 to-[#4a7c95]/5 p-6 rounded-xl border border-[#5691af]/20">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-[#5691af]" />
          <h3 className="font-semibold text-lg text-foreground">Stay Updated</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get tips, updates, and exclusive offers delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            variant="azure"
            className="bg-[#5691af] hover:bg-[#4a7c95] text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  );
};
