import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEmailSharing } from "@/hooks/useEmailSharing";
import { 
  Heart, 
  Shield, 
  FileText, 
  Search, 
  Camera, 
  Star,
  Share2,
  Copy,
  ExternalLink,
  Smartphone,
  MessageCircle,
  Mail,
  Check,
  Facebook,
  MessageSquare
} from "lucide-react";

interface QuickShareHubProps {
  petData: {
    id?: string;
    name: string;
  };
  isLost: boolean;
}

interface SharePage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  available: boolean;
  variant: 'default' | 'missing';
}

export const QuickShareHub: React.FC<QuickShareHubProps> = ({ petData, isLost }) => {
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [currentPage, setCurrentPage] = useState<SharePage | null>(null);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    recipientName: '',
    customMessage: ''
  });
  
  const { toast } = useToast();
  const { sendEmail, isLoading: emailLoading } = useEmailSharing();

  const baseUrl = window.location.origin;

  // Debug logging
  console.log('QuickShareHub - petData:', petData);
  console.log('QuickShareHub - petData.id:', petData.id);
  console.log('QuickShareHub - isLost prop:', isLost);
  console.log('QuickShareHub - typeof isLost:', typeof isLost);

  // Don't render if no pet ID or empty string
  if (!petData.id || petData.id.trim() === '') {
    console.log('QuickShareHub - No valid pet ID, showing placeholder');
    return (
      <Card className="bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Share2 className="w-6 h-6 text-gray-400" />
            Quick Share Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">
              Share hub will be available once your pet profile is fully loaded
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sharePages: SharePage[] = [
    {
      id: 'emergency',
      title: 'Emergency Profile',
      description: 'Essential emergency contact & medical info',
      icon: <Shield className="w-5 h-5" />,
      path: `/emergency/${petData.id}`,
      available: true,
      variant: 'default'
    },
    {
      id: 'care',
      title: 'Care & Handling',
      description: 'Feeding, medical & care instructions',
      icon: <Heart className="w-5 h-5" />,
      path: `/care/${petData.id}`,
      available: true,
      variant: 'default'
    },
    {
      id: 'resume',
      title: 'Pet Resume',
      description: 'Credentials, certifications & achievements',
      icon: <FileText className="w-5 h-5" />,
      path: `/resume/${petData.id}`,
      available: true,
      variant: 'default'
    },
    {
      id: 'gallery',
      title: 'Portrait Gallery',
      description: 'Photo collection & memories',
      icon: <Camera className="w-5 h-5" />,
      path: `/gallery/${petData.id}`,
      available: true,
      variant: 'default'
    },
    {
      id: 'profile',
      title: 'General Profile',
      description: 'Essential pet information and photos from key profile sections',
      icon: <FileText className="w-5 h-5" />,
      path: `/profile/${petData.id}`, // Direct URL for humans
      available: true,
      variant: 'default'
    },
    {
      id: 'missing',
      title: 'Lost Pet Flyer',
      description: isLost ? 'Missing pet alert with contact info' : 'Mark pet as lost to activate',
      icon: <Search className="w-5 h-5 text-red-600" />,
      path: `/missing-pet/${petData.id}`,
      available: isLost,
      variant: 'missing'
    }
  ];

  // Generate edge function URLs for social media (OG tags)
  const getEdgeFunctionUrl = (page: SharePage): string => {
    const edgeShareBase = `https://dxghbhujugsfmaecilrq.supabase.co/functions/v1`;
    const directUrl = `${baseUrl}${page.path}`;
    const redirectParam = encodeURIComponent(directUrl);
    const cacheBuster = `v=${Date.now()}`;
    
    if (page.id === 'missing') {
      return `${edgeShareBase}/missing-pet-share?petId=${encodeURIComponent(petData.id!)}&redirect=${redirectParam}&${cacheBuster}`;
    } else if (page.id === 'resume') {
      return `${edgeShareBase}/resume-share?petId=${encodeURIComponent(petData.id!)}&redirect=${redirectParam}&${cacheBuster}`;
    } else {
      return `${edgeShareBase}/profile-share?petId=${encodeURIComponent(petData.id!)}&redirect=${redirectParam}&${cacheBuster}`;
    }
  };

  const handleCopyLink = async (page: SharePage) => {
    setCopyingId(page.id);
    try {
      // Use direct URL for copy (better UX for humans)
      const directUrl = `${baseUrl}${page.path}`;
      await navigator.clipboard.writeText(directUrl);
      toast({
        title: "Link Copied!",
        description: `${page.title} link copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setCopyingId(null);
    }
  };

  const handleNativeShare = async (page: SharePage) => {
    setSharingId(page.id);
    // Use direct URL for native share (better UX for humans)
    const directUrl = `${baseUrl}${page.path}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${petData.name}'s ${page.title}`,
          text: page.description,
          url: directUrl,
        });
      } catch (error: any) {
        if (!error?.message?.toLowerCase?.().includes('cancel')) {
          // Fallback to copy
          handleCopyLink(page);
        }
      }
    } else {
      // Fallback to copy for desktop
      handleCopyLink(page);
    }
    setSharingId(null);
  };

  const handleSMSShare = (page: SharePage) => {
    const directUrl = `${baseUrl}${page.path}`;
    const message = `Check out ${petData.name}'s ${page.title}: ${directUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const handleFacebookShare = (page: SharePage) => {
    // Use edge function URL for Facebook to get OG tags
    const edgeUrl = getEdgeFunctionUrl(page);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(edgeUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleMessengerShare = (page: SharePage) => {
    // Use edge function URL for Messenger to get OG tags
    const edgeUrl = getEdgeFunctionUrl(page);
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(edgeUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(edgeUrl)}`;
    window.open(messengerUrl, '_blank');
  };

  const handleEmailShare = (page: SharePage) => {
    setCurrentPage(page);
    setShowEmailForm(true);
  };

  const handleSendEmail = async () => {
    if (!currentPage || !emailData.recipientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }

    const directUrl = `${baseUrl}${currentPage.path}`;
    const shareType = currentPage.id === 'emergency' ? 'profile' :
                      currentPage.id === 'profile' ? 'profile' : 
                      currentPage.id === 'care' ? 'care' : 
                      currentPage.id === 'resume' ? 'resume' : 
                      currentPage.id === 'missing' ? 'missing_pet' : 'profile';

    const success = await sendEmail({
      type: shareType,
      recipientEmail: emailData.recipientEmail,
      recipientName: emailData.recipientName,
      petName: petData.name,
      petId: petData.id!,
      shareUrl: directUrl,
      customMessage: emailData.customMessage,
    });

    if (success) {
      setShowEmailForm(false);
      setEmailData({ recipientEmail: '', recipientName: '', customMessage: '' });
      setCurrentPage(null);
    }
  };

  const handleOpenLink = (page: SharePage) => {
    const directUrl = `${baseUrl}${page.path}`;
    window.open(directUrl, '_blank');
  };

  // Show all pages, but Lost Pet will be disabled if not available
  const availablePages = sharePages;

  return (
    <Card className="bg-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Share2 className="w-6 h-6 text-blue-600" />
          Quick Share Hub
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share live links that update in real time for viewers
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availablePages.map((page) => (
            <div 
              key={page.id}
              className={`p-4 rounded-lg border ${
                page.variant === 'missing' 
                  ? 'border-red-200 bg-red-50/50' 
                  : 'border-gray-200 bg-gray-50/50'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {page.icon}
                  <div>
                    <h3 className="font-semibold text-sm">{page.title}</h3>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                </div>
                {page.variant === 'missing' && (
                  <Badge variant="destructive" className="text-xs flex items-center justify-center self-center">
                    ALERT
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {showOptionsFor !== page.id ? (
                  /* Show Options Button */
                  <Button
                    onClick={() => page.available ? setShowOptionsFor(page.id) : null}
                    size="sm"
                    disabled={!page.available}
                    className={`w-full text-xs ${
                      page.variant === 'missing' 
                        ? page.available
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    <Share2 className="w-3 h-3 mr-1 text-white" />
                    {page.available ? 'Share' : 'Unavailable'}
                  </Button>
                ) : (
                  <>
                    {/* Quick Share Button */}
                    <Button
                      onClick={() => page.available ? handleNativeShare(page) : null}
                      size="sm"
                      disabled={!page.available || sharingId === page.id}
                      className={`w-full text-xs ${
                        page.variant === 'missing' 
                          ? page.available
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                    >
                      {sharingId === page.id ? (
                        <>
                          <div className="w-3 h-3 animate-spin rounded-full border border-white border-t-transparent mr-1" />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3 h-3 mr-1 text-white" />
                          Quick Share
                        </>
                      )}
                    </Button>
                    
                    {/* Secondary Options */}
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        onClick={() => page.available ? handleCopyLink(page) : null}
                        variant="outline"
                        size="sm"
                        disabled={!page.available || copyingId === page.id}
                        className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                          page.variant === 'missing' 
                            ? page.available
                              ? 'border-red-600 text-red-700 hover:bg-red-50' 
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        {copyingId === page.id ? (
                          <Check className="w-4 h-4 mb-1" />
                        ) : (
                          <Copy className="w-4 h-4 mb-1" />
                        )}
                        <span className="text-xs font-medium leading-tight">
                          {copyingId === page.id ? 'Copied' : 'Copy'}
                        </span>
                      </Button>
                      
                      <Button
                        onClick={() => page.available ? handleSMSShare(page) : null}
                        variant="outline"
                        size="sm"
                        disabled={!page.available}
                        className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                          page.variant === 'missing' 
                            ? page.available
                              ? 'border-red-600 text-red-700 hover:bg-red-50' 
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium leading-tight">SMS</span>
                      </Button>
                      
                      <Button
                        onClick={() => page.available ? handleEmailShare(page) : null}
                        variant="outline"
                        size="sm"
                        disabled={!page.available}
                        className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                          page.variant === 'missing' 
                            ? page.available
                              ? 'border-red-600 text-red-700 hover:bg-red-50' 
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        <Mail className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium leading-tight">Email</span>
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        onClick={() => page.available ? handleFacebookShare(page) : null}
                        variant="outline"
                        size="sm"
                        disabled={!page.available}
                        className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                          page.variant === 'missing' 
                            ? page.available
                              ? 'border-red-600 text-red-700 hover:bg-red-50' 
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        <Facebook className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium leading-tight">Facebook</span>
                      </Button>
                      
                      <Button
                        onClick={() => page.available ? handleMessengerShare(page) : null}
                        variant="outline"
                        size="sm"
                        disabled={!page.available}
                        className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                          page.variant === 'missing' 
                            ? page.available
                              ? 'border-red-600 text-red-700 hover:bg-red-50' 
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium leading-tight">Messenger</span>
                      </Button>
                      
                      <Button
                        onClick={() => page.available ? handleOpenLink(page) : null}
                        variant="outline"
                        size="sm"
                        disabled={!page.available}
                        className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                          page.variant === 'missing' 
                            ? page.available
                              ? 'border-red-600 text-red-700 hover:bg-red-50' 
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        <ExternalLink className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium leading-tight">Open</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Centralized Tip:</strong> Visit each page to add and update content for richer, more complete profiles!
          </p>
        </div>
      </CardContent>

      {/* Email Dialog */}
      <Dialog open={showEmailForm} onOpenChange={setShowEmailForm}>
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
            <div className="flex gap-2">
              <Button
                onClick={handleSendEmail}
                disabled={emailLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                {emailLoading ? 'Sending...' : 'Send Email'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEmailForm(false)}
                disabled={emailLoading}
                className="text-muted-foreground border-muted-foreground hover:bg-muted/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};