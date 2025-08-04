import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Download, Eye, Loader2 } from "lucide-react";
import { generatePetPDF, generatePublicProfileUrl, shareProfileOptimized } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface LostPetButtonProps {
  petId?: string;
  petName?: string;
  isMissing?: boolean;
  className?: string;
}

export const LostPetButton = ({ petId, petName = "Pet", isMissing = false, className = "" }: LostPetButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Dialog and loading states - exact same pattern as PetPDFGenerator
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);

  const showPdfOptions = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate a missing pet flyer.",
        variant: "destructive",
      });
      return;
    }

    if (!petId) {
      toast({
        title: "No Pet Selected",
        description: "Please select a pet to generate a missing pet flyer.",
        variant: "destructive",
      });
      return;
    }

    setIsOptionsDialogOpen(true);
  };

  const handlePdfAction = async (action: 'view' | 'download') => {
    setIsGenerating(true);
    try {
      const result = await generatePetPDF(petId!, 'lost_pet');

      if (result.success && result.blob) {
        setGeneratedPdfBlob(result.blob);
        
        if (action === 'download') {
          // Direct download
          const fileName = `${petName}_Missing_Pet_Flyer.pdf`;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(result.blob);
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
          
          toast({
            title: "Download Started",
            description: "Missing pet flyer is downloading.",
          });
          
          setIsOptionsDialogOpen(false);
        } else if (action === 'view') {
          // Open in new tab
          const url = URL.createObjectURL(result.blob);
          window.open(url, '_blank')?.focus();
          URL.revokeObjectURL(url);
          
          setIsOptionsDialogOpen(false);
        }
        
        toast({
          title: "Missing Pet Flyer Generated",
          description: "Your lost pet flyer is ready to download or share",
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      setGeneratedPdfBlob(null);
      setIsOptionsDialogOpen(false);
      toast({
        title: "Error",
        description: "Failed to generate missing pet flyer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={showPdfOptions}
        className={`bg-gradient-to-r ${
          isMissing 
            ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500' 
            : 'from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300'
        } text-white shadow-lg hover:shadow-xl transition-all ${className}`}
      >
        {isMissing ? (
          <>
            <AlertTriangle className="w-4 h-4 mr-2 animate-pulse" />
            MISSING FLYER
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Missing Pet Flyer
          </>
        )}
      </Button>

      {/* PDF Options Dialog - exact same pattern as PetPDFGenerator */}
      <Dialog open={isOptionsDialogOpen} onOpenChange={setIsOptionsDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-red-500 pb-2">
              🚨 Missing Pet Flyer Options
            </DialogTitle>
            <DialogDescription>
              Generate and download {petName}'s missing pet flyer for printing and sharing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* PDF Actions */}
            {!generatedPdfBlob && !isGenerating && (
              <div className="space-y-3">
                <p className="text-sm text-navy-600 text-center">
                  Choose how you'd like to use {petName}'s missing pet flyer:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handlePdfAction('view')}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    onClick={() => handlePdfAction('download')}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isGenerating && (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
                <p className="text-navy-600">Generating missing pet flyer...</p>
              </div>
            )}
            
            {/* Generated PDF Actions */}
            {generatedPdfBlob && !isGenerating && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-red-500/30 shadow-sm">
                  <h4 className="font-bold text-navy-900 mb-3">
                    🚨 Missing Pet Flyer PDF
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
                    <Button
                      onClick={() => {
                        const url = URL.createObjectURL(generatedPdfBlob);
                        window.open(url, '_blank')?.focus();
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={() => {
                        const fileName = `${petName}_Missing_Pet_Flyer.pdf`;
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(generatedPdfBlob);
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                      }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};