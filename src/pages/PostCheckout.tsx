import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MetaTags } from "@/components/MetaTags";
import { PRICING } from "@/config/pricing";
import { featureFlags } from "@/config/featureFlags";
import { CreditCard, Plus } from "lucide-react";

export default function PostCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<"verifying" | "success" | "error">("verifying");
  const [email, setEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [isAddonPurchase, setIsAddonPurchase] = useState<boolean>(false);

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
        const verifyFn = featureFlags.testMode ? "verify-checkout-sandbox" : "verify-checkout";
        const { data, error } = await supabase.functions.invoke(verifyFn, { body: { session_id } });
        if (!error && (data as any)?.success) {
          const d: any = data;
          setEmail(d.email || null);
          setState("success");
          if (d.invited) {
            setMsg("Payment complete! We've emailed you an invite to finish creating your account.");
          } else {
            setMsg("Payment complete! Please sign in to access your account.");
          }
          return;
        }

        const verifyAddonFn = featureFlags.testMode ? "verify-addons-sandbox" : "verify-addons";
        const { data: addonData, error: addonError } = await supabase.functions.invoke(verifyAddonFn, { body: { session_id } });
        if (!addonError && (addonData as any)?.success) {
          const d: any = addonData;
          setEmail(d.email || null);
          setState("success");
          setIsAddonPurchase(true);
          setMsg("Add-on purchase complete! Your account has been updated.");
          return;
        }

        throw new Error((addonError as any)?.message || (error as any)?.message || "Unable to verify payment. Please contact support.");
      } catch (e: any) {
        setState("error");
        setMsg(e?.message ?? "Verification failed");
        toast({ variant: "destructive", title: "Verification failed", description: e?.message ?? "Try again" });
      }
    })();
  }, [location.search, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <MetaTags title="Payment Completed - PetPort" description="Complete your account after payment." url={window.location.href} />
      <Card className="max-w-lg w-full bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{state === "verifying" ? "Verifying your payment" : state === "success" ? "You're all set!" : "Verification issue"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state === "verifying" && <p>Please wait while we confirm your payment...</p>}
          {state === "success" && (
            <div className="space-y-3">
              <p>{msg}</p>
              {email && <p className="text-sm text-muted-foreground">Email: {email}</p>}
              <div className="flex gap-2">
                {/* Show Add Pet button for addon purchases */}
                {isAddonPurchase && (
                  <Button onClick={() => navigate("/add-pet")} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Pet Now
                  </Button>
                )}
                <Button onClick={() => navigate("/auth")}>Go to Sign In</Button>
                <Button variant="outline" onClick={() => navigate(isAddonPurchase ? "/app" : "/")}>
                  {isAddonPurchase ? "Go to App" : "Return Home"}
                </Button>
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
