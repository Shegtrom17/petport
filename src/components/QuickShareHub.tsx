// ⚠️ WARNING: FROZEN MODULE — DO NOT MODIFY WITHOUT OWNER APPROVAL
// This file contains verified sharing and PDF generation logic for all public and private pages.
// Last verified: October 2025
// Changes require explicit approval from Susan Hegstrom after:
//   1. Regression testing on iOS Safari, Android Chrome, Desktop
//   2. Verification that QuickShareHub routing, PDF buttons, and OG metadata work correctly
//   3. Confirmation that all sharing methods (Native, Copy, SMS, Email, Facebook, Messenger) function properly
// Any refactor proposals must be discussed in chat-and-plan mode first.
// @lovable:protect begin

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
import { validatePDFSize, showPDFSizeError } from "@/utils/pdfSizeValidator";
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
  X,
  Download,
  QrCode
} from "lucide-react";
import { generateShareURL } from "@/utils/domainUtils";
import { generateClientPetPDF, generateQRPrintSheetPDF, viewPDFBlob, downloadPDFBlob, isIOS } from '@/services/clientPdfService';
import { sharePDFBlob } from '@/services/pdfService';
import { shareQRCode } from "@/utils/qrShare";

interface QuickShareHubProps {
  petData: any; // Accept full pet object with all fields
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
  
  // Emergency PDF State
  const [emergencyPdfBlob, setEmergencyPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingEmergencyPdf, setIsGeneratingEmergencyPdf] = useState(false);
  const [emergencyPdfError, setEmergencyPdfError] = useState<string | null>(null);
  const [showEmergencyPdfDialog, setShowEmergencyPdfDialog] = useState(false);
  const [emergencyPdfEmailData, setEmergencyPdfEmailData] = useState({ to: '', name: '', message: '' });
  
  // Resume PDF State
  const [resumePdfBlob, setResumePdfBlob] = useState<Blob | null>(null);
  const [isGeneratingResumePdf, setIsGeneratingResumePdf] = useState(false);
  const [resumePdfError, setResumePdfError] = useState<string | null>(null);
  const [showResumePdfDialog, setShowResumePdfDialog] = useState(false);
  const [resumePdfEmailData, setResumePdfEmailData] = useState({ to: '', name: '', message: '' });
  
  // Gallery PDF State
  const [galleryPdfBlob, setGalleryPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingGalleryPdf, setIsGeneratingGalleryPdf] = useState(false);
  const [galleryPdfError, setGalleryPdfError] = useState<string | null>(null);
  const [showGalleryPdfDialog, setShowGalleryPdfDialog] = useState(false);
  const [galleryPdfEmailData, setGalleryPdfEmailData] = useState({ to: '', subject: '', message: '' });
  
  // Profile PDF State
  const [profilePdfBlob, setProfilePdfBlob] = useState<Blob | null>(null);
  const [isGeneratingProfilePdf, setIsGeneratingProfilePdf] = useState(false);
  const [profilePdfError, setProfilePdfError] = useState<string | null>(null);
  const [showProfilePdfDialog, setShowProfilePdfDialog] = useState(false);
  const [profilePdfEmailData, setProfilePdfEmailData] = useState({ to: '', name: '', message: '' });

  // Lost Pet PDF State
  const [lostPetPdfBlob, setLostPetPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingLostPetPdf, setIsGeneratingLostPetPdf] = useState(false);
  
  // QR Print Sheet State
  const [qrSheetBlob, setQrSheetBlob] = useState<Blob | null>(null);
  const [isGeneratingQRSheet, setIsGeneratingQRSheet] = useState(false);
  
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
      description: 'Professional photo gallery',
      icon: <Camera className="w-5 h-5" />,
      path: `/gallery/${petData.id}`,
      available: !!(petData?.id && petData.gallery_photos?.length > 0),
      variant: 'default'
    },
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'All pet information and photos from every section',
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

  // @lovable:protect-function - Edge URL routing for OG metadata (Oct 2025 Fix #1)
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
      const urlToCopy = page.id === 'missing' ? getEdgeFunctionUrl(page) : `${baseUrl}${page.path}`;
      await navigator.clipboard.writeText(urlToCopy);
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
      // On mobile, share the edge-function URL so Facebook/Messenger see OG tags
      const edgeUrl = getEdgeFunctionUrl(page);
      
      if (navigator.share) {
        // Use native sharing first with the edge URL
        navigator.share({
          title: `${petData.name}'s ${page.title}`,
          text: page.description,
          url: edgeUrl,
        }).catch(async () => {
          try {
            await navigator.clipboard.writeText(edgeUrl);
            toast({
              title: "Facebook Mobile",
              description: "Link with preview copied! Open Facebook and paste to post.",
              duration: 5000,
            });
          } catch {
            // Last resort: open Facebook sharer with edge URL
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(edgeUrl)}`;
            window.open(facebookUrl, '_blank');
          }
        });
      } else {
        // Fallback: copy edge URL and show instructions
        (async () => {
          try {
            await navigator.clipboard.writeText(edgeUrl);
            toast({
              title: "Facebook Mobile",
              description: "Link with preview copied! Open Facebook and paste to post.",
              duration: 5000,
            });
          } catch {
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(edgeUrl)}`;
            window.open(facebookUrl, '_blank');
          }
        })();
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

  // @lovable:protect-function - PDF generation for Care Instructions (Oct 2025)
  const handleGenerateCarePdf = async () => {
    if (!petData.id) {
      toast({ description: "Pet ID is required", variant: "destructive" });
      return;
    }

    setIsGeneratingCarePdf(true);
    setCarePdfError(null);

    try {
      const result = await generateClientPetPDF(petData, 'care');
      
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

  // Profile PDF Handlers
  const handleGenerateProfilePDF = async () => {
    if (!petData?.id) {
      toast({ description: "Pet data not available", variant: "destructive" });
      return;
    }
    
    setIsGeneratingProfilePdf(true);
    setProfilePdfError(null);
    toast({ title: "Generating Profile PDF...", description: "Please wait while we create your pet's full profile." });
    
    try {
      const result = await generateClientPetPDF(petData, 'full');
      
      if (result.success && result.blob) {
        setProfilePdfBlob(result.blob);
        toast({ title: "Profile PDF Ready!", description: "Your full profile PDF has been generated." });
      } else {
        throw new Error(result.error || "Failed to generate PDF");
      }
    } catch (error: any) {
      console.error('[Profile PDF] Generation failed:', error);
      setProfilePdfError(error.message || "Failed to generate PDF");
      toast({ title: "Generation Failed", description: "Could not generate profile PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingProfilePdf(false);
    }
  };

  // Gallery PDF Handlers
  const handleGenerateGalleryPDF = async () => {
    if (!petData?.id) {
      toast({ description: "Pet data not available", variant: "destructive" });
      return;
    }
    
    setIsGeneratingGalleryPdf(true);
    toast({ title: "Generating Gallery PDF...", description: "Please wait while we create your portrait gallery." });
    
    try {
      const result = await generateClientPetPDF(petData, 'gallery');
      
      if (result.success && result.blob) {
        setGalleryPdfBlob(result.blob);
        toast({ title: "Gallery PDF Ready!", description: "Your portrait gallery PDF has been generated." });
      } else {
        throw new Error(result.error || "Failed to generate PDF");
      }
    } catch (error: any) {
      console.error('[Gallery PDF] Generation failed:', error);
      toast({ title: "Generation Failed", description: "Could not generate gallery PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingGalleryPdf(false);
    }
  };

  // Lost Pet PDF Handler
  const handleGenerateLostPetPDF = async () => {
    if (!petData?.id) {
      toast({ description: "Pet data not available", variant: "destructive" });
      return;
    }
    
    setIsGeneratingLostPetPdf(true);
    toast({ title: "Generating Lost Pet Flyer...", description: "Creating your missing pet alert." });
    
    try {
      const mergedPetData = {
        ...petData,
        ...(Array.isArray(petData?.lost_pet_data) ? petData.lost_pet_data[0] : (petData?.lost_pet_data || {}))
      };
      const result = await generateClientPetPDF(mergedPetData, 'lost_pet');
      
      if (result.success && result.blob) {
        setLostPetPdfBlob(result.blob);
        toast({ title: "Lost Pet Flyer Ready!", description: "Your flyer has been generated." });
      } else {
        throw new Error(result.error || "Failed to generate PDF");
      }
    } catch (error: any) {
      console.error('[Lost Pet PDF] Generation failed:', error);
      toast({ title: "Generation Failed", description: "Could not generate flyer.", variant: "destructive" });
    } finally {
      setIsGeneratingLostPetPdf(false);
    }
  };

  // QR Print Sheet Handlers
  const handleGenerateQRSheet = async () => {
    if (!petData?.id) {
      toast({ description: "Pet data not available", variant: "destructive" });
      return;
    }
    
    setIsGeneratingQRSheet(true);
    toast({ title: "Generating QR Print Sheet...", description: "Creating your printable QR code sheet." });
    
    try {
      const result = await generateQRPrintSheetPDF(petData, isLost);
      
      if (result.success && result.blob) {
        setQrSheetBlob(result.blob);
        toast({ title: "QR Print Sheet Ready!", description: "Your printable sheet has been generated." });
      } else {
        throw new Error(result.error || "Failed to generate QR sheet");
      }
    } catch (error: any) {
      console.error('[QR Sheet] Generation failed:', error);
      toast({ title: "Generation Failed", description: "Could not generate QR sheet.", variant: "destructive" });
    } finally {
      setIsGeneratingQRSheet(false);
    }
  };

  const handleViewQRSheet = () => {
    if (qrSheetBlob) {
      viewPDFBlob(qrSheetBlob, `${petData.name}_QR_Print_Sheet.pdf`);
    }
  };

  const handlePrintQRSheet = () => {
    if (qrSheetBlob) {
      const url = URL.createObjectURL(qrSheetBlob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
      }
    }
  };

  const handleDownloadQRSheet = () => {
    if (qrSheetBlob) {
      downloadPDFBlob(qrSheetBlob, `${petData.name}_QR_Print_Sheet.pdf`);
      toast({
        title: "Download Started",
        description: "QR Print Sheet is downloading.",
      });
    }
  };

  const handleShareQRSheet = async () => {
    if (!qrSheetBlob) return;
    
    try {
      const result = await sharePDFBlob(qrSheetBlob, `${petData.name}_QR_Print_Sheet.pdf`, petData.name, 'profile');
      if (result.success) {
        toast({
          title: result.shared ? "PDF Shared!" : "Link Copied!",
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Share failed');
      }
    } catch (error) {
      console.error('QR Sheet share error:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share PDF. Please try download instead.",
        variant: "destructive",
      });
    }
  };

  const clearQRSheetCache = () => {
    if (qrSheetBlob) {
      setQrSheetBlob(null);
      toast({ title: "QR Sheet Cleared", description: "Generate a new one when needed." });
    }
  };

// @lovable:protect end