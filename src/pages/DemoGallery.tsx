import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, X } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StoryStream from "@/components/StoryStream";
import { supabase } from "@/integrations/supabase/client";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const FINNEGAN_ID = "297d1397-c876-4075-bf24-41ee1862853a";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  position: number;
}

interface PetData {
  name: string;
  breed: string | null;
  species: string | null;
  photoUrl: string | null;
  gallery_photos: GalleryPhoto[];
}

export default function DemoGallery() {
  const navigate = useNavigate();
  const [data, setData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Signal to Prerender.io that page is ready after meta tags render
    const timer = setTimeout(() => {
      (window as any).prerenderReady = true;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch pet data
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('name, breed, species')
          .eq('id', FINNEGAN_ID)
          .single();

        if (petError) throw petError;

        // Fetch primary photo
        const { data: photoData } = await supabase
          .from('pet_photos')
          .select('photo_url')
          .eq('pet_id', FINNEGAN_ID)
          .single();

        // Fetch gallery photos
        const { data: galleryData } = await supabase
          .from('gallery_photos')
          .select('id, url, caption, position')
          .eq('pet_id', FINNEGAN_ID)
          .order('position', { ascending: true });

        setData({
          name: petData.name,
          breed: petData.breed,
          species: petData.species,
          photoUrl: photoData?.photo_url || null,
          gallery_photos: galleryData || []
        });
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-cream">
        <p>Unable to load demo data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-cream">
      <MetaTags 
        title="Pet Photo Gallery LiveLink Demo - Organize Pet Pictures | PetPort"
        description="Live photo gallery LiveLink demo with 36 slots, drag & drop organization & social sharing. Perfect for lost pet identification and sharing memories."
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/resume-og-1mb.png"
        url={`https://petport.app/demo/gallery`}
      />

      {/* Product Schema for Gallery & Story Feature */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "PetPort Photo Gallery & Story Stream",
          "description": "Digital photo gallery and life story timeline for pets. Create beautiful visual memories with captions, milestones, and shareable moments. Perfect for documenting distinctive features for lost pet recovery.",
          "image": "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/resume-og-1mb.png",
          "brand": {
            "@type": "Brand",
            "name": "PetPort"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "156",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Amanda Rodriguez"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "reviewBody": "The photo gallery feature is beautiful! I documented all my puppy's distinctive markings with captions. When she got lost, having those detailed photos in one place helped us create the perfect lost pet flyer immediately."
            },
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "David Kim"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "reviewBody": "Love the story stream! It's like a Instagram just for my pets. I share the gallery link with family and they can see all our pet's adventures in one beautiful timeline."
            }
          ],
          "offers": {
            "@type": "Offer",
            "price": "14.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://petport.app/subscribe"
          }
        })}
      </script>

      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://petport.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Demos",
              "item": "https://petport.app/demos"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Photo Gallery Demo",
              "item": "https://petport.app/demo/gallery"
            }
          ]
        })}
      </script>

      {/* Live Demo Banner */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/demos')}
            className="absolute left-0 hover:bg-white/20 text-white p-2 h-auto"
            aria-label="Close demo"
          >
            <X className="h-5 w-5" />
          </Button>
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">✨ Demo – PetPort LiveLink</span>
          <a href="/#pricing">
            <Button 
              variant="outline" 
              size="sm"
              className="ml-4 bg-white text-brand-primary hover:bg-brand-cream border-white"
            >
              Get Started Today
            </Button>
          </a>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigate('/')}
                className="cursor-pointer"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigate('/demos')}
                className="cursor-pointer"
              >
                Demos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Photo Gallery</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <header className="text-center mb-8">
          {data.photoUrl && (
            <div className="mb-6">
              <img 
                src={data.photoUrl} 
                alt={data.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-sage-200"
              />
            </div>
          )}
          <h1 className="text-4xl font-sans font-bold text-navy-900 mb-3">
            {data.name}'s Photo Gallery
          </h1>
          <p className="text-lg text-navy-600 mb-2">
            {data.breed && data.species ? `${data.breed} • ${data.species}` : data.breed || data.species || ''}
          </p>
          <p className="text-sm text-navy-500">
            Secure your pet's best moments. Perfect for social sharing and Lost Pet Identifiers
          </p>
        </header>

        {/* Photo Gallery Grid */}
        {data.gallery_photos && data.gallery_photos.length > 0 ? (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.gallery_photos.map((photo, index) => (
                <Card key={photo.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img 
                        src={photo.url}
                        alt={photo.caption || `${data.name} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-navy-900">
                        #{index + 1}
                      </div>
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-navy-500">
                {data.gallery_photos.length} of 36 photo slots used
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No photos in gallery yet</p>
          </div>
        )}

        {/* Story Stream Section */}
        <div className="mb-8">
          <StoryStream petId={FINNEGAN_ID} petName={data.name} />
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-8 text-center text-white mb-6">
          <h2 className="text-2xl font-bold mb-3">Ready to Showcase Your Pet's Best Moments?</h2>
          <p className="mb-4 text-white/90">Organize up to 36 photos with captions, drag & drop reordering, and social media ready sharing</p>
          <a href="/#pricing">
            <Button 
              size="lg"
              className="bg-white text-brand-primary hover:bg-brand-cream"
            >
              Get Started Today
            </Button>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm pb-8">
          <div className="border-t border-sage-200 mb-6 max-w-md mx-auto" />
          <p>This is a live demo of {data.name}'s real PetPort photo gallery.</p>
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
      </main>
    </div>
  );
}
