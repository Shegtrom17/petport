import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft, Eye, ExternalLink } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
}

interface PublicGalleryData {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  
  gallery_photos: GalleryPhoto[];
  is_public: boolean;
}

export default function PublicGallery() {
  const { petId } = useParams<{ petId: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PublicGalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get selected photo IDs from URL params
  const selectedPhotoIds = searchParams.get('photos')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    const fetchGalleryData = async () => {
      if (!petId) return;

      try {
        const { data: petData, error } = await supabase
          .from('pets')
          .select(`
            id,
            name,
            species,
            breed,
            
            is_public,
            gallery_photos (
              id,
              url,
              caption
            )
          `)
          .eq('id', petId)
          .eq('is_public', true)
          .single();

        if (error) {
          console.error('Error fetching gallery:', error);
          setData(null);
          return;
        }

        setData(petData as PublicGalleryData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Camera className="w-16 h-16 text-gray-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Gallery Not Available</h1>
          <p className="text-gray-600 max-w-md">
            This pet's gallery is not publicly accessible or doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter photos if specific ones are selected
  const photosToDisplay = selectedPhotoIds.length > 0 
    ? data.gallery_photos.filter(photo => selectedPhotoIds.includes(photo.id))
    : data.gallery_photos;

  const pageTitle = selectedPhotoIds.length > 0 && selectedPhotoIds.length < data.gallery_photos.length
    ? `${data.name}'s Selected Photos (${selectedPhotoIds.length} photos)`
    : `${data.name}'s Photo Gallery`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MetaTags 
        title={pageTitle}
        description={`View ${data.name}'s photo gallery - ${photosToDisplay.length} photos of this ${data.species.toLowerCase()}`}
        image={undefined}
        url={window.location.href}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <Camera className="w-16 h-16 text-white/60" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>
                  <p className="text-blue-100">
                    {data.breed ? `${data.breed} ${data.species}` : data.species}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  <Eye className="w-3 h-3 mr-1" />
                  {photosToDisplay.length} photos
                </Badge>
                <Button asChild variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                  <Link to={`/profile/${petId}`}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        {photosToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {photosToDisplay.map((photo, index) => (
              <Card key={photo.id} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square relative">
                  <img 
                    src={photo.url} 
                    alt={photo.caption || `${data.name} photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {photo.caption && (
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{photo.caption}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Photos Selected</h3>
              <p className="text-gray-600">
                The selected photos are not available or have been removed.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}