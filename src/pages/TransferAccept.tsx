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
import { Crown, Plus } from "lucide-react";

interface TransferStatus {
  status: string;
  to_email?: string;
  expires_at?: string;
  pet_name?: string;
  sender_name?: string;
  recipient_subscription_status?: 'none' | 'active' | 'at_limit';
  recipient_needs_subscription?: boolean;
  recipient_needs_upgrade?: boolean;
}

export default function TransferAccept() {
  const { token } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<TransferStatus | null>(null);
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
    if (!token || !status) return;
    
    // Handle different recipient scenarios based on subscription status
    if (!user) {
      // New users need to sign up first, then subscribe
      toast({ 
        title: "Create your PetPort account", 
        description: "Sign up to start your free trial and claim this pet profile." 
      });
      navigate(`/auth?plan=monthly&transfer_token=${token}`);
      return;
    }

    // Check if user needs subscription or upgrade
    if (status.recipient_needs_subscription) {
      toast({ 
        title: "Subscription required", 
        description: "Complete your subscription to receive this pet profile." 
      });
      navigate(`/subscribe?transfer_token=${token}`);
      return;
    }

    if (status.recipient_needs_upgrade) {
      toast({ 
        title: "Additional pet slot needed", 
        description: "Add an additional pet slot to your subscription to claim this profile." 
      });
      navigate(`/subscribe?transfer_token=${token}&upgrade=pets`);
      return;
    }

    // User has active subscription and space - complete transfer immediately
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("transfer-pet", {
      body: { action: "accept", token },
    });
    setLoading(false);
    
    if (error || !data?.ok) {
      toast({ 
        title: "Unable to accept transfer", 
        description: error?.message || "Please check the link and try again.", 
        variant: "destructive" 
      });
      return;
    }
    
    toast({ 
      title: "Transfer complete", 
      description: `${status.pet_name || 'This pet'} is now in your account.` 
    });
    navigate("/app");
  };

  return (
    <PWALayout>
      <MetaTags title="Accept Pet Transfer | PetPort" description="Securely accept a pet transfer to your PetPort account." url={window.location.href} />
      <AppHeader title="Accept Transfer" />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Accept Pet Transfer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!status ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Validating transfer link…</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-semibold text-primary mb-2">
                      {status.pet_name ? `${status.pet_name}'s Profile Transfer` : 'Pet Profile Transfer'}
                    </h3>
                    <p className="text-sm">
                      From: <strong>{status.sender_name || 'A PetPort user'}</strong>
                    </p>
                    <p className="text-sm">
                      To: <strong>{status.to_email}</strong>
                    </p>
                    {status.expires_at && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Expires: {new Date(status.expires_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* New User Flow */}
                  {!user && (
                    <div className="bg-azure/5 border border-azure/20 rounded-lg p-4">
                      <h4 className="font-medium text-azure mb-2">
                        🎉 {status.pet_name ? `${status.pet_name}'s` : 'This'} profile is waiting for you!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Create your PetPort account and start your free 7-day trial to receive this pet profile.
                      </p>
                    </div>
                  )}

                  {/* Existing User - Needs Subscription */}
                  {user && status.recipient_needs_subscription && (
                    <div className="bg-azure/5 border border-azure/20 rounded-lg p-4">
                      <h4 className="font-medium text-azure mb-2">
                        📋 Subscription Required
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Complete your subscription to receive {status.pet_name ? `${status.pet_name}'s` : 'this'} profile.
                        Start your 7-day free trial now.
                      </p>
                    </div>
                  )}

                  {/* Existing User - At Pet Limit */}
                  {user && status.recipient_needs_upgrade && (
                    <div className="bg-gold-500/5 border border-gold-500/20 rounded-lg p-4">
                      <h4 className="font-medium text-gold-500 mb-2 flex items-center gap-1">
                        <Plus className="w-4 h-4" />
                        Additional Pet Slot Needed
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {status.pet_name ? `${status.pet_name}'s` : 'This'} profile is waiting for you — add an additional pet slot to your subscription to claim it.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Additional pet slots are just $3.99/year each.
                      </p>
                    </div>
                  )}

                  {/* Active Subscriber - Ready to Accept */}
                  {user && !status.recipient_needs_subscription && !status.recipient_needs_upgrade && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-700 mb-2">
                        ✅ Ready to Accept
                      </h4>
                      <p className="text-sm text-green-600">
                        {status.pet_name ? `${status.pet_name}'s` : 'This'} profile will be added to your account immediately.
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleAccept} 
                  disabled={loading} 
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {loading ? (
                    "Processing…"
                  ) : !user ? (
                    "Create Account & Start Free Trial"
                  ) : status.recipient_needs_subscription ? (
                    "Complete Subscription"
                  ) : status.recipient_needs_upgrade ? (
                    "Add Pet Slot & Accept"
                  ) : (
                    `Accept ${status.pet_name || 'Pet'} Transfer`
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Not {status.to_email}? This link is intended for that email address only.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PWALayout>
  );
}
