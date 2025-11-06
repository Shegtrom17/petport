import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnhancedDialog } from "@/components/ui/enhanced-dialog";
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
  X,
  FileDown,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shareProfile, sharePDFBlob } from "@/services/pdfService";
import { useEmailSharing } from "@/hooks/useEmailSharing";
import { useAuth } from "@/context/AuthContext";
import { shareViaMessenger, copyToClipboard } from "@/utils/messengerShare";
import { viewPDFBlob, downloadPDFBlob, isIOS } from '@/services/clientPdfService';
import jsPDF from 'jspdf';
import { validatePDFSize, showPDFSizeError } from "@/utils/pdfSizeValidator";

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
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  
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

  const handleMessengerShare = async () => {
    const needsFallback = await shareViaMessenger({
      url: shareUrl,
      title: `${petName}'s ${categoryLabel}`,
      text: `Check out ${petName}'s ${categoryLabel.toLowerCase()} document: ${document.name}`
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
  };

  // Convert image to PDF
  const convertImageToPdf = async (imageBlob: Blob, fileName: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);
      
      img.onload = () => {
        try {
          // Create PDF with appropriate size for the image
          const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px'
          });

          // Calculate dimensions to fit image on page while maintaining aspect ratio
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 20;
          const maxWidth = pageWidth - (margin * 2);
          const maxHeight = pageHeight - (margin * 2);
          
          let imgWidth = img.width;
          let imgHeight = img.height;
          
          // Scale down if image is larger than page
          if (imgWidth > maxWidth || imgHeight > maxHeight) {
            const widthRatio = maxWidth / imgWidth;
            const heightRatio = maxHeight / imgHeight;
            const ratio = Math.min(widthRatio, heightRatio);
            
            imgWidth = imgWidth * ratio;
            imgHeight = imgHeight * ratio;
          }
          
          // Center the image on the page
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
          
          // Add title at top
          pdf.setFontSize(12);
          pdf.setTextColor(60, 60, 60);
          pdf.text(`${petName} - ${fileName}`, margin, margin);
          
          // Add the image
          pdf.addImage(url, 'JPEG', x, y, imgWidth, imgHeight);
          
          // Convert to blob
          const pdfBlob = pdf.output('blob');
          URL.revokeObjectURL(url);
          resolve(pdfBlob);
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    toast({ title: "Generating PDF...", description: "Creating a shareable PDF version of this document." });

    try {
      // Fetch the document file
      const response = await fetch(document.file_url);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const blob = await response.blob();
      const fileType = blob.type.toLowerCase();
      
      // Check if it's already a PDF
      if (fileType === 'application/pdf') {
        console.log('[Document PDF] Already PDF format, using as-is');
        setPdfBlob(blob);
      } 
      // Check if it's an image that needs to be converted to PDF
      else if (fileType.startsWith('image/')) {
        console.log('[Document PDF] Image detected, converting to PDF');
        const pdfBlob = await convertImageToPdf(blob, document.name);
        setPdfBlob(pdfBlob);
      }
      else {
        throw new Error('Unsupported file type. Only PDF and image files can be shared as PDFs.');
      }
      
      setShowPdfOptions(true);
      toast({ title: "PDF Ready!", description: "Your document PDF is ready to share." });
    } catch (error: any) {
      console.error('[Document PDF] Generation failed:', error);
      toast({ 
        title: "Generation Failed", 
        description: error.message || "Could not generate PDF. Please try sharing the document link instead.", 
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleViewPdf = async () => {
    if (!pdfBlob) return;
    try {
      await viewPDFBlob(pdfBlob, `${petName}-${document.name}.pdf`);
    } catch (error) {
      console.error('Error viewing PDF:', error);
      toast({ description: "Could not open PDF. Try downloading instead.", variant: "destructive" });
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfBlob) return;
    try {
      await downloadPDFBlob(pdfBlob, `${petName}-${document.name}.pdf`);
      toast({ description: "PDF downloaded successfully!" });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({ description: "Could not download PDF", variant: "destructive" });
    }
  };

  const handleSharePdf = async () => {
    if (!pdfBlob) return;
    try {
      await sharePDFBlob(pdfBlob, `${petName}-${document.name}.pdf`, petName, 'profile');
      toast({ description: "PDF shared successfully!" });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      toast({ description: "Could not share PDF", variant: "destructive" });
    }
  };

  const handleEmailPdf = async () => {
    if (!pdfBlob || !emailData.recipientEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }

    // Size validation
    const sizeValidation = validatePDFSize(pdfBlob);
    if (sizeValidation.exceedsLimit) {
      showPDFSizeError(sizeValidation.sizeInMB);
      return;
    }

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const base64Content = base64data.split(',')[1];

      const documentMessage = `I'm sharing ${petName}'s ${categoryLabel.toLowerCase()} document with you: ${document.name}`;
      const fullMessage = emailData.customMessage.trim() 
        ? `${emailData.customMessage}\n\n${documentMessage}`
        : documentMessage;

      const success = await sendEmail({
        type: 'profile',
        recipientEmail: emailData.recipientEmail.trim(),
        recipientName: emailData.recipientName.trim() || undefined,
        petName,
        petId,
        shareUrl,
        customMessage: fullMessage,
        senderName: user?.user_metadata?.full_name || 'PetPort User',
        pdfAttachment: base64Content,
        pdfFileName: `${petName}-${document.name}.pdf`
      });

      if (success) {
        setShowEmailForm(false);
        setShowPdfOptions(false);
        setEmailData({ recipientEmail: '', recipientName: '', customMessage: '' });
        toast({
          title: "Email Sent! ✉️",
          description: `Document PDF shared with ${emailData.recipientEmail}`,
        });
      }
    };
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

    // If PDF is available, send with PDF attachment
    if (pdfBlob) {
      await handleEmailPdf();
      return;
    }

    // Otherwise send link only
    const documentMessage = `I'm sharing ${petName}'s ${categoryLabel.toLowerCase()} document with you: ${document.name}`;
    const fullMessage = emailData.customMessage.trim() 
      ? `${emailData.customMessage}\n\n${documentMessage}`
      : documentMessage;

    const success = await sendEmail({
      type: 'profile',
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
    <EnhancedDialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] sm:max-w-[400px] max-h-[90svh] overflow-hidden flex flex-col min-h-0 native-scroll hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <span>Share Document</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 p-1 with-keyboard-padding">
          {/* Document Info */}
          <div className="bg-gray-50 p-2 rounded-lg">
            <p className="font-medium text-gray-900 text-sm truncate">{document.name}</p>
            <p className="text-xs text-gray-500">{categoryLabel} • {document.size}</p>
          </div>

          {showPdfOptions ? (
            /* PDF Options */
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">✅ PDF Ready!</p>
                <p className="text-xs text-green-600 mt-1">
                  {pdfBlob ? `${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB` : 'Ready to share'}
                </p>
              </div>

              <Button
                onClick={handleViewPdf}
                variant="outline"
                className="w-full"
              >
                <FileDown className="w-4 h-4 mr-2" />
                View PDF
              </Button>

              <Button
                onClick={handleDownloadPdf}
                variant="outline"
                className="w-full"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>

              {!isIOS() && (
                <Button
                  onClick={handleSharePdf}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share PDF
                </Button>
              )}

              <Button
                onClick={() => setShowEmailForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                📎 Email PDF
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setShowPdfOptions(false);
                  setPdfBlob(null);
                }}
                className="w-full"
              >
                Back to Share Options
              </Button>
            </div>
          ) : !showEmailForm ? (
          <div className="space-y-2">
              {/* PDF Generation Button */}
              <Button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="w-full h-10 text-sm bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    📄 Generate & Share PDF
                  </>
                )}
              </Button>

              {/* Quick Share (Native) */}
              <Button
                onClick={handleNativeShare}
                disabled={isSharing}
                className="w-full h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSharing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5 mr-2" />
                    Quick Share Link
                  </>
                )}
              </Button>

              {/* Email Share - Most Important */}
              <Button
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full h-9 text-sm border-2 border-green-500 text-green-700 hover:bg-green-50"
              >
                <Mail className="w-4 h-4 mr-2" />
                📧 Share Link via Email
              </Button>

              {/* Other sharing options */}
              <div className="grid grid-cols-2 gap-1">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs px-1"
                >
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                
                <Button
                  onClick={handleSMSShare}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs px-1"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  SMS
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-1">
                <Button
                  onClick={handleFacebookShare}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2] text-xs px-1"
                >
                  <Facebook className="w-3 h-3" />
                </Button>
                
                <Button
                  onClick={handleMessengerShare}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs px-1"
                >
                  <MessageCircle className="w-3 h-3" />
                </Button>
                
                <Button
                  onClick={handleXShare}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 bg-black hover:bg-gray-800 text-white border-black text-xs px-1"
                >
                  <X className="w-3 h-3" />
                </Button>
                
                <Button
                  onClick={() => {
                    handleCopyLink();
                    toast({
                      title: "Instagram Limitation",
                      description: "Instagram doesn't support direct sharing. Link copied - paste it in Instagram Stories or posts.",
                      duration: 4000,
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white border-transparent text-xs px-1"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </Button>
              </div>
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

              {pdfBlob && (
                <div className="bg-purple-50 p-2 rounded border border-purple-200">
                  <p className="text-xs text-purple-700">
                    📎 PDF will be attached to email ({(pdfBlob.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSendEmail}
                  disabled={emailLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {emailLoading ? 'Sending...' : pdfBlob ? 'Send with PDF' : 'Send Email'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailForm(false);
                    if (!pdfBlob) {
                      // If no PDF, go back to main options
                      setShowPdfOptions(false);
                    }
                  }}
                  disabled={emailLoading}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Document URL */}
          <div className="text-xs text-gray-500 text-center p-2 rounded bg-gray-50 border break-all">
            📄 {shareUrl}
          </div>
        </div>
      </DialogContent>
    </EnhancedDialog>
  );
};
