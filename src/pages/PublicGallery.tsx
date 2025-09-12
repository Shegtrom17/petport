import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, ArrowLeft, Download, Share2, Loader2 } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { GALLERY_CONFIG } from "@/config/featureFlags";
import { generateClientPetPDF } from "@/services/clientPdfService";
import { useToast } from "@/hooks/use-toast";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
}

interface PetData {
  id: string;
  name: string;
  species?: string;
  gallery_photos?: GalleryPhoto[];
}

export const PublicGallery = () => {
  const { petId } = useParams<{ petId: string }>();
  const [searchParams] = useSearchParams();
  const [petData, setPetData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPDFDialogOpen, setIsPDFDialogOpen] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { toast } = useToast();

  const selectedPhotoIds = searchParams.get('photos')?.split(',') || [];

  useEffect(() => {
    const fetchPetData = async () => {
      if (!petId) {
        setError('Pet ID not found');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pets')
          .select(`
            id, 
            name, 
            species,
            gallery_photos (*)
          `)
          .eq('id', petId)
          .eq('is_public', true)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('Pet not found or not public');
          setLoading(false);
          return;
        }

        setPetData(data);
      } catch (err) {
        console.error('Error fetching pet data:', err);
        setError('Failed to load pet gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gallery Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This gallery is not available'}</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const galleryPhotos = petData.gallery_photos || [];
  const photosToShow = selectedPhotoIds.length > 0 
    ? galleryPhotos.filter(photo => selectedPhotoIds.includes(photo.id))
    : galleryPhotos;

  // Show warning if selected photos don't match any gallery photos
  const hasInvalidSelection = selectedPhotoIds.length > 0 && photosToShow.length === 0;

  const pageTitle = selectedPhotoIds.length > 0 
    ? `${petData.name}'s Selected Photos`
    : `${petData.name}'s Photo Gallery`;

  const handleShowPDFOptions = () => {
    if (!photosToShow || photosToShow.length === 0) {
      toast({
        title: "No Photos Available",
        description: "This gallery doesn't have any photos to include in a PDF.",
        variant: "destructive",
      });
      return;
    }
    setIsPDFDialogOpen(true);
    setGeneratedPdfBlob(null);
  };

  const handlePDFAction = async (action: 'view' | 'download') => {
    setIsGeneratingPDF(true);
    try {
      const result = await generateClientPetPDF(petData, 'gallery');
      
      if (result.success && result.blob) {
        setGeneratedPdfBlob(result.blob);
        
        if (action === 'download') {
          const fileName = `${petData.name}_Photo_Gallery.pdf`;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(result.blob);
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
          
          toast({
            title: "Download Started",
            description: `${petData.name}'s photo gallery PDF is downloading.`,
          });
          
          setIsPDFDialogOpen(false);
        }
      } else {
        throw new Error(result.error || 'Failed to generate gallery PDF');
      }
    } catch (error: any) {
      console.error('Gallery PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate gallery PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MetaTags 
        title={pageTitle}
        description={`View ${petData.name}'s photo gallery - ${photosToShow.length} beautiful photos`}
        image={photosToShow[0]?.url}
        url={window.location.href}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{pageTitle}</h1>
            <p className="text-gray-600">
              {selectedPhotoIds.length > 0 
                ? `${photosToShow.length} selected photos`
                : `${photosToShow.length} photos in gallery`
              }
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-6 h-6 text-blue-600" />
                <span>{petData.name}'s Photos</span>
              </CardTitle>
              
              {/* PDF and Share Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleShowPDFOptions}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                
                <Button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  <Share2 className="w-4 h-4" />
                  Share Gallery
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasInvalidSelection ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Selected Photos Not Found</h3>
                <p className="text-gray-600 mb-4">The selected photos are no longer available in this gallery.</p>
                <Link to={`/gallery/${petId}`}>
                  <Button variant="outline">
                    View Complete Gallery
                  </Button>
                </Link>
              </div>
            ) : photosToShow.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photosToShow.map((photo, index) => (
                  <div key={photo.id} className="space-y-3">
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                      <img 
                        src={photo.url} 
                        alt={`${petData.name} photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading={GALLERY_CONFIG.ENABLE_LAZY_LOADING ? "lazy" : "eager"}
                        decoding="async"
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium mb-2">Photo {index + 1}</p>
                      {photo.caption ? (
                        <p className="text-sm text-gray-600">{photo.caption}</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No description</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No photos to display</p>
              </div>
            )}
           </CardContent>
        </Card>

        {/* Share Section */}
        {showShareOptions && (
          <div className="mt-6">
            <SocialShareButtons 
              petName={petData.name}
              petId={petId || ""}
              isMissingPet={false}
              context="profile"
              shareUrlOverride={window.location.href}
              compact={false}
            />
          </div>
        )}

        {/* PDF Generation Dialog */}
        <Dialog open={isPDFDialogOpen} onOpenChange={setIsPDFDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Photo Gallery PDF</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!generatedPdfBlob ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Generate a professional PDF document featuring all photos from {petData.name}'s gallery.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsPDFDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handlePDFAction('download')}
                      disabled={isGeneratingPDF}
                      className="flex-1"
                    >
                      {isGeneratingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      {isGeneratingPDF ? "Generating..." : "Download PDF"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-green-600 mb-4">PDF generated successfully!</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsPDFDialogOpen(false)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm pb-8">
          <div className="border-t border-blue-200 mb-6 max-w-md mx-auto" />
          <p>This is a photo gallery for {petData.name}.</p>
          <p className="mt-2">
            Generated by{" "}
            <a 
              href={window.location.origin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              PetPort.app
            </a>
            {" "}— Be ready for travel, sitters, lost pet, and emergencies. Try it free.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicGallery;