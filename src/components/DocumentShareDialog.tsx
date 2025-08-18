import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Share2, 
  Mail, 
  MessageCircle, 
  Copy, 
  Check, 
  Facebook, 
  Smartphone,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shareProfile } from "@/services/pdfService";
import { useEmailSharing } from "@/hooks/useEmailSharing";
import { useAuth } from "@/context/AuthContext";

interface Document {
  id: string;
  name: string;
  type: string;
  file_url: string;
  upload_date: string;
  size: string;
}

interface DocumentShareDialogProps {
  document: Document;
  petName: string;
  petId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS = {
  insurance: 'Insurance',
  vaccinations: 'Vaccinations',
  medical: 'Medical Records',
  medication: 'Medication',
  invoices: 'Invoices',
  registrations: 'Registrations',
  travel_docs: 'Travel Documents',
  misc: 'Miscellaneous'
};

export const DocumentShareDialog = ({ 
  document, 
  petName, 
  petId, 
  isOpen, 
  onClose 
}: DocumentShareDialogProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    recipientName: '',
    customMessage: ''
  });
  
  const { toast } = useToast();
  const { sendEmail, isLoading: emailLoading } = useEmailSharing();
  const { user } = useAuth();

  const categoryLabel = CATEGORY_LABELS[document.type as keyof typeof CATEGORY_LABELS] || 'Document';
  const shareUrl = document.file_url;
  const shareTitle = `${petName}'s ${categoryLabel}: ${document.name}`;
  const shareText = `Check out ${petName}'s ${categoryLabel.toLowerCase()} document: ${document.name}`;

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      const result = await shareProfile(shareUrl, shareTitle, shareText);
      
      if (result.success) {
        if (result.shared) {
          toast({
            title: "Document Shared! 📱",
            description: `${document.name} shared successfully.`,
          });
        } else {
          setCopied(true);
          toast({
            title: "Link Copied! 📋",
            description: "Document link copied to clipboard!",
          });
          setTimeout(() => setCopied(false), 3000);
        }
      } else {
        if (result.error === 'Share cancelled') {
          return;
        }
        throw new Error(result.error || 'Sharing failed');
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast({
        title: "Unable to Share",
        description: "Please try again or use the copy link option.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied! 📋",
        description: "Document link copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "Copy Failed",
        description: "Please select and copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleSMSShare = () => {
    const smsBody = `${shareText} ${shareUrl}`;
    const smsUrl = `sms:?&body=${encodeURIComponent(smsBody)}`;
    window.location.href = smsUrl;
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleXShare = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  };

  const handleMessengerShare = () => {
    const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`;
    window.location.href = messengerUrl;
    setTimeout(() => {
      toast({
        title: "Messenger share",
        description: "If Messenger didn't open, use Facebook share instead.",
      });
    }, 800);
  };

  const handleSendEmail = async () => {
    if (!emailData.recipientEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }

    // Create a custom message for document sharing
    const documentMessage = `I'm sharing ${petName}'s ${categoryLabel.toLowerCase()} document with you: ${document.name}`;
    const fullMessage = emailData.customMessage.trim() 
      ? `${emailData.customMessage}\n\n${documentMessage}`
      : documentMessage;

    const success = await sendEmail({
      type: 'profile', // Use profile type as base for document sharing
      recipientEmail: emailData.recipientEmail.trim(),
      recipientName: emailData.recipientName.trim() || undefined,
      petName,
      petId,
      shareUrl,
      customMessage: fullMessage,
      senderName: user?.user_metadata?.full_name || 'PetPort User'
    });

    if (success) {
      setShowEmailForm(false);
      setEmailData({ recipientEmail: '', recipientName: '', customMessage: '' });
      toast({
        title: "Email Sent! ✉️",
        description: `Document shared with ${emailData.recipientEmail}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <span>Share Document</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Document Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{document.name}</p>
            <p className="text-sm text-gray-500">{categoryLabel} • {document.size}</p>
          </div>

          {!showEmailForm ? (
          <div className="space-y-2">
              {/* Quick Share (Native) */}
              <Button
                onClick={handleNativeShare}
                disabled={isSharing}
                className="w-full h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSharing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5 mr-2" />
                    Quick Share
                  </>
                )}
              </Button>

              {/* Email Share - Most Important */}
              <Button
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full h-9 text-sm font-medium border-2 border-green-500 text-green-700 hover:bg-green-50"
              >
                <Mail className="w-5 h-5 mr-2" />
                📧 Share via Email
              </Button>

              {/* Other sharing options */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                
                <Button
                  onClick={handleSMSShare}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Text/SMS
                </Button>
                
                <Button
                  onClick={handleFacebookShare}
                  variant="outline"
                  size="sm"
                  className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2] text-xs"
                >
                  <Facebook className="w-4 h-4 mr-1" />
                  Facebook
                </Button>
                
                <Button
                  onClick={handleMessengerShare}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Messenger
                </Button>
              </div>

              <Button
                onClick={handleXShare}
                variant="outline"
                size="sm"
                className="w-full h-8 bg-black hover:bg-gray-800 text-white border-black text-xs"
              >
                <X className="w-4 h-4 mr-1" />
                X/Twitter
              </Button>
            </div>
          ) : (
            /* Email Form */
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipientEmail">Recipient Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={emailData.recipientEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="recipientName">Recipient Name (optional)</Label>
                <Input
                  id="recipientName"
                  placeholder="Enter recipient's name"
                  value={emailData.recipientName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipientName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="customMessage">Personal Message (optional)</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Add a personal message..."
                  value={emailData.customMessage}
                  onChange={(e) => setEmailData(prev => ({ ...prev, customMessage: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSendEmail}
                  disabled={emailLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {emailLoading ? 'Sending...' : 'Send Email'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailForm(false)}
                  disabled={emailLoading}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Document URL */}
          <div className="text-xs text-gray-500 text-center p-2 rounded bg-gray-50 border">
            📄 Document: {shareUrl}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
