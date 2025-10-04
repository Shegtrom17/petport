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
import { ArrowLeft, DollarSign, Users, Clock } from "lucide-react";
import { AzureButton } from "@/components/ui/azure-button";

interface Referral {
  id: string;
  referred_user_id: string | null;
  commission_amount: number;
  commission_status: string;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
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
              Earn $2 for every friend who subscribes
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

        {/* Connect Stripe Section */}
        <ConnectStripeButton
          onboardingStatus={
            (payoutInfo?.onboarding_status as "not_started" | "pending" | "completed") ||
            "not_started"
          }
          onClick={handleConnectStripe}
          isLoading={connectingStripe}
        />

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
                        <TableCell>{getStatusBadge(referral.commission_status)}</TableCell>
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

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#5691af]" />
              How It Works
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-[#5691af] font-bold">1.</span>
                <span>
                  Share your unique referral link with friends and family
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#5691af] font-bold">2.</span>
                <span>
                  When they subscribe to PetPort, you earn $2.00
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#5691af] font-bold">3.</span>
                <span>
                  Payouts are issued 45 days after their trial ends (via Stripe)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#5691af] font-bold">4.</span>
                <span>
                  Connect your Stripe account to start receiving payments
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PWALayout>
  );
}
