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

  const handleShare = async () => {
    if (!referralLink) return;

    const shareData = {
      title: "Join PetPort!",
      text: "Just found the perfect pet management app, and I mean perfect. PetPort gives our furry friends a voice of life!\n\nI'm blown away by the innovation and the safety features:\n\nSafety & Social Proof (Next-Gen Features)\n\n🐾 LiveLinks for instant pet profiles on the go.\n🐾 One-Tap Lost Pet Flyers (seriously next-gen status!).\n🐾 Sighting Boards for quick community support.\n🐾 Pet Resume Builder: Our pets can receive reviews from sitters/groomers! It's amazing for passing along verified care info and social proof to anyone new.\n\nBeyond the emergency tools. I can store all documents by upload or snap a photo and its a PDF stored in app. Plus, I can sign in from any device, from anywhere. And the best part? It includes Care and Handling for live updates to and from sitters—no more scribbling on paper, I can update instructions 24/7!\n\nIt truly feels like the future of pet care. All accounts are transferable so my companions will have a voice for life!\n\nSee LiveLinks for yourself at PetPort.app and check out the innovation yourself. Use my link to try it:",
      url: referralLink,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        // Close modal before opening native share to prevent UI issues
        onClose();
        
        await navigator.share(shareData);
        
        // Show success toast after share completes
        toast({
          title: "Shared!",
          description: "Thanks for sharing PetPort!",
        });
      } catch (error) {
        // User cancelled share, ignore
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
          toast({
            title: "Share failed",
            description: "Please try copying the link instead",
            variant: "destructive",
          });
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
                  variant="azure"
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              <Button
                onClick={handleShare}
                disabled={!referralLink}
                variant="azure"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
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
