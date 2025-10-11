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
import { Copy, Share2, ExternalLink, Gift } from "lucide-react";
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
      } else if (data) {
        setReferralCode(data.referral_code);
      }
    } catch (error) {
      console.error("Error in loadReferralCode:", error);
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

  const handleShare = async () => {
    if (!referralLink) return;

    const shareData = {
      title: "Join PetPort!",
      text: "Check out PetPort - the best way to manage your pet's information! Use my referral link:",
      url: referralLink,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Thanks for sharing PetPort!",
        });
      } catch (error) {
        // User cancelled share, ignore
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  disabled={!referralLink}
                  className="flex-1 bg-[#5691af] hover:bg-[#4a7d99] text-white"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={!referralLink}
                  variant="outline"
                  className="flex-1 border-[#5691af] text-[#5691af] hover:bg-[#5691af]/10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* View Full Stats Link */}
              <Button
                onClick={handleViewFullStats}
                variant="ghost"
                className="w-full text-[#5691af] hover:text-[#4a7d99] hover:bg-[#5691af]/10"
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
