import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft, X } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { GALLERY_CONFIG } from "@/config/featureFlags";

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
  const navigate = useNavigate();
  const [petData, setPetData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Close Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-white/80 hover:bg-white shadow-md"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <MetaTags
        title={pageTitle}
        description={`View ${petData.name}'s photo gallery - ${photosToShow.length} beautiful photos`}
        image={photosToShow[0]?.url || "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/Photo-og%20(1).png"}
        url={window.location.href}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          
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
                  <div key={photo.id}>
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                      <img 
                        src={photo.url} 
                        alt={`${petData.name} photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading={GALLERY_CONFIG.ENABLE_LAZY_LOADING ? "lazy" : "eager"}
                        decoding="async"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                          {photo.caption}
                        </div>
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