import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, CheckCircle2, Share2, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { AzureButton } from "@/components/ui/azure-button";
import { Button } from "@/components/ui/button";

interface ReferralCardProps {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  approvedReferrals: number;
  paidReferrals: number;
  totalEarnings: number;
}

export const ReferralCard = ({
  referralCode,
  totalReferrals,
  pendingReferrals,
  approvedReferrals,
  paidReferrals,
  totalEarnings,
}: ReferralCardProps) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://petport.app/?ref=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please try copying the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareMessage = `🐾 Keep your pet's info safe with PetPort! Get 10% off yearly plans when you join with my link: ${referralLink}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join PetPort - Get 10% Off!",
          text: shareMessage,
          url: referralLink,
        });
        toast({
          title: "Shared Successfully!",
          description: "Thanks for spreading the word about PetPort!",
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Try PetPort - Get 10% Off!");
    const body = encodeURIComponent(shareMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSMSShare = () => {
    const body = encodeURIComponent(shareMessage);
    window.open(`sms:?&body=${body}`, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Your Referral Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Link Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            Share this link with friends
          </label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-muted rounded-md border border-border font-mono text-sm truncate">
              {referralLink}
            </div>
            <AzureButton
              onClick={handleCopyLink}
              className="flex items-center gap-2 shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </AzureButton>
          </div>

          {/* Social Sharing Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleNativeShare}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              onClick={handleEmailShare}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              onClick={handleSMSShare}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              SMS
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            🎁 Earn $2.00 for every Yearly Subscriber. Subscribers receive 10% discount.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalReferrals}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingReferrals}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{approvedReferrals}</div>
            <div className="text-xs text-muted-foreground mt-1">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{paidReferrals}</div>
            <div className="text-xs text-muted-foreground mt-1">Paid</div>
          </div>
        </div>

        {/* Earnings Display */}
        <div className="bg-gradient-to-r from-[#5691af]/10 to-[#4a7d99]/10 rounded-lg p-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">Total Earnings</div>
          <div className="text-3xl font-bold text-[#5691af]">
            ${(totalEarnings / 100).toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
