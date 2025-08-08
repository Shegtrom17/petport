import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MetaTags } from "@/components/MetaTags";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function TransferAccept() {
  const { token } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<{ status: string; to_email?: string; expires_at?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      if (!token) return;
      const { data, error } = await supabase.functions.invoke("transfer-pet", {
        body: { action: "status", token },
      });
      if (error) {
        toast({ title: "Invalid or expired link", variant: "destructive" });
        return;
      }
      setStatus(data);
    };
    loadStatus();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    if (!user) {
      toast({ title: "Please sign in to accept", description: "You need a PetPort account." });
      navigate("/auth");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("transfer-pet", {
      body: { action: "accept", token },
    });
    setLoading(false);
    if (error || !data?.ok) {
      toast({ title: "Unable to accept transfer", description: error?.message || "Please check the link and try again.", variant: "destructive" });
      return;
    }
    toast({ title: "Transfer complete", description: "This pet is now in your account." });
    navigate("/app");
  };

  return (
    <PWALayout>
      <MetaTags title="Accept Pet Transfer | PetPort" description="Securely accept a pet transfer to your PetPort account." url={window.location.href} />
      <AppHeader title="Accept Transfer" />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Accept Pet Transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!status ? (
              <p>Validating transfer link…</p>
            ) : (
              <>
                <p>This transfer is intended for: <strong>{status.to_email}</strong></p>
                {status.expires_at && <p>Expires: {new Date(status.expires_at).toLocaleString()}</p>}
                <Button onClick={handleAccept} disabled={loading} className="w-full">
                  {loading ? "Accepting…" : "Accept Transfer"}
                </Button>
                <p className="text-sm text-muted-foreground">Not you? Ignore this link.</p>
                {!user && (
                  <p className="text-sm">Don’t have an account? <Link to="/auth" className="underline">Create one</Link> first, then return to this page.</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PWALayout>
  );
}
