import { Share2, Copy, MessageSquare, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AppShareButtonProps {
  variant?: "icon" | "full";
  className?: string;
}

export const AppShareButton = ({ variant = "icon", className = "" }: AppShareButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  const appUrl = window.location.origin; // Landing page URL
  const shareData = {
    title: "PetPort - Digital Pet Passport",
    text: "Create digital passports for your pets! Build beautiful profiles, store emergency info, and share with caregivers. Finally... Everything Your Pet Needs.",
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
    setShowEmailModal(true);
    setIsExpanded(false);
  };

  const sendAppEmail = async () => {
    if (!emailForm.to.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'app_share',
          recipientEmail: emailForm.to,
          petName: 'PetPort App',
          petId: 'app-share',
          senderName: 'A PetPort user',
          shareUrl: appUrl,
          customMessage: emailForm.message
        }
      });

      if (error) throw error;

      toast.success("Email sent successfully!");
      setShowEmailModal(false);
      setEmailForm({ to: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
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

        {/* Email Modal */}
        <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share PetPort via Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-medium">
                  Personal message (optional)
                </label>
                <Textarea
                  id="message"
                  placeholder="Check out this amazing app for pet owners!"
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowEmailModal(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendAppEmail}
                  disabled={isSending}
                  className="bg-brand-primary text-white hover:bg-brand-primary-dark hover:text-white"
                >
                  {isSending ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
            className="flex-1 gap-2 bg-brand-primary text-white hover:bg-brand-primary-dark hover:text-white"
            size="sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            size="sm"
            className="gap-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
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