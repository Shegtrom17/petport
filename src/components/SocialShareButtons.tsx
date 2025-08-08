
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Facebook, Copy, Check, Smartphone, MessageCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shareProfileOptimized } from "@/services/pdfService";

interface SocialShareButtonsProps {
  petName: string;
  petId: string;
  isMissingPet?: boolean;
  context?: 'profile' | 'care';
  shareUrlOverride?: string;
  defaultOpenOptions?: boolean;
}

export const SocialShareButtons = ({ petName, petId, isMissingPet = false, context = 'profile', shareUrlOverride, defaultOpenOptions = false }: SocialShareButtonsProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(defaultOpenOptions);
  const { toast } = useToast();
  
// Add cache-busting parameter to ensure fresh loads
const isCare = context === 'care';
const cacheBuster = `v=${Date.now()}`;
const path = isCare ? `care/${petId}` : `profile/${petId}`;
const shareUrl = shareUrlOverride ?? `${window.location.origin}/${path}?${cacheBuster}`;
const shareText = isMissingPet 
  ? `🚨 MISSING PET ALERT 🚨 Help us bring ${petName} home!`
  : (isCare ? `View ${petName}'s live Care Instructions on PetPort.` : `Meet ${petName}! Check out their PetPort profile.`);

  // Prioritize native mobile sharing
  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
const result = await shareProfileOptimized(shareUrl, petName, isCare ? 'care' : 'profile', isMissingPet);
      
      if (result.success) {
        if (result.shared) {
          toast({
            title: isCare ? "Care Link Shared! 📱" : "Profile Shared! 📱",
            description: isCare ? `${petName}'s care instructions link shared successfully.` : `${petName}'s profile has been shared successfully.`,
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
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleXShare = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  };

  const handleSMSShare = () => {
    const smsBody = `${shareText} ${shareUrl}`;
    const smsUrl = `sms:?&body=${encodeURIComponent(smsBody)}`;
    window.location.href = smsUrl;
  };

  const handleEmailShare = () => {
    const subject = isMissingPet ? `MISSING PET: ${petName}` : (isCare ? `${petName}'s Care Instructions` : `${petName}'s PetPort Profile`);
    const body = `${shareText}\n\n${shareUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleMessengerShare = () => {
    const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`;
    // Attempt to open Messenger app; if it doesn't open, suggest Facebook share as fallback
    window.location.href = messengerUrl;
    setTimeout(() => {
      toast({
        title: "Messenger share",
        description: "If Messenger didn’t open, use Facebook share instead.",
      });
    }, 800);
  };

  return (
    <Card className={`${isMissingPet ? 'border-2 border-red-500 bg-red-50' : 'border-2 border-gold-500/30 bg-[#f8f8f8]'} shadow-lg`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center space-x-2 text-lg font-semibold ${isMissingPet ? 'text-red-800' : 'text-navy-900'} border-b-2 ${isMissingPet ? 'border-red-500' : 'border-gold-500'} pb-2`}>
          <Share2 className="w-5 h-5" />
          <span>{isMissingPet ? `Help Find ${petName}!` : (isCare ? `Share ${petName}'s Care Instructions` : `Share ${petName}'s Profile`)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={`text-sm ${isMissingPet ? 'text-red-700' : 'text-navy-600'} text-center`}>
{isMissingPet 
            ? `Help us bring ${petName} home! Share their complete PetPort profile.`
            : (isCare ? `Share ${petName}'s live care plan (feeding schedule, routines, notes).` : `Share ${petName}'s complete public profile (photos, bio, reviews & more).`)
          }
        </p>
        
        <div className="space-y-3">
          {!showOptions ? (
            /* Show Options Button */
            <Button
              onClick={() => setShowOptions(true)}
              className={`w-full h-12 text-base font-semibold ${
                isMissingPet 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              <Share2 className="w-5 h-5 mr-2" />
{isMissingPet ? `Share ${petName}'s Missing Alert` : (isCare ? `Share Care Instructions` : `Share ${petName}'s Profile`)}
            </Button>
          ) : (
            <>
              {/* Primary Mobile Share Button */}
              <Button
                onClick={handleNativeShare}
                disabled={isSharing}
                className={`w-full h-12 text-base font-semibold ${
                  isMissingPet 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
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
              
              {/* Secondary Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className={`w-full ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-50' : 'border-primary text-primary hover:bg-primary/5'}`}
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                
                <Button
                  onClick={handleSMSShare}
                  variant="outline"
                  size="sm"
                  className={`w-full ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-50' : 'border-primary text-primary hover:bg-primary/5'}`}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Text/SMS
                </Button>
                
                <Button
                  onClick={handleEmailShare}
                  variant="outline"
                  size="sm"
                  className={`w-full ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-50' : 'border-primary text-primary hover:bg-primary/5'}`}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                
                <Button
                  onClick={handleFacebookShare}
                  variant="outline"
                  size="sm"
                  className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2]"
                >
                  <Facebook className="w-4 h-4 mr-1" />
                  Facebook
                </Button>
                
                <Button
                  onClick={handleMessengerShare}
                  variant="outline"
                  size="sm"
                  className={`w-full ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-50' : 'border-primary text-primary hover:bg-primary/5'}`}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Messenger
                </Button>
                
                <Button
                  onClick={handleXShare}
                  variant="outline"
                  size="sm"
                  className="w-full bg-black hover:bg-gray-800 text-white border-black"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X/Twitter
                </Button>
              </div>
              
              <Button
                onClick={() => setShowOptions(false)}
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
              >
                ← Back to options
              </Button>
            </>
          )}
        </div>
        
        <div className={`text-xs ${isMissingPet ? 'text-red-600' : 'text-navy-500'} text-center p-2 rounded ${isMissingPet ? 'bg-red-100' : 'bg-gold-100'} border ${isMissingPet ? 'border-red-200' : 'border-gold-200'}`}>
          📱 Share link: {shareUrl}
        </div>
      </CardContent>
    </Card>
  );
};
