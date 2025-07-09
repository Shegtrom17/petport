
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, QrCode, Share2, Loader2 } from "lucide-react";
import { generatePetPDF, generateQRCodeUrl, downloadPDF } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";

interface PetPDFGeneratorProps {
  petId: string;
  petName: string;
}

export const PetPDFGenerator = ({ petId, petName }: PetPDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      console.log('Starting PDF generation for pet:', petId);
      
      const result = await generatePetPDF(petId);
      
      if (result.success && result.pdfUrl) {
        setPdfUrl(result.pdfUrl);
        setQrCodeUrl(generateQRCodeUrl(result.pdfUrl));
        setIsDialogOpen(true);
        
        toast({
          title: "PDF Generated Successfully",
          description: `${petName}'s passport PDF is ready to download and share.`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    
    try {
      await downloadPDF(pdfUrl, `${petName}-passport.html`);
      toast({
        title: "Download Started",
        description: "Your pet's passport is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!pdfUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${petName}'s Pet Passport`,
          text: `Emergency information for ${petName}`,
          url: pdfUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(pdfUrl);
        toast({
          title: "Link Copied",
          description: "PDF link copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-800">
          <FileText className="w-5 h-5" />
          <span>Emergency Passport</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-amber-700">
          Generate a shareable PDF with {petName}'s vital information for emergencies and travel.
        </p>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Emergency Passport
                </>
              )}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Emergency Passport Ready</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {qrCodeUrl && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Scan QR Code for Quick Access:</p>
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for Pet Passport" 
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {pdfUrl && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 break-all">
                    Direct link: {pdfUrl}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
