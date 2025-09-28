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
import { Crown, Plus, Clock, CheckCircle, Star } from "lucide-react";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Calculate time remaining until expiration
  useEffect(() => {
    if (!status?.expires_at) return;
    
    const updateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(status.expires_at!);
      const diff = expiry.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining(`${minutes}m remaining`);
      }
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [status?.expires_at]);

  const loadStatus = async () => {
    if (!token) return;
    console.info("TransferAccept: Invoking status", { token });
    const { data, error } = await supabase.functions.invoke("transfer-pet", {
      body: { action: "status", token },
    });
    if (error) {
      console.warn("TransferAccept: status error", { message: error.message, token });
      setLoadError("Invalid or expired transfer link");
      return;
    }
    console.info("TransferAccept: status ok", { hasData: !!data, dataKeys: data ? Object.keys(data) : [] });
    setStatus(data);
  };

  useEffect(() => {
    loadStatus();
  }, [token]);

  useEffect(() => {
    console.log("TransferAccept: state", { user: !!user, loadError, hasStatus: !!status, token });
  }, [user, loadError, status, token]);

  const handleAccept = async () => {
    if (!token || !status) return;
    
    console.info("TransferAccept: Starting accept process", { token, hasUser: !!user, status });
    
    // Handle different recipient scenarios based on subscription status
    if (!user) {
      // New users need to sign up first, then subscribe
      toast({ 
        title: "Create your PetPort account", 
        description: "Sign up to start your free 7-day trial and claim this pet profile." 
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
    console.info("TransferAccept: Invoking accept", { token });
    const { data, error } = await supabase.functions.invoke("transfer-pet", {
      body: { action: "accept", token },
    });
    setLoading(false);
    
    console.info("TransferAccept: Accept response", { hasData: !!data, hasError: !!error, success: data?.ok });
    
    if (error || !data?.ok) {
      console.warn("TransferAccept: Accept failed", { message: error?.message, data });
      toast({ 
        title: "Unable to accept transfer", 
        description: error?.message || "Please check the link and try again.", 
        variant: "destructive" 
      });
      return;
    }
    
    console.info("TransferAccept: Accept successful");
    toast({ 
      title: "Transfer complete", 
      description: `${status.pet_name || 'This pet'} is now in your account.` 
    });
    navigate("/app");
  };

  return (
    <PWALayout showBottomNav={false}>
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
            {loadError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">{loadError}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <p>This transfer link may have expired, been used already, or is invalid.</p>
                  <div className="space-y-2">
                    <p className="font-medium">What you can do:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Ask the sender to generate a fresh invite</li>
                      <li>Make sure you're signed in with the email the invite was sent to</li>
                      <li>Check if the link has expired (transfers expire after 7 days)</li>
                    </ul>
                  </div>
                  
                  {/* Show conversion CTAs even on error for unauthenticated users */}
                  {!user ? (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <p className="text-sm font-medium text-foreground">New to PetPort?</p>
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-primary to-primary/90 text-white"
                      >
                        <Link to={`/auth?plan=monthly&transfer_token=${token}`}>
                          <Star className="w-4 h-4 mr-2" />
                          Create Account & Start Free Trial
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/auth?transfer_token=${token}`}>
                          Sign In to Existing Account
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/help">Contact Support</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : !status ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Validating transfer link…</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {/* Wrong Account Warning */}
                  {user?.email && status?.to_email &&
                    user.email.toLowerCase() !== status.to_email.toLowerCase() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm mb-3">
                      <p className="mb-2">
                        You're signed in as <strong>{user.email}</strong>, but this transfer was sent to{' '}
                        <strong>{status.to_email}</strong>.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={async () => {
                          await supabase.auth.signOut();
                          navigate(`/auth?transfer_token=${token}`);
                        }}
                      >
                        Switch Account
                      </Button>
                    </div>
                  )}

                  {/* Transfer Details with Urgency */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-primary">
                        {status.pet_name ? `${status.pet_name}'s Profile Transfer` : 'Pet Profile Transfer'}
                      </h3>
                      {timeRemaining && (
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          timeRemaining.includes('Expired') 
                            ? 'bg-red-100 text-red-700' 
                            : timeRemaining.includes('h') || timeRemaining.includes('d')
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {timeRemaining}
                        </div>
                      )}
                    </div>
                    <p className="text-sm">
                      From: <strong>{status.sender_name || 'A PetPort user'}</strong>
                    </p>
                    <p className="text-sm">
                      To: <strong>{status.to_email}</strong>
                    </p>
                  </div>

                  {/* New User Flow - Enhanced Trial Messaging */}
                  {!user && (
                    <div className="bg-gradient-to-r from-azure/10 to-azure/5 border border-azure/30 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-azure" />
                        <h4 className="font-semibold text-azure">
                          🎉 {status.pet_name ? `${status.pet_name}'s` : 'This'} profile is waiting for you!
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your PetPort account and start your <strong>free 7-day trial</strong> to receive this pet profile.
                      </p>
                      
                      {/* Trial Benefits */}
                      <div className="bg-white/80 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-azure mb-2">✨ Your 7-Day Free Trial Includes:</p>
                        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Complete access to {status.pet_name ? `${status.pet_name}'s` : 'this'} profile
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Create unlimited pet profiles
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Emergency contact & medical storage
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Share profiles with caregivers & vets
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        <strong>Card required but not charged during trial.</strong> Cancel anytime before trial ends.
                      </p>
                    </div>
                  )}

                  {/* Existing User - Needs Subscription - Enhanced */}
                  {user && status.recipient_needs_subscription && (
                    <div className="bg-gradient-to-r from-azure/10 to-azure/5 border border-azure/30 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="w-5 h-5 text-azure" />
                        <h4 className="font-semibold text-azure">
                          📋 Subscription Required
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Complete your subscription to receive {status.pet_name ? `${status.pet_name}'s` : 'this'} profile.
                      </p>
                      
                      <div className="bg-white/80 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-azure mb-2">🎯 Start Your 7-Day Free Trial Now:</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• Access to all premium features immediately</p>
                          <p>• Card required but <strong>not charged during trial</strong></p>
                          <p>• Cancel anytime before {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing User - At Pet Limit - Enhanced */}
                  {user && status.recipient_needs_upgrade && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Plus className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-700">
                          Additional Pet Slot Needed
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {status.pet_name ? `${status.pet_name}'s` : 'This'} profile is waiting for you — add an additional pet slot to your subscription to claim it.
                      </p>
                      
                      <div className="bg-white/90 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-amber-700 mb-2">💡 Simple & Affordable:</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• Additional pet slots: <strong>just $3.99/year each</strong></p>
                          <p>• Immediate access after payment</p>
                          <p>• Manage all your pets in one place</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Subscriber - Ready to Accept - Enhanced */}
                  {user && !status.recipient_needs_subscription && !status.recipient_needs_upgrade && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-700">
                          Ready to Accept
                        </h4>
                      </div>
                      <p className="text-sm text-green-600 mb-3">
                        {status.pet_name ? `${status.pet_name}'s` : 'This'} profile will be added to your account immediately.
                      </p>
                      
                      <div className="bg-white/90 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-700 mb-1">✅ You're all set!</p>
                        <p className="text-xs text-green-600">Active subscription with available pet slots detected.</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleAccept} 
                  disabled={loading || timeRemaining?.includes('Expired')} 
                  className={`w-full text-white font-semibold py-3 ${
                    timeRemaining?.includes('Expired') 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing…
                    </div>
                  ) : timeRemaining?.includes('Expired') ? (
                    "Transfer Link Expired"
                  ) : !user ? (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Create Account & Start Free Trial
                    </div>
                  ) : status.recipient_needs_subscription ? (
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Start 7-Day Free Trial
                    </div>
                  ) : status.recipient_needs_upgrade ? (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Pet Slot & Accept ($3.99/year)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Accept {status.pet_name || 'Pet'} Transfer
                    </div>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Not {status.to_email}? This link is intended for that email address only.
                  </p>
                  {timeRemaining && !timeRemaining.includes('Expired') && (
                    <p className="text-xs text-orange-600 font-medium">
                      ⏰ This transfer link expires in {timeRemaining.toLowerCase()}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PWALayout>
  );
}
