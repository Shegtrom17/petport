import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEmailSharing } from "@/hooks/useEmailSharing";
import { shareViaMessenger, copyToClipboard } from "@/utils/messengerShare";
import { useIsMobile } from "@/hooks/useIsMobile";
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
  MessageSquare,
  Printer,
  FileDown,
  Eye,
  Loader2,
  X
} from "lucide-react";
import { generateShareURL } from "@/utils/domainUtils";
import { generateClientPetPDF, viewPDFBlob, downloadPDFBlob, isIOS } from '@/services/clientPdfService';
import { sharePDFBlob } from '@/services/pdfService';

interface QuickShareHubProps {
  petData: {
    id: string;
    name: string;
    careInstructions?: any;
  };
  isLost?: boolean;
  handlePetUpdate?: () => Promise<void>;
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
  const [carePdfBlob, setCarePdfBlob] = useState<Blob | null>(null);
  const [isGeneratingCarePdf, setIsGeneratingCarePdf] = useState(false);
  const [carePdfError, setCarePdfError] = useState<string | null>(null);
  const [showCarePdfDialog, setShowCarePdfDialog] = useState(false);
  const [carePdfEmailData, setCarePdfEmailData] = useState({ to: '', name: '', message: '' });
  
  const { toast } = useToast();
  const { sendEmail, isLoading: emailLoading } = useEmailSharing();
  const isMobile = useIsMobile();

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
    const directUrl = `${baseUrl}${page.path}`;
    
    if (page.id === 'missing') {
      return generateShareURL('missing-pet-share', petData.id!, directUrl);
    } else if (page.id === 'resume') {
      return generateShareURL('resume-share', petData.id!, directUrl);
    } else if (page.id === 'care') {
      return generateShareURL('care-instructions-share', petData.id!, directUrl);
    } else if (page.id === 'gallery') {
      return generateShareURL('gallery-share', petData.id!, directUrl);
    } else if (page.id === 'emergency') {
      return generateShareURL('emergency-share', petData.id!, directUrl);
    } else {
      return generateShareURL('profile-share', petData.id!, directUrl);
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
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile, use direct URL to avoid API errors with Facebook dialog
      const directUrl = `${baseUrl}${page.path}`;
      
      if (navigator.share) {
        // Use native sharing first
        navigator.share({
          title: `${petData.name}'s ${page.title}`,
          text: page.description,
          url: directUrl,
        }).catch(() => {
          // Fallback to copying link with instructions
          handleCopyLink(page);
          toast({
            title: "Facebook Mobile Limitation",
            description: "Link copied! Open Facebook app and paste the link in a post or story.",
            duration: 5000,
          });
        });
      } else {
        // Fallback: copy link and show instructions
        handleCopyLink(page);
        toast({
          title: "Facebook Mobile Limitation", 
          description: "Link copied! Open Facebook app and paste the link in a post or story.",
          duration: 5000,
        });
      }
    } else {
      // Desktop - use edge function URL for better OG tags
      const edgeUrl = getEdgeFunctionUrl(page);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(edgeUrl)}`;
      window.open(facebookUrl, '_blank');
    }
  };

  const handleMessengerShare = async (page: SharePage) => {
    const directUrl = `${baseUrl}${page.path}`;
    
    const needsFallback = await shareViaMessenger({
      url: directUrl,
      title: `${petData.name}'s ${page.title}`,
      text: page.description
    });

    if (needsFallback) {
      const copyToClipboardAction = async () => {
        const success = await copyToClipboard(directUrl);
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

  const handleGenerateCarePdf = async () => {
    if (!petData.id) {
      toast({ description: "Pet ID is required", variant: "destructive" });
      return;
    }

    setIsGeneratingCarePdf(true);
    setCarePdfError(null);

    try {
      const result = await generateClientPetPDF({ id: petData.id }, 'care');
      
      if (result.success && result.blob) {
        setCarePdfBlob(result.blob);
        toast({ description: "Care PDF generated successfully" });
      } else {
        throw new Error(result.error || "Failed to generate PDF");
      }
    } catch (error: any) {
      console.error('[Care PDF] Generation failed:', error);
      setCarePdfError(error.message || "Failed to generate PDF");
      toast({ description: error.message || "Failed to generate Care PDF", variant: "destructive" });
    } finally {
      setIsGeneratingCarePdf(false);
    }
  };

  const clearCarePdfCache = () => {
    setCarePdfBlob(null);
    setCarePdfError(null);
  };

  const handleViewCarePdf = async () => {
    if (!carePdfBlob) {
      toast({ description: "Please generate the PDF first", variant: "destructive" });
      return;
    }
    
    try {
      await viewPDFBlob(carePdfBlob, `${petData.name}_Care_Instructions.pdf`);
    } catch (error: any) {
      console.error('[Care PDF] View failed:', error);
      toast({ description: "Failed to open PDF", variant: "destructive" });
    }
  };

  const handlePrintCarePdf = async () => {
    if (!carePdfBlob) {
      toast({ description: "Please generate the PDF first", variant: "destructive" });
      return;
    }
    
    try {
      const url = URL.createObjectURL(carePdfBlob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 100);
      };
    } catch (error: any) {
      console.error('[Care PDF] Print failed:', error);
      toast({ description: "Failed to print PDF", variant: "destructive" });
    }
  };

  const handleDownloadCarePdf = async () => {
    if (!carePdfBlob) {
      toast({ description: "Please generate the PDF first", variant: "destructive" });
      return;
    }
    
    try {
      await downloadPDFBlob(carePdfBlob, `${petData.name}_Care_Instructions.pdf`);
      toast({ description: "PDF downloaded successfully" });
    } catch (error: any) {
      console.error('[Care PDF] Download failed:', error);
      toast({ description: "Failed to download PDF", variant: "destructive" });
    }
  };

  const handleShareCarePdf = async () => {
    if (!carePdfBlob) {
      toast({ description: "Please generate the PDF first", variant: "destructive" });
      return;
    }

    try {
      const result = await sharePDFBlob(
        carePdfBlob,
        `${petData.name}_Care_Instructions.pdf`,
        petData.name,
        'care'
      );

      if (result.success) {
        toast({ description: result.message || "Shared successfully" });
      } else {
        toast({ description: result.message || "Failed to share", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('[Care PDF] Share failed:', error);
      toast({ description: "Failed to share PDF", variant: "destructive" });
    }
  };

  const handleEmailCarePdf = async () => {
    if (!carePdfEmailData.to || !carePdfEmailData.name) {
      toast({ description: "Please fill in recipient email and name", variant: "destructive" });
      return;
    }

    if (!carePdfBlob) {
      toast({ description: "Please generate the PDF first", variant: "destructive" });
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(carePdfBlob);
      });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: carePdfEmailData.to,
          subject: `${petData.name}'s Care & Handling Instructions`,
          html: `
            <p>Hi ${carePdfEmailData.name},</p>
            <p>${carePdfEmailData.message || `Here are ${petData.name}'s care and handling instructions.`}</p>
            <p>Please find the PDF attached.</p>
          `,
          attachments: [{
            filename: `${petData.name}_Care_Instructions.pdf`,
            content: base64.split(',')[1]
          }]
        })
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      toast({ description: "Email sent successfully" });
      setShowCarePdfDialog(false);
      setCarePdfEmailData({ to: '', name: '', message: '' });
    } catch (error: any) {
      console.error('[Care PDF] Email failed:', error);
      toast({ description: "Failed to send email", variant: "destructive" });
    }
  };

  // Show all pages, but Lost Pet will be disabled if not available
  const availablePages = sharePages;

  return (
    <Card className="bg-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Share2 className="w-6 h-6 text-brand-primary" />
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
              
              {page.id === 'care' ? (
                /* Enhanced Care Card with PDF Actions */
                <div className="space-y-2" data-touch-safe="true">
                  {showOptionsFor !== page.id ? (
                    <Button
                      onClick={() => page.available ? setShowOptionsFor(page.id) : null}
                      onTouchEnd={(e) => e.stopPropagation()}
                      size="sm"
                      disabled={!page.available}
                      className="w-full text-xs bg-primary hover:bg-primary/90 text-white"
                      style={{ touchAction: 'none' }}
                    >
                      <Share2 className="w-3 h-3 mr-1 text-white" />
                      {page.available ? 'Share' : 'Unavailable'}
                    </Button>
                  ) : (
                    <>
                      {/* PDF Actions Section */}
                      <div className="space-y-2 border-t pt-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">Care PDF</span>
                          {carePdfBlob && (
                            <Button
                              onClick={clearCarePdfCache}
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1 text-xs"
                            >
                              <X className="h-2 w-2 mr-1" />
                              Clear
                            </Button>
                          )}
                        </div>

                        {!carePdfBlob ? (
                          <Button
                            onClick={handleGenerateCarePdf}
                            disabled={isGeneratingCarePdf || !page.available}
                            className="w-full text-xs"
                            variant="outline"
                            size="sm"
                          >
                            {isGeneratingCarePdf ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <FileDown className="mr-1 h-3 w-3" />
                                Generate Care PDF
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="grid grid-cols-2 gap-1">
                            <Button onClick={handleViewCarePdf} variant="outline" size="sm" className="text-xs py-2">
                              <Eye className="mr-1 h-2 w-2" />
                              View
                            </Button>
                            <Button onClick={handleDownloadCarePdf} variant="outline" size="sm" className="text-xs py-2">
                              <FileDown className="mr-1 h-2 w-2" />
                              Download
                            </Button>
                            <Button onClick={handlePrintCarePdf} variant="outline" size="sm" className="text-xs py-2">
                              <Printer className="mr-1 h-2 w-2" />
                              Print
                            </Button>
                            <Button onClick={handleShareCarePdf} variant="outline" size="sm" className="text-xs py-2">
                              <Share2 className="mr-1 h-2 w-2" />
                              Share
                            </Button>
                          </div>
                        )}

                        {carePdfError && (
                          <p className="text-xs text-destructive">{carePdfError}</p>
                        )}
                      </div>

                      {/* Share Options */}
                      <Button
                        onClick={() => page.available ? handleNativeShare(page) : null}
                        onTouchEnd={(e) => e.stopPropagation()}
                        size="sm"
                        disabled={!page.available || sharingId === page.id}
                        className="w-full text-xs bg-primary hover:bg-primary/90 text-white"
                        style={{ touchAction: 'none' }}
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
                      
                      <div className="grid grid-cols-3 gap-1" data-touch-safe="true">
                        <Button
                          onClick={() => page.available ? handleCopyLink(page) : null}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available || copyingId === page.id}
                          style={{ touchAction: 'none' }}
                          className="text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary"
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
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className="text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <MessageCircle className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">SMS</span>
                        </Button>
                        
                        <Button
                          onClick={() => page.available ? handleEmailShare(page) : null}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className="text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Mail className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">Email</span>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1" data-touch-safe="true">
                        <Button
                          onClick={() => page.available ? handleFacebookShare(page) : null}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className="text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Facebook className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">Facebook</span>
                        </Button>
                        
                        <Button
                          onClick={() => page.available ? handleMessengerShare(page) : null}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className="text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <MessageSquare className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">Messenger</span>
                        </Button>
                        
                        <Button
                          onClick={() => {
                            if (page.available) {
                              handleCopyLink(page);
                              toast({
                                title: "Instagram Limitation",
                                description: "Instagram doesn't support direct sharing. Link copied - paste it in Instagram Stories or posts.",
                                duration: 4000,
                              });
                            }
                          }}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className="text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Camera className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">Instagram</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Standard Card Layout for Other Pages */
                <div className="space-y-2" data-touch-safe="true">
                  {showOptionsFor !== page.id ? (
                    /* Show Options Button */
                    <Button
                      onClick={() => page.available ? setShowOptionsFor(page.id) : null}
                      onTouchEnd={(e) => e.stopPropagation()}
                      size="sm"
                      disabled={!page.available}
                      className={`w-full text-xs ${
                        page.variant === 'missing' 
                          ? page.available
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                      style={{ touchAction: 'none' }}
                    >
                      <Share2 className="w-3 h-3 mr-1 text-white" />
                      {page.available ? 'Share' : 'Unavailable'}
                    </Button>
                  ) : (
                    <>
                      {/* Quick Share Button */}
                      <Button
                        onClick={() => page.available ? handleNativeShare(page) : null}
                        onTouchEnd={(e) => e.stopPropagation()}
                        size="sm"
                        disabled={!page.available || sharingId === page.id}
                        className={`w-full text-xs ${
                          page.variant === 'missing' 
                            ? page.available
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 text-white'
                        }`}
                        style={{ touchAction: 'none' }}
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
                      <div className="grid grid-cols-3 gap-1" data-touch-safe="true">
                        <Button
                          onClick={() => page.available ? handleCopyLink(page) : null}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available || copyingId === page.id}
                          style={{ touchAction: 'none' }}
                          className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                            page.variant === 'missing' 
                              ? page.available
                                ? 'border-red-600 text-red-700 hover:bg-red-50' 
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary'
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
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                            page.variant === 'missing' 
                              ? page.available
                                ? 'border-red-600 text-red-700 hover:bg-red-50' 
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">SMS</span>
                        </Button>
                        
                        <Button
                          onClick={() => page.available ? handleEmailShare(page) : null}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                            page.variant === 'missing' 
                              ? page.available
                                ? 'border-red-600 text-red-700 hover:bg-red-50' 
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          <Mail className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">Email</span>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1" data-touch-safe="true">
                        <Button
                          onClick={() => page.available ? handleFacebookShare(page) : null}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                            page.variant === 'missing' 
                              ? page.available
                                ? 'border-red-600 text-red-700 hover:bg-red-50' 
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          <Facebook className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">Facebook</span>
                        </Button>
                        
                        <Button
                          onClick={() => page.available ? handleMessengerShare(page) : null}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                            page.variant === 'missing' 
                              ? page.available
                                ? 'border-red-600 text-red-700 hover:bg-red-50' 
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">Messenger</span>
                        </Button>
                        
                        <Button
                          onClick={() => {
                            if (page.available) {
                              handleCopyLink(page);
                              toast({
                                title: "Instagram Limitation",
                                description: "Instagram doesn't support direct sharing. Link copied - paste it in Instagram Stories or posts.",
                                duration: 4000,
                              });
                            }
                          }}
                          onTouchEnd={(e) => e.stopPropagation()}
                          variant="outline"
                          size="sm"
                          disabled={!page.available}
                          style={{ touchAction: 'none' }}
                          className={`text-sm flex flex-col items-center py-3 px-2 h-16 min-h-16 ${
                            page.variant === 'missing' 
                              ? page.available
                                ? 'border-red-600 text-red-700 hover:bg-red-50' 
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          <Camera className="w-4 h-4 mb-1" />
                          <span className="text-xs font-medium leading-tight">Instagram</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Centralized Tip:</strong> Visit each page to add and update content for richer, more complete profiles!
          </p>
        </div>
      </CardContent>

{/* Email Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={showEmailForm} onOpenChange={setShowEmailForm}>
          <DrawerContent className="drawer-content px-4 pb-4">
            <DrawerHeader>
              <DrawerTitle>Share via Email</DrawerTitle>
            </DrawerHeader>
            <div 
              className="max-h-[70vh] overflow-y-auto overscroll-contain"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              <div>
                <Label htmlFor="recipientEmail">Recipient Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={emailData.recipientEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  className="mt-1"
                  autoFocus
                  onFocus={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    const delay = isIOS ? 700 : 0;
                    setTimeout(() => {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, delay);
                  }}
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="recipientName">Recipient Name (optional)</Label>
                <Input
                  id="recipientName"
                  placeholder="Enter recipient's name"
                  value={emailData.recipientName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipientName: e.target.value }))}
                  className="mt-1"
                  onFocus={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    const delay = isIOS ? 700 : 0;
                    setTimeout(() => {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, delay);
                  }}
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="customMessage">Personal Message (optional)</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Add a personal message..."
                  value={emailData.customMessage}
                  onChange={(e) => setEmailData(prev => ({ ...prev, customMessage: e.target.value }))}
                  rows={3}
                  className="mt-1"
                  onFocus={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    const delay = isIOS ? 700 : 0;
                    setTimeout(() => {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, delay);
                  }}
                />
              </div>
              <div className="mt-4 flex gap-2">
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
          </DrawerContent>
        </Drawer>
      ) : (
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
      )}
    </Card>
  );
};