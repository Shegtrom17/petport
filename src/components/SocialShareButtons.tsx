
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Facebook, Twitter, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  petName: string;
  petId: string;
  isMissingPet?: boolean;
}

export const SocialShareButtons = ({ petName, petId, isMissingPet = false }: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = `${window.location.origin}/public/${petId}`;
  const shareText = isMissingPet 
    ? `🚨 MISSING PET ALERT 🚨 Help us bring ${petName} home! Please share this PetPort profile.`
    : `Meet ${petName}! Check out their PetPort profile.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The profile link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Card className={`${isMissingPet ? 'border-2 border-red-500 bg-red-50' : 'border-2 border-gold-500/30 bg-[#f8f8f8]'} shadow-lg`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center space-x-2 text-lg font-serif ${isMissingPet ? 'text-red-800' : 'text-navy-900'} border-b-2 ${isMissingPet ? 'border-red-500' : 'border-gold-500'} pb-2`}>
          <Share2 className="w-5 h-5" />
          <span>{isMissingPet ? `Help Find ${petName}!` : `Share ${petName}'s Profile`}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={`text-sm ${isMissingPet ? 'text-red-700' : 'text-navy-600'} text-center`}>
          {isMissingPet 
            ? `Help us bring ${petName} home! Share their PetPort profile.`
            : `Share ${petName}'s PetPort profile with friends and family.`
          }
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className={`w-full ${isMissingPet ? 'border-red-600 text-red-700 hover:bg-red-100' : 'border-navy-900 text-navy-900 hover:bg-navy-50'}`}
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          
          <Button
            onClick={handleFacebookShare}
            className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white"
          >
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </Button>
          
          <Button
            onClick={handleTwitterShare}
            className="w-full bg-[#1DA1F2] hover:bg-[#1A91DA] text-white"
          >
            <Twitter className="w-4 h-4 mr-2" />
            Twitter
          </Button>
        </div>
        
        <div className={`text-xs ${isMissingPet ? 'text-red-600' : 'text-navy-500'} text-center p-2 rounded ${isMissingPet ? 'bg-red-100' : 'bg-gold-100'} border ${isMissingPet ? 'border-red-200' : 'border-gold-200'}`}>
          📱 Share link: {shareUrl}
        </div>
      </CardContent>
    </Card>
  );
};
