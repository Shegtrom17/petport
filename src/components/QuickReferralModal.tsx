import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Gift, Mail, MessageSquare } from "lucide-react";
import { Facebook } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickReferralModal = ({ isOpen, onClose }: QuickReferralModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadReferralCode();
    }
  }, [isOpen, user]);

  const loadReferralCode = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Step 1: Try to load existing referral code
      const { data, error } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_user_id", user.id)
        .is("referred_user_id", null)
        .maybeSingle();

      if (error) {
        console.error("Error loading referral code:", error);
        toast({
          title: "Error",
          description: "Failed to load your referral code.",
          variant: "destructive",
        });
        return;
      }
      
      // Step 2: If code exists, use it
      if (data) {
        setReferralCode(data.referral_code);
        return;
      }
      
      // Step 3: No code exists - create one automatically
      console.log("No referral code found, creating one...");
      
      const { data: newReferral, error: createError } = await supabase
        .rpc('create_user_referral', { _user_id: user.id });
      
      if (createError) {
        console.error("Error creating referral code:", createError);
        toast({
          title: "Setup Required",
          description: "Unable to generate your referral code. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      
      // Step 4: Load the newly created code
      const { data: freshData, error: reloadError } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_user_id", user.id)
        .is("referred_user_id", null)
        .single();
      
      if (reloadError || !freshData) {
        console.error("Error reloading referral code:", reloadError);
        toast({
          title: "Error",
          description: "Referral code created but failed to load.",
          variant: "destructive",
        });
        return;
      }
      
      setReferralCode(freshData.referral_code);
      toast({
        title: "Referral Code Ready!",
        description: "Your referral link has been generated.",
      });
      
    } catch (error) {
      console.error("Error in loadReferralCode:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = referralCode
    ? `https://petport.app?ref=${referralCode}`
    : "";

  const handleCopy = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareMessage = `🐾 Keep your pet's info safe with PetPort! Get 10% off yearly plans when you join with my link: ${referralLink}`;

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Try PetPort - Get 10% Off!");
    const body = encodeURIComponent(shareMessage);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSMSShare = () => {
    const message = encodeURIComponent(shareMessage);
    window.location.href = `sms:?body=${message}`;
  };

  const handleFacebookShare = () => {
    const shareUrl = encodeURIComponent(referralLink);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleViewFullStats = () => {
    onClose();
    navigate("/referrals");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#5691af]" />
            <DialogTitle>Refer & Earn</DialogTitle>
          </div>
          <DialogDescription>
            Earn $2 for every friend who subscribes to a yearly plan!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <>
              {/* Referral Link Display */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Your Referral Link
                </p>
                <p className="text-sm font-mono break-all text-foreground">
                  {referralLink || "Loading..."}
                </p>
              </div>

              {/* Copy Button */}
              <Button
                onClick={handleCopy}
                disabled={!referralLink}
                variant="azure"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>

              {/* Share Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleEmailShare}
                  disabled={!referralLink}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button
                  onClick={handleSMSShare}
                  disabled={!referralLink}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  SMS
                </Button>
                <Button
                  onClick={handleFacebookShare}
                  disabled={!referralLink}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Facebook className="h-4 w-4 mr-1" />
                  Facebook
                </Button>
              </div>

              {/* View Full Stats Link */}
              <Button
                onClick={handleViewFullStats}
                variant="azure"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Stats & Earnings
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
