import { Share2, Copy, MessageSquare, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const [isStandalone, setIsStandalone] = useState(false);
  const isMobile = useIsMobile();

  // Detect if app is running in standalone mode (PWA)
  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    };
    
    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);
    
    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
    };
  }, []);

  // Hide share button when not in standalone mode (browser handles sharing)
  if (!isStandalone) {
    return null;
  }

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
          className="p-1.5 touch-feedback opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Share PetPort app"
        >
          <Share2 className="w-4 h-4" />
        </Button>

        {isExpanded && (
          <Card className="absolute top-10 right-0 z-50 p-2 min-w-[180px] shadow-lg border-border/50" data-touch-safe="true">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNativeShare}
                onTouchEnd={(e) => e.stopPropagation()}
                className="w-full justify-start gap-2"
                style={{ touchAction: 'none' }}
              >
                <Share2 className="w-4 h-4" />
                Share App
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                onTouchEnd={(e) => e.stopPropagation()}
                className="w-full justify-start gap-2"
                style={{ touchAction: 'none' }}
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSMSShare}
                onTouchEnd={(e) => e.stopPropagation()}
                className="w-full justify-start gap-2"
                style={{ touchAction: 'none' }}
              >
                <MessageSquare className="w-4 h-4" />
                Text Message
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEmailShare}
                onTouchEnd={(e) => e.stopPropagation()}
                className="w-full justify-start gap-2"
                style={{ touchAction: 'none' }}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </Card>
        )}

{/* Email Modal/Drawer */}
        {isMobile ? (
          <Drawer open={showEmailModal} onOpenChange={setShowEmailModal}>
            <DrawerContent className="px-4 pb-4" data-touch-safe="true" style={{ touchAction: 'none' }}>
              <DrawerHeader>
                <DrawerTitle>Share PetPort via Email</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
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
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
            <DialogContent className="sm:max-w-md" data-touch-safe="true" style={{ touchAction: 'none' }}>
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
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className}`} data-touch-safe="true">
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Share PetPort</h3>
        <p className="text-xs text-muted-foreground">
          Share the PetPort app with friends and family
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleNativeShare}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex-1 gap-2 bg-brand-primary text-white hover:bg-brand-primary-dark hover:text-white"
            size="sm"
            style={{ touchAction: 'none' }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            onTouchEnd={(e) => e.stopPropagation()}
            size="sm"
            className="gap-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
            style={{ touchAction: 'none' }}
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