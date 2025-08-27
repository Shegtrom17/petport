import { Share2, Copy, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

interface AppShareButtonProps {
  variant?: "icon" | "full";
  className?: string;
}

export const AppShareButton = ({ variant = "icon", className = "" }: AppShareButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const appUrl = window.location.origin;
  const shareData = {
    title: "PetPort - Digital Pet Passport",
    text: "Check out PetPort - the digital passport for your pets! Create beautiful profiles, emergency info, and share with caregivers.",
    url: appUrl
  };

  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
        setIsExpanded(false);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.warn('Native sharing failed, falling back to copy link');
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      toast.success("Link copied to clipboard!");
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error("Failed to copy link");
    }
  };

  const handleSMSShare = () => {
    const smsText = encodeURIComponent(`${shareData.text} ${appUrl}`);
    window.open(`sms:?body=${smsText}`, '_blank');
    setIsExpanded(false);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(`${shareData.text}\n\n${appUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setIsExpanded(false);
  };

  if (variant === "icon") {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 touch-feedback"
          aria-label="Share PetPort app"
          data-coach-id="share-button"
        >
          <Share2 className="w-5 h-5" />
        </Button>

        {isExpanded && (
          <Card className="absolute top-12 right-0 z-50 p-2 min-w-[200px] shadow-lg">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNativeShare}
                className="w-full justify-start gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share App
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="w-full justify-start gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSMSShare}
                className="w-full justify-start gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Text Message
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEmailShare}
                className="w-full justify-start gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Share PetPort</h3>
        <p className="text-xs text-muted-foreground">
          Share the PetPort app with friends and family
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleNativeShare}
            className="flex-1 gap-2"
            size="sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            size="sm"
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
        </div>
        <div className="text-xs text-muted-foreground break-all">
          {appUrl}
        </div>
      </div>
    </Card>
  );
};