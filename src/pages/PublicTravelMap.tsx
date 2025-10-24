import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Trophy, Plane, X } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { FreeInteractiveMap } from "@/components/FreeInteractiveMap";
import { sanitizeText } from "@/utils/inputSanitizer";

interface TravelLocation {
  id: string;
  name: string;
  type: 'state' | 'country';
  code?: string;
  date_visited?: string;
  photo_url?: string;
  notes?: string;
}

interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  category?: string;
}

const PublicTravelMap = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [petData, setPetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleClose = async () => {
    // Check if user is authenticated (owner previewing their LiveLink)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated user - return to their app page
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/profile');
      }
    } else {
      // Anonymous visitor - check if from demo/marketing
      const referrer = document.referrer;
      const isFromDemoOrMarketing = referrer.includes('/demos') || 
                                    referrer.includes('/lost-pet-features') ||
                                    referrer.includes('/learn');
      
      if (window.history.length > 1 && !isFromDemoOrMarketing) {
        navigate(-1);
      } else if (isFromDemoOrMarketing) {
        navigate('/demos');
      } else {
        navigate('/');
      }
    }
  };

  useEffect(() => {
    const loadTravelData = async () => {
      if (!petId) {
        setError("Pet ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading public travel data for pet:', petId);
        
        // Fetch public pet data with travel locations and map pins
        const { data, error: fetchError } = await supabase
          .from('pets')
          .select(`
            id,
            name,
            species,
            breed,
            age,
            is_public,
            travel_locations (*),
            map_pins (*),
            pet_photos (*)
          `)
          .eq('id', petId)
          .eq('is_public', true)
          .maybeSingle();

        if (fetchError) {
          console.error('❌ Supabase fetch error:', fetchError);
          throw fetchError;
        }

        if (!data) {
          console.warn('⚠️ No data returned for pet:', petId);
          setError("Pet travel map not found or not public");
          setIsLoading(false);
          return;
        }

        console.log('✅ Travel data loaded successfully:', {
          name: data.name,
          travelLocations: data.travel_locations?.length || 0,
          mapPins: data.map_pins?.length || 0
        });

        // Sanitize data
        const sanitizedData = {
          ...data,
          name: sanitizeText(data.name || ''),
          species: sanitizeText(data.species || ''),
          breed: sanitizeText(data.breed || ''),
          age: sanitizeText(data.age || ''),
          travel_locations: data.travel_locations?.map((location: any) => ({
            ...location,
            name: sanitizeText(location.name || ''),
            type: sanitizeText(location.type || ''),
            notes: sanitizeText(location.notes || '')
          })) || [],
          map_pins: data.map_pins?.map((pin: any) => ({
            ...pin,
            title: sanitizeText(pin.title || ''),
            description: sanitizeText(pin.description || '')
          })) || []
        };

        setPetData(sanitizedData);
      } catch (err) {
        console.error("❌ Error loading travel data:", err);
        setError("Failed to load travel map");
      } finally {
        setIsLoading(false);
      }
    };

    loadTravelData();
  }, [petId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading travel map...</p>
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Travel Map Not Found</h1>
          <p className="text-gray-600">{error || "The requested travel map could not be found or is not public."}</p>
        </div>
      </div>
    );
  }

  const travelLocations = petData.travel_locations || [];
  const mapPins = petData.map_pins || [];
  const statesCount = travelLocations.filter((loc: TravelLocation) => loc.type === 'state').length;
  const countriesCount = travelLocations.filter((loc: TravelLocation) => loc.type === 'country').length;
  const totalPins = mapPins.length;

  const getMilestoneBadge = () => {
    const totalPlaces = statesCount + countriesCount + totalPins;
    if (totalPlaces >= 25) return { text: 'Explorer Champion', color: 'from-purple-500 to-pink-600' };
    if (totalPlaces >= 15) return { text: 'Travel Master', color: 'from-blue-500 to-purple-600' };
    if (totalPlaces >= 10) return { text: 'Adventure Seeker', color: 'from-green-500 to-blue-600' };
    if (totalPlaces >= 5) return { text: 'Travel Buddy', color: 'from-yellow-500 to-orange-600' };
    return { text: 'Getting Started', color: 'from-gray-400 to-gray-600' };
  };

  const milestone = getMilestoneBadge();
  const heroImage = petData.pet_photos?.[0]?.photo_url;
  
  // Generate meta tags for social sharing
  const travelTitle = `${petData.name}'s Travel Map - PetPort`;
  const travelDescription = `Explore ${petData.name}'s travel adventures! ${statesCount} states, ${countriesCount} countries, and ${totalPins} special places visited.`;
  const travelUrl = `${window.location.origin}/travel/${petId}`;

  return (
    <>
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
        title={travelTitle}
        description={travelDescription}
        image={heroImage || "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/travel-og.png"}
        url={travelUrl}
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <header className="text-center mb-8">
            {heroImage && (
              <div className="mb-6">
                <img 
                  src={heroImage} 
                  alt={`${petData.name} profile photo`}
                  loading="lazy"
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-sage-200"
                />
              </div>
            )}
            <h1 className="text-4xl font-sans font-bold text-navy-900 mb-4">
              {petData.name}'s Travel Map
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-6">
              {petData.breed && <Badge variant="secondary">{petData.breed}</Badge>}
              {petData.species && <Badge variant="secondary">{petData.species}</Badge>}
              {petData.age && <Badge variant="secondary">Age: {petData.age}</Badge>}
            </div>
          </header>

          {/* Travel Stats */}
          <Card className="mb-8 border-0 shadow-xl bg-brand-primary text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl font-bold text-yellow-400">{statesCount}</div>
                  <div className="text-blue-100">States Visited</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl font-bold text-green-400">{countriesCount}</div>
                  <div className="text-blue-100">Countries Visited</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl font-bold text-purple-400">{totalPins}</div>
                  <div className="text-blue-100">Special Places</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
                  <Badge className={`bg-gradient-to-r ${milestone.color} text-white border-0`}>
                    {milestone.text}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Map */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <MapPin className="w-5 h-5 text-primary" />
                Interactive Travel Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
                <FreeInteractiveMap 
                  locations={travelLocations}
                  petName={petData.name}
                  petId={petData.id}
                  pins={mapPins}
                  onPinsUpdate={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* Travel Locations List */}
          {travelLocations.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Plane className="w-5 h-5 text-primary" />
                  Travel Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {travelLocations.map((location: TravelLocation) => (
                    <Card key={location.id} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {location.photo_url ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-200 flex-shrink-0">
                              <img 
                                src={location.photo_url} 
                                alt={location.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-8 h-8 text-blue-500" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-navy-900">{location.name}</h4>
                              <Badge variant="outline" className={`text-xs ${location.type === 'country' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                {location.type === 'country' ? '🌍' : '📍'} {location.code || location.type}
                              </Badge>
                            </div>
                            
                            {location.date_visited && (
                              <div className="text-sm text-gray-600 mb-2">
                                Visited: {location.date_visited}
                              </div>
                            )}
                            
                            {location.notes && (
                              <p className="text-sm text-gray-700">{location.notes}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <footer className="text-center py-8 border-t border-sage-200">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-navy-600">
                <p className="text-sm">Powered by <span className="font-semibold">PetPort</span></p>
                <p className="text-xs">Professional pet profiles and travel tracking</p>
              </div>
              <a 
                href="https://petport.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors text-sm font-medium"
              >
                Create Your Pet's Profile
              </a>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default PublicTravelMap;