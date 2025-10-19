
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Facebook, Copy, Check, Smartphone, MessageCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shareProfileOptimized } from "@/services/pdfService";
import { shareViaMessenger, copyToClipboard } from "@/utils/messengerShare";
import { useEmailSharing } from "@/hooks/useEmailSharing";
import { useAuth } from "@/context/AuthContext";
import { generateShareURL } from "@/utils/domainUtils";
import { generatePetPDF } from "@/services/clientPdfService";
import { useIsMobile } from "@/hooks/useIsMobile";

  interface SocialShareButtonsProps {
  petName: string;
  petId: string;
  isMissingPet?: boolean;
  context?: 'profile' | 'care' | 'credentials' | 'resume' | 'reviews' | 'missing' | 'gallery' | 'travel';
  shareUrlOverride?: string;
  defaultOpenOptions?: boolean;
  compact?: boolean;
  horizontalScroll?: boolean;
}

export const SocialShareButtons = ({ petName, petId, isMissingPet = false, context = 'profile', shareUrlOverride, defaultOpenOptions = false, compact = false, horizontalScroll = false }: SocialShareButtonsProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(defaultOpenOptions);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    recipientName: '',
    customMessage: '',
    attachPdf: false
  });
  const { toast } = useToast();
  const { sendEmail, isLoading: emailLoading } = useEmailSharing();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Debug: ensure correct component variant renders
  console.log("SocialShareButtons", { context, isMissingPet, petId, petName, defaultOpenOptions, compact, horizontalScroll });
  
// Add cache-busting parameter to ensure fresh loads
const isCare = context === 'care';
const isResume = context === 'resume' || context === 'credentials'; // Consolidate credentials to resume
const isReviews = context === 'reviews';
const isGallery = context === 'gallery';
const isTravel = context === 'travel';
const isMissing = isMissingPet || context === 'missing';
const cacheBuster = `v=${Date.now()}`;
const path = isMissing
  ? `missing-pet/${petId}`
  : isCare 
    ? `care/${petId}` 
    : isResume  // Now includes both resume and credentials contexts
      ? `resume/${petId}`
      : isReviews 
        ? `reviews/${petId}`
        : isGallery
          ? `gallery/${petId}`
          : isTravel
            ? `travel/${petId}`
            : `profile/${petId}`;

// Generate direct SPA URLs for human-friendly sharing
const directUrl = `${window.location.origin}/${path}`;

// Social media share URL (for OG tags) vs Direct URL (for humans)
const edgeFunctionName = isMissing ? 'missing-pet-share' : isResume ? 'resume-share' : isCare ? 'care-instructions-share' : isGallery ? 'gallery-share' : isTravel ? 'travel-share' : 'profile-share';
const socialShareUrl = generateShareURL(edgeFunctionName, petId, directUrl);

// Prefer edge URL for missing-pet so Facebook/Messenger see OG tags; otherwise use direct URL
const shareUrl = shareUrlOverride ?? (isMissing ? socialShareUrl : directUrl);
const shareText = isMissing 
  ? `🚨 MISSING PET ALERT 🚨 Help us bring ${petName} home!`
  : (isCare 
      ? `View ${petName}'s live Care Instructions on PetPort.` 
      : (isResume  // Now covers both resume and credentials contexts
          ? `View ${petName}'s professional resume on PetPort.`
          : (isReviews
              ? `Read ${petName}'s reviews & references on PetPort.`
              : (isTravel
                  ? `🌍 Check out ${petName}'s travel adventures and interactive map on PetPort!`
                  : `Meet ${petName}! Check out their PetPort profile.`))));

  // Prioritize native mobile sharing
  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
const result = await shareProfileOptimized(shareUrl, petName, isMissing ? 'profile' : (isCare ? 'care' : (isResume ? 'resume' : (isReviews ? 'reviews' : 'profile'))), isMissing);
      if (result.success) {
        if (result.shared) {
          toast({
            title: isCare ? "Care Link Shared! 📱" : (isResume ? "Resume Shared! 📱" : (isReviews ? "Reviews Shared! 📱" : "Profile Shared! 📱")),
            description: isCare ? `${petName}'s care instructions link shared successfully.` : (isResume ? `${petName}'s resume link shared successfully.` : (isReviews ? `${petName}'s reviews link shared successfully.` : `${petName}'s profile has been shared successfully.`)),
          });
        } else {
          setCopied(true);
          toast({
            title: "Link Copied! 📋",
            description: "Link copied to clipboard - paste to share anywhere!",
          });
          setTimeout(() => setCopied(false), 3000);
        }
      } else {
        if (result.error === 'Share cancelled') {
          // Don't show error for user cancellation
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
        description: "Link copied - paste to share anywhere!",
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

  const handleFacebookShare = () => {
    // Use social share URL for Facebook to get proper OG tags
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialShareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleXShare = () => {
    // Use social share URL for Twitter to get proper OG tags
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(socialShareUrl)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  };

  const handleSMSShare = () => {
    const smsBody = `${shareText} ${shareUrl}`;
    const smsUrl = `sms:?&body=${encodeURIComponent(smsBody)}`;
    window.location.href = smsUrl;
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

    const emailType = context === 'credentials' ? 'resume' : context as 'profile' | 'care' | 'resume' | 'reviews' | 'missing_pet';
    
    let pdfAttachment: string | undefined;
    let pdfFileName: string | undefined;

    // Generate PDF if requested
    if (emailData.attachPdf && (isCare || isResume)) {
      try {
        toast({
          title: "Generating PDF...",
          description: "Please wait while we prepare your PDF attachment",
        });

        const pdfType = isCare ? 'care' : 'resume';
        const result = await generatePetPDF(petId, pdfType);
        
        if (result.success && result.blob) {
          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]); // Remove data URL prefix
            };
            reader.onerror = reject;
          });
          reader.readAsDataURL(result.blob);
          
          pdfAttachment = await base64Promise;
          pdfFileName = result.fileName || `${petName}-${pdfType}.pdf`;
        }
      } catch (error) {
        console.error('PDF generation failed:', error);
        toast({
          title: "PDF generation failed",
          description: "The email will be sent without the PDF attachment",
          variant: "destructive",
        });
      }
    }
    
    const success = await sendEmail({
      type: isMissingPet ? 'missing_pet' : emailType,
      recipientEmail: emailData.recipientEmail.trim(),
      recipientName: emailData.recipientName.trim() || undefined,
      petName,
      petId,
      shareUrl,
      customMessage: emailData.customMessage.trim() || undefined,
      senderName: user?.user_metadata?.full_name || 'PetPort User',
      pdfAttachment,
      pdfFileName
    });

    if (success) {
      setShowEmailForm(false);
      setEmailData({ recipientEmail: '', recipientName: '', customMessage: '', attachPdf: false });
    }
  };

  const handleEmailShare = () => {
    setShowEmailForm(true);
  };
  const handleMessengerShare = async () => {
    const needsFallback = await shareViaMessenger({
      url: shareUrl,
      title: isMissingPet 
        ? `Help bring ${petName} home!` 
        : (isCare 
            ? `${petName}'s Care Instructions` 
            : (isResume 
                ? `${petName}'s Resume` 
                : `${petName}'s Profile`)),
      text: isMissingPet 
        ? `${petName} is missing! Please help share their alert.`
        : `Check out ${petName}'s profile on PetPort!`
    });

    if (needsFallback) {
      const copyToClipboardAction = async () => {
        const success = await copyToClipboard(shareUrl);
        if (success) {
          toast({
            description: "🐾 Link copied! Now paste it in Messenger.",
            duration: 3000,
          });
        }
      };

      toast({
        title: "🐶 Ruff day? Messenger is being stubborn.",
        description: "Tap 'Copy Link' and paste it into the chat — your pet's profile will still shine like a fresh-bathed pup!",
        duration: 6000,
        action: (
          <Button
            onClick={copyToClipboardAction}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            📋 Copy Link
          </Button>
        ),
      });
    }
    setTimeout(() => {
      toast({
        title: "Messenger share",
        description: "If Messenger didn’t open, use Facebook share instead.",
      });
    }, 800);
  };

  const optionBtnBase = horizontalScroll ? 'shrink-0 min-w-[160px]' : 'w-full';
  const optionsOuterClass = horizontalScroll ? '-mx-4 px-4 overflow-x-auto' : '';
  const optionsInnerClass = horizontalScroll ? 'flex gap-2 min-w-max pb-1' : 'grid grid-cols-1 sm:grid-cols-3 gap-2';
  return (
    <Card className={`${isMissingPet ? 'border-2 border-red-500 bg-red-50' : 'border-2 border-gold-500/30 bg-[#f8f8f8]'} shadow-lg`}>
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <CardTitle className={`flex items-center space-x-2 ${compact ? 'text-responsive-base' : 'text-responsive-lg'} font-semibold ${isMissingPet ? 'text-red-800' : 'text-navy-900'} border-b-2 ${isMissingPet ? 'border-red-500' : 'border-gold-500'} pb-2 text-wrap-safe`}>
          <Share2 className="w-5 h-5 flex-shrink-0" />
          <span className="min-w-0 truncate">{isMissingPet ? `Help Find ${petName}!` : (isCare ? `Share ${petName}'s Care Instructions` : (isResume ? `Share ${petName}'s Resume` : (isReviews ? `Share ${petName}'s Reviews` : `Share ${petName}'s Profile`)))}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!compact && (
          <p className={`text-sm ${isMissingPet ? 'text-red-700' : 'text-navy-600'} text-center`}>
            {isMissingPet 
              ? `Help us bring ${petName} home! Share their live missing alert page with last-seen details and contacts.`
              : (isCare 
                  ? `Share ${petName}'s live care plan (feeding schedule, routines, notes).` 
                  : (isResume
                      ? `Share ${petName}'s professional resume (training, achievements, experience).`
                      : `Share ${petName}'s complete public profile (photos, bio, reviews & more).`)
                )
            }
          </p>
        )}
        <div className="space-y-3" data-touch-safe="true">
          {!showOptions ? (
            /* Show Options Button */
            <Button
              onClick={() => setShowOptions(true)}
              onTouchEnd={(e) => e.stopPropagation()}
              size={compact ? "sm" : "default"}
              className={`w-full ${compact ? 'h-10' : 'h-12'} font-semibold ${
                isMissingPet 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              style={{ touchAction: 'none' }}
            >
                <Share2 className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-responsive-sm truncate">
                  {compact 
                    ? (isMissingPet ? 'Share alert' : 'Share')
                    : (isMissingPet ? `Share ${petName}'s Missing Alert` : (isCare ? `Share Care Instructions` : (isResume ? `Share Resume` : (isReviews ? `Share Reviews` : `Share ${petName}'s Profile`))))}
                </span>
              </Button>
          ) : (
            <>
              {/* Primary Mobile Share Button */}
              <Button
                onClick={handleNativeShare}
                onTouchEnd={(e) => e.stopPropagation()}
                disabled={isSharing}
                size={compact ? "sm" : "default"}
                className={`w-full ${compact ? 'h-10' : 'h-12'} font-semibold ${
                  isMissingPet 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
                style={{ touchAction: 'none' }}
              >
                {isSharing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 flex-shrink-0" />
                    <span className="text-responsive-sm">Sharing...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-responsive-sm">Quick Share</span>
                  </>
                )}
              </Button>
              
              {/* Secondary Options */}
              <div className={optionsOuterClass} data-touch-safe="true">
                <div className={optionsInnerClass}>
                  <Button
                    onClick={handleCopyLink}
                    onTouchEnd={(e) => e.stopPropagation()}
                    variant="outline"
                    size="sm"
                    className={`${optionBtnBase} ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-600 hover:text-white' : 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                    style={{ touchAction: 'none' }}
                  >
                    {copied ? <Check className="w-4 h-4 mr-1 flex-shrink-0" /> : <Copy className="w-4 h-4 mr-1 flex-shrink-0" />}
                    <span className="text-responsive-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
                  </Button>
                  
                  <Button
                    onClick={handleSMSShare}
                    onTouchEnd={(e) => e.stopPropagation()}
                    variant="outline"
                    size="sm"
                    className={`${optionBtnBase} ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-600 hover:text-white' : 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                    style={{ touchAction: 'none' }}
                  >
                    <MessageCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-responsive-xs">Text/SMS</span>
                  </Button>
                  
{isMobile ? (
                    <Drawer open={showEmailForm} onOpenChange={setShowEmailForm}>
                      <DrawerTrigger asChild>
                        <Button
                          onClick={handleEmailShare}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          className={`${optionBtnBase} ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-600 hover:text-white' : 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                          style={{ touchAction: 'none' }}
                        >
                          <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="text-responsive-xs">Email</span>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent className="px-4 pb-4">
                        <DrawerHeader>
                          <DrawerTitle>Share via Email</DrawerTitle>
                        </DrawerHeader>
                        <div className="space-y-4 with-keyboard-padding">
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
                          {(isCare || isResume) && (
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="attachPdf"
                                checked={emailData.attachPdf}
                                onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, attachPdf: !!checked }))}
                              />
                              <Label htmlFor="attachPdf" className="text-sm text-muted-foreground">
                                Attach as PDF file
                              </Label>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSendEmail}
                              disabled={emailLoading}
                              className="flex-1 bg-brand-primary text-white hover:bg-brand-primary-dark hover:text-white"
                            >
                              <span className="text-responsive-sm">{emailLoading ? 'Sending...' : 'Send Email'}</span>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowEmailForm(false)}
                              disabled={emailLoading}
                              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                            >
                              <span className="text-responsive-sm">Cancel</span>
                            </Button>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Dialog open={showEmailForm} onOpenChange={setShowEmailForm}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={handleEmailShare}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          className={`${optionBtnBase} ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-600 hover:text-white' : 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                          style={{ touchAction: 'none' }}
                        >
                          <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="text-responsive-xs">Email</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share via Email</DialogTitle>
                        </DialogHeader>
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
                          {(isCare || isResume) && (
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="attachPdf"
                                checked={emailData.attachPdf}
                                onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, attachPdf: !!checked }))}
                              />
                              <Label htmlFor="attachPdf" className="text-sm text-muted-foreground">
                                Attach as PDF file
                              </Label>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSendEmail}
                              disabled={emailLoading}
                              className="flex-1 bg-brand-primary text-white hover:bg-brand-primary-dark hover:text-white"
                            >
                              <span className="text-responsive-sm">{emailLoading ? 'Sending...' : 'Send Email'}</span>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowEmailForm(false)}
                              disabled={emailLoading}
                              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                            >
                              <span className="text-responsive-sm">Cancel</span>
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Button
                    onClick={handleFacebookShare}
                    onTouchEnd={(e) => e.stopPropagation()}
                    variant="outline"
                    size="sm"
                    className={`${optionBtnBase} bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2]`}
                    style={{ touchAction: 'none' }}
                  >
                    <Facebook className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-responsive-xs">Facebook</span>
                  </Button>
                  
                  <Button
                    onClick={handleMessengerShare}
                    onTouchEnd={(e) => e.stopPropagation()}
                    variant="outline"
                    size="sm"
                    className={`${optionBtnBase} ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-600 hover:text-white' : 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                    style={{ touchAction: 'none' }}
                  >
                    <MessageCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-responsive-xs">Messenger</span>
                  </Button>
                  
                  <Button
                    onClick={handleXShare}
                    onTouchEnd={(e) => e.stopPropagation()}
                    variant="outline"
                    size="sm"
                    className={`${optionBtnBase} bg-black hover:bg-gray-800 text-white border-black`}
                    style={{ touchAction: 'none' }}
                  >
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-responsive-xs">X/Twitter</span>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      handleCopyLink();
                      toast({
                        title: 'Instagram Limitation',
                        description: "Instagram doesn't support direct sharing. Link copied - paste it in Instagram Stories or posts.",
                        duration: 4000,
                      });
                    }}
                    onTouchEnd={(e) => e.stopPropagation()}
                    variant="outline"
                    size="sm"
                    className={`${optionBtnBase} bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white border-transparent`}
                    style={{ touchAction: 'none' }}
                  >
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-responsive-xs">Instagram</span>
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={() => setShowOptions(false)}
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
              >
                <span className="text-responsive-sm">← Back to options</span>
              </Button>
            </>
          )}
        </div>
        
          <div className={`text-xs ${isMissingPet ? 'text-red-600' : 'text-navy-500'} p-2 rounded ${isMissingPet ? 'bg-red-100' : 'bg-gold-100'} border ${isMissingPet ? 'border-red-200' : 'border-gold-200'} w-full max-w-full overflow-wrap-anywhere break-words`}>
            📱 Share link: {shareUrl}
          </div>
      </CardContent>
    </Card>
  );
};
