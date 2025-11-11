import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PWALayout } from "@/components/PWALayout";
import { ReferralCard } from "@/components/ReferralCard";
import { ConnectStripeButton } from "@/components/ConnectStripeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, DollarSign, Users, Clock, Share2, Copy } from "lucide-react";
import { AzureButton } from "@/components/ui/azure-button";
import { Button } from "@/components/ui/button";

interface Referral {
  id: string;
  referred_user_id: string | null;
  commission_amount: number;
  commission_status: string;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
  referred_plan_interval?: string | null;
}

interface UserPayout {
  stripe_connect_id: string | null;
  onboarding_status: string;
  yearly_earnings: number;
}

export default function Referrals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payoutInfo, setPayoutInfo] = useState<UserPayout | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadReferralData();
    checkStripeStatus();
  }, [user]);

  // Check for Stripe Connect redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeParam = urlParams.get("stripe");

    if (stripeParam === "success") {
      toast({
        title: "Stripe Connected!",
        description: "Your Stripe account has been successfully linked.",
      });
      // Clean up URL
      window.history.replaceState({}, "", "/referrals");
      // Refresh status
      checkStripeStatus();
    } else if (stripeParam === "refresh") {
      toast({
        title: "Onboarding Incomplete",
        description: "Please complete the Stripe onboarding process.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/referrals");
    }
  }, []);

  const checkStripeStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke(
        "stripe-connect-status"
      );

      if (error) throw error;

      if (data?.status === "completed") {
        // Update local state
        setPayoutInfo((prev) =>
          prev
            ? { ...prev, onboarding_status: "completed" }
            : {
                stripe_connect_id: null,
                onboarding_status: "completed",
                yearly_earnings: 0,
              }
        );
      }
    } catch (error) {
      console.error("Failed to check Stripe status:", error);
    }
  };

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user's referral code
      const { data: referralData, error: referralError } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_user_id", user.id)
        .is("referred_user_id", null)
        .maybeSingle();

      if (referralError) {
        console.error("Error loading referral code:", referralError);
      } else if (referralData) {
        setReferralCode(referralData.referral_code);
      } else {
        // No referral code exists - create one automatically
        console.log("No referral code found, creating one...");
        
        const { data: newReferral, error: createError } = await supabase
          .rpc('create_user_referral', { _user_id: user.id });
        
        if (createError) {
          console.error("Error creating referral code:", createError);
        } else {
          // Reload the newly created code
          const { data: freshData, error: reloadError } = await supabase
            .from("referrals")
            .select("referral_code")
            .eq("referrer_user_id", user.id)
            .is("referred_user_id", null)
            .single();
          
          if (!reloadError && freshData) {
            setReferralCode(freshData.referral_code);
          }
        }
      }

      // Load all referrals for this user
      const { data: allReferrals, error: allReferralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_user_id", user.id)
        .not("referred_user_id", "is", null)
        .order("created_at", { ascending: false });

      if (allReferralsError) {
        console.error("Error loading referrals:", allReferralsError);
      } else {
        setReferrals(allReferrals || []);
      }

      // Load payout info
      const { data: payoutData, error: payoutError } = await supabase
        .from("user_payouts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (payoutError) {
        console.error("Error loading payout info:", payoutError);
      } else {
        setPayoutInfo(payoutData);
      }
    } catch (error) {
      console.error("Error in loadReferralData:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!user) return;

    setConnectingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "stripe-connect-onboard",
        {
          body: { userId: user.id },
        }
      );

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to generate onboarding link.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Stripe Connect error:", error);
      toast({
        title: "Error",
        description: "Failed to start Stripe Connect onboarding.",
        variant: "destructive",
      });
    } finally {
      setConnectingStripe(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Paid
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.commission_status === "pending").length,
    approved: referrals.filter((r) => r.commission_status === "approved").length,
    paid: referrals.filter((r) => r.commission_status === "paid").length,
    totalEarnings: payoutInfo?.yearly_earnings || 0,
  };

  if (loading) {
    return (
      <PWALayout showBottomNav={true}>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout showBottomNav={true}>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <AzureButton
            variant="outline"
            size="icon"
            onClick={() => navigate("/app")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </AzureButton>
          <div>
            <h1 className="text-3xl font-bold">Referral Program</h1>
            <p className="text-muted-foreground mt-1">
              Earn $2 for every Yearly Subscriber. Subscribers receive 10% discount.
            </p>
          </div>
        </div>

        {/* Referral Card */}
        <ReferralCard
          referralCode={referralCode}
          totalReferrals={stats.total}
          pendingReferrals={stats.pending}
          approvedReferrals={stats.approved}
          paidReferrals={stats.paid}
          totalEarnings={stats.totalEarnings}
        />

        {/* How It Works Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#5691af]" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5691af]/10 flex items-center justify-center text-[#5691af] font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Share Your Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Copy your unique referral link and share it with friends, family, or on social media.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5691af]/10 flex items-center justify-center text-[#5691af] font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">They Subscribe</h3>
                  <p className="text-sm text-muted-foreground">
                    When someone signs up using your link and subscribes to a yearly plan, you earn $2.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5691af]/10 flex items-center justify-center text-[#5691af] font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get Paid</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Stripe account to receive payouts. Commissions are approved after the 45-day paid membership period.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Only yearly plan subscriptions are eligible for referral commissions. 
                  Monthly subscriptions do not qualify for the $2 commission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connect Stripe Section */}
        <ConnectStripeButton
          onboardingStatus={
            (payoutInfo?.onboarding_status as "not_started" | "pending" | "completed") ||
            "not_started"
          }
          onClick={handleConnectStripe}
          isLoading={connectingStripe}
        />

        {/* Media Kit Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#5691af]" />
              Media Kit & Share Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use these pre-written messages to share PetPort with your network.
              Just copy and paste!
            </p>

            {/* Sample Messages */}
            <div className="space-y-3">
              {/* Message 1 */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm mb-3 whitespace-pre-line">
                  "Just found the perfect pet management app, and I mean perfect. PetPort gives our furry friends a voice of life!

I'm blown away by the innovation and the safety features:

Safety & Social Proof (Next-Gen Features)

🐾 LiveLinks for instant pet profiles on the go.
🐾 One-Tap Lost Pet Flyers (seriously next-gen status!).
🐾 Sighting Boards for quick community support.
🐾 Pet Resume Builder: Our pets can receive reviews from sitters/groomers! It's amazing for passing along verified care info and social proof to anyone new.

Beyond the emergency tools. I can store all documents by upload or snap a photo and its a PDF stored in app. Plus, I can sign in from any device, from anywhere. And the best part? It includes Care and Handling for live updates to and from sitters—no more scribbling on paper, I can update instructions 24/7!

It truly feels like the future of pet care. All accounts are transferable so my companions will have a voice for life!

See LiveLinks for yourself at PetPort.app and check out the innovation yourself. Use my link to try it:{" "}
                  <span className="font-mono text-[#5691af]">
                    {referralCode ? `https://petport.app?ref=${referralCode}` : "[Your link will appear here]"}
                  </span>
                  "
                </p>
                <AzureButton
                  size="sm"
                  onClick={() => {
                    const message = `Just found the perfect pet management app, and I mean perfect. PetPort gives our furry friends a voice of life!

I'm blown away by the innovation and the safety features:

Safety & Social Proof (Next-Gen Features)

🐾 LiveLinks for instant pet profiles on the go.
🐾 One-Tap Lost Pet Flyers (seriously next-gen status!).
🐾 Sighting Boards for quick community support.
🐾 Pet Resume Builder: Our pets can receive reviews from sitters/groomers! It's amazing for passing along verified care info and social proof to anyone new.

Beyond the emergency tools. I can store all documents by upload or snap a photo and its a PDF stored in app. Plus, I can sign in from any device, from anywhere. And the best part? It includes Care and Handling for live updates to and from sitters—no more scribbling on paper, I can update instructions 24/7!

It truly feels like the future of pet care. All accounts are transferable so my companions will have a voice for life!

See LiveLinks for yourself at PetPort.app and check out the innovation yourself. Use my link to try it: https://petport.app?ref=${referralCode}`;
                    navigator.clipboard.writeText(message);
                    toast({ title: "Copied!", description: "Message copied to clipboard" });
                  }}
                  disabled={!referralCode}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Message
                </AzureButton>
              </div>

              {/* Message 2 */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm mb-3">
                  "Fellow pet parents! Check out PetPort - it's the ALL-IN-ONE digital information sharing platform for pets, horses, birds, and more! Medical records & all documents, one-tap links, QR codes & PDFs for care and handling instructions, ask for reviews from groomers & trainers, build a pet resume, certificates, one-tap LOST PET FLYER (no design needed), and so much more! Use my referral code:{" "}
                  <span className="font-mono text-[#5691af]">
                    {referralCode ? `https://petport.app?ref=${referralCode}` : "[Your link will appear here]"}
                  </span>
                  "
                </p>
                <AzureButton
                  size="sm"
                  onClick={() => {
                    const message = `Fellow pet parents! Check out PetPort - it's the ALL-IN-ONE digital information sharing platform for pets, horses, birds, and more! Medical records & all documents, one-tap links, QR codes & PDFs for care and handling instructions, ask for reviews from groomers & trainers, build a pet resume, certificates, one-tap LOST PET FLYER (no design needed), and so much more! Use my referral code: https://petport.app?ref=${referralCode}`;
                    navigator.clipboard.writeText(message);
                    toast({ title: "Copied!", description: "Message copied to clipboard" });
                  }}
                  disabled={!referralCode}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Message
                </AzureButton>
              </div>

              {/* Message 3 - Foster to Adopter Transfer */}
              <div className="bg-gradient-to-br from-[#5691af]/10 to-purple-50 rounded-lg p-4 border-2 border-[#5691af]/30">
                <p className="text-sm mb-3 leading-relaxed">
                  "Foster to Forever - Give your foster friend a story for life! 
                  PetPort's full account transfer seamlessly passes everything to the adopter - 
                  complete bio, resume, medical alerts, documents, care instructions, and so much more. 
                  Their entire journey transfers with them. Start their story today:{" "}
                  <span className="font-mono text-[#5691af] font-semibold">
                    {referralCode ? `https://petport.app?ref=${referralCode}` : "[Your link will appear here]"}
                  </span>
                  "
                </p>
                <AzureButton
                  size="sm"
                  onClick={() => {
                    const message = `Foster to Forever - Give your foster friend a story for life! PetPort's full account transfer seamlessly passes everything to the adopter - complete bio, resume, medical alerts, documents, care instructions, and so much more. Their entire journey transfers with them. Start their story today: https://petport.app?ref=${referralCode}`;
                    navigator.clipboard.writeText(message);
                    toast({ title: "Copied!", description: "Message copied to clipboard" });
                  }}
                  disabled={!referralCode}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Message
                </AzureButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your referral link to start earning!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">
                          {formatDate(referral.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(referral.commission_status)}
                            
                            {/* Show ineligibility badge for monthly plans */}
                            {referral.referred_plan_interval === 'month' && (
                              <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                                Monthly - Not Eligible
                              </Badge>
                            )}
                            
                            {/* Show if plan interval is missing */}
                            {!referral.referred_plan_interval && referral.commission_status === 'pending' && (
                              <Badge variant="outline" className="text-xs text-amber-600 border-amber-600/30">
                                Plan Info Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-[#5691af]">
                          ${(referral.commission_amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(referral.approved_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(referral.paid_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PWALayout>
  );
}
