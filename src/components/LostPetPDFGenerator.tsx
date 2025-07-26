import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share, Eye, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generatePetPDF, downloadPDFBlob, viewPDFBlob, shareProfile } from "@/services/pdfService";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LostPetPDFGeneratorProps {
  petId: string;
  petName: string;
  isActive: boolean;
}

export const LostPetPDFGenerator = ({ petId, petName, isActive }: LostPetPDFGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [authError, setAuthError] = useState(false);

  const handleGenerateFlyer = async () => {
    if (!user) {
      setAuthError(true);
      return;
    }

    setAuthError(false);
    setIsGenerating(true);
    
    try {
      console.log('Generating lost pet PDF for:', petId);
      const result = await generatePetPDF(petId, 'lost_pet');
      
      if (result.success && result.blob) {
        setPdfBlob(result.blob);
        setShowDialog(true);
        
        toast({
          title: "Missing Pet Flyer Generated",
          description: "Your lost pet flyer is ready to download or share",
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating lost pet PDF:', error);
      toast({
        title: "Generation Failed", 
        description: "Could not generate the lost pet flyer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (pdfBlob) {
      const filename = `${petName.replace(/[^a-zA-Z0-9]/g, '_')}_Missing_Pet_Flyer.pdf`;
      await downloadPDFBlob(pdfBlob, filename);
      
      toast({
        title: "Flyer Downloaded",
        description: "Print and distribute to help find your pet",
      });
    }
  };

  const handleView = async () => {
    if (pdfBlob) {
      const filename = `${petName.replace(/[^a-zA-Z0-9]/g, '_')}_Missing_Pet_Flyer.pdf`;
      await viewPDFBlob(pdfBlob, filename);
    }
  };

  const handleShare = async () => {
    if (!pdfBlob) return;

    setIsSharing(true);
    try {
      // Create a temporary URL for the PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const shareUrl = window.location.origin + `/profile/${petId}`;
      
      const result = await shareProfile(
        shareUrl,
        `🚨 MISSING PET ALERT - ${petName}`,
        `Help us find ${petName}! Last seen information and contact details included. Please share with your network.`
      );

      if (result.success) {
        toast({
          title: "Shared Successfully",
          description: result.message,
        });
      }
      
      // Clean up the temporary URL
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Failed",
        description: "Could not share the flyer. Please try copying the link manually.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const buttonVariant = isActive ? "destructive" : "secondary";
  const buttonIcon = isActive ? AlertTriangle : FileText;
  const ButtonIcon = buttonIcon;

  return (
    <>
      {/* Authentication Error Alert */}
      {authError && (
        <Alert className="border-red-200 bg-red-50 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Please sign in to generate PDF documents for your pet.
          </AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerateFlyer}
        disabled={isGenerating || !user}
        className={`w-full py-3 font-semibold ${
          isActive 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        <ButtonIcon className="w-5 h-5 mr-2" />
        {isGenerating 
          ? 'Generating Flyer...' 
          : isActive 
            ? '🚨 Generate Missing Pet Flyer' 
            : 'Generate Lost Pet Flyer Template'
        }
      </Button>

      {/* PDF Actions Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Missing Pet Flyer Ready</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your professional missing pet flyer has been generated with all essential information. 
              Print copies to post around your neighborhood and share digitally on social media.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={handleView} variant="outline" className="justify-start">
                <Eye className="w-4 h-4 mr-2" />
                Preview Flyer
              </Button>
              
              <Button onClick={handleDownload} className="justify-start bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              
              <Button 
                onClick={handleShare} 
                variant="outline" 
                disabled={isSharing}
                className="justify-start"
              >
                <Share className="w-4 h-4 mr-2" />
                {isSharing ? 'Sharing...' : 'Share Alert'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded-lg border">
              <strong>💡 Pro Tips:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Print in color on bright paper for maximum visibility</li>
                <li>• Post at eye level in high-traffic areas</li>
                <li>• Share on local lost pet Facebook groups</li>
                <li>• Contact local animal shelters and vet clinics</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};