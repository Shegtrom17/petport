import { MetaTags } from "@/components/MetaTags";
import PricingSection from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();

  const openPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast({ title: "Unable to open portal", description: "Please try again." });
      }
    } catch (e: any) {
      toast({ title: "Portal error", description: e?.message ?? "Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <MetaTags title="Complete Subscription - PetPort" description="Subscribe to continue using PetPort." url={window.location.href} />
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Complete Your Subscription</h1>
          <p className="text-sm text-muted-foreground mt-2">An active subscription is required to access the app.</p>
          {user && (
            <div className="mt-4">
              <Button variant="outline" onClick={openPortal}>Manage Subscription</Button>
            </div>
          )}
        </header>
        <PricingSection context="profile" />
      </div>
    </div>
  );
}
