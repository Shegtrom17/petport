import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Download } from "lucide-react";
import { generatePetPDF, downloadPDFBlob } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface LostPetButtonProps {
  petId?: string;
  isMissing?: boolean;
  className?: string;
}

export const LostPetButton = ({ petId, isMissing = false, className = "" }: LostPetButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
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

    try {
      setIsGenerating(true);
      
      const result = await generatePetPDF(petId, 'emergency');
      
      if (result.success && result.blob) {
        await downloadPDFBlob(result.blob, result.fileName);
        toast({
          title: "Missing Pet Flyer Generated",
          description: "Your printable missing pet flyer has been downloaded.",
          variant: "default",
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating missing pet flyer:', error);
      toast({
        title: "Generation Failed", 
        description: "Failed to generate missing pet flyer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`bg-gradient-to-r ${
        isMissing 
          ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500' 
          : 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
      } text-white shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      {isGenerating ? (
        <>
          <Download className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : isMissing ? (
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
  );
};