
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AzureButton } from "@/components/ui/azure-button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Camera, Trophy, Edit, Share2 } from "lucide-react";
import { TravelEditForm } from "@/components/TravelEditForm";
import { EnhancedInteractiveMap } from "@/components/EnhancedInteractiveMap";
import { fetchPetDetails } from "@/services/petService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { generateShareURL } from "@/utils/domainUtils";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { AITravelAssistantModal } from "@/components/AITravelAssistantModal";

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
  lat: number;
  lng: number;
  petId: string;
  title?: string;
  description?: string;
  category?: string;
  travel_location_id?: string;
  createdAt: string;
}

interface TravelMapSectionProps {
  petData: {
    id: string;
    name: string;
    travel_locations?: TravelLocation[];
  };
  onUpdate?: () => void;
}

export const TravelMapSection = ({ petData, onUpdate }: TravelMapSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'edit' | 'add'>('add');
  const [locations, setLocations] = useState<TravelLocation[]>(petData.travel_locations || []);
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update locations when petData changes
  useEffect(() => {
    console.log('TravelMapSection: Pet data updated, locations:', petData.travel_locations);
    setLocations(petData.travel_locations || []);
  }, [petData.travel_locations]);

  // Load map pins
  useEffect(() => {
    loadMapPins();
  }, [petData.id]);

  const loadMapPins = async () => {
    try {
      console.log('🔄 Loading map pins for pet:', petData.id);
      
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ User not authenticated, cannot load pins');
        setMapPins([]);
        return;
      }
      console.log('✅ User authenticated, loading pins for user:', session.user.id);
      
      const { data, error } = await supabase
        .from('map_pins')
        .select('*')
        .eq('pet_id', petData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error loading pins:', error);
        throw error;
      }

      const pins = (data || []).map(pin => ({
        id: pin.id,
        lat: pin.latitude,
        lng: pin.longitude,
        petId: pin.pet_id,
        title: pin.title,
        description: pin.description,
        category: pin.category,
        travel_location_id: pin.travel_location_id,
        createdAt: pin.created_at
      }));

      console.log('✅ Loaded map pins successfully:', {
        count: pins.length,
        pins: pins.map(p => ({ id: p.id, title: p.title, category: p.category }))
      });
      setMapPins(pins);
    } catch (error) {
      console.error('❌ Error loading map pins:', error);
      toast({
        variant: "destructive",
        title: "Error Loading Map Pins",
        description: "Failed to load existing pins. Please refresh the page.",
      });
    }
  };

  const statesCount = locations.filter(loc => loc.type === 'state').length;
  const countriesCount = locations.filter(loc => loc.type === 'country').length;
  const totalPins = mapPins.length;

  const getMilestonebadge = () => {
    const totalPlaces = statesCount + countriesCount + totalPins;
    if (totalPlaces >= 25) return { text: 'Explorer Champion', color: 'from-purple-500 to-pink-600' };
    if (totalPlaces >= 15) return { text: 'Travel Master', color: 'from-blue-500 to-purple-600' };
    if (totalPlaces >= 10) return { text: 'Adventure Seeker', color: 'from-green-500 to-blue-600' };
    if (totalPlaces >= 5) return { text: 'Travel Buddy', color: 'from-yellow-500 to-orange-600' };
    return { text: 'Getting Started', color: 'from-gray-400 to-gray-600' };
  };

  const milestone = getMilestonebadge();

  const handleEditSave = async () => {
    setIsLoading(true);
    try {
      console.log('Refreshing pet data after edit...');
      // Refresh the pet data to get the latest travel locations
      const updatedPetData = await fetchPetDetails(petData.id);
      if (updatedPetData && updatedPetData.travel_locations) {
        console.log('Updated travel locations:', updatedPetData.travel_locations);
        setLocations(updatedPetData.travel_locations);
      }
      
      setIsEditModalOpen(false);
      
      if (onUpdate) {
        onUpdate();
      }
      
      toast({
        title: "Success",
        description: editMode === 'add' ? "Travel locations added successfully!" : "Travel locations updated successfully!",
      });
    } catch (error) {
      console.error("Error refreshing travel locations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh travel locations",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewLocation = () => {
    setEditMode('add');
    setIsEditModalOpen(true);
  };

  const handleEditLocations = () => {
    setEditMode('edit');
    setIsEditModalOpen(true);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Header with Stats */}
      <Card className="border-0 shadow-xl bg-brand-primary text-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{petData.name}'s Travel Adventures</h2>
              <p className="text-blue-100 text-sm sm:text-base">Places we've explored together</p>
              <div className="mt-2 p-2 bg-blue-500/20 rounded-md border border-blue-400/30">
                <p className="text-xs sm:text-sm text-blue-100">
                  📄 <strong>PDF Note:</strong> Travel locations you enter are included in the Pet Resume PDF, but the global map image is not automatically included.
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {/* Development View Landing Button */}
              <div
                onClick={() => window.open('/landing', '_blank')}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer opacity-60 hover:opacity-100"
                role="button"
                tabIndex={0}
                aria-label="View landing page"
                onKeyDown={(e) => e.key === 'Enter' && window.open('/landing', '_blank')}
              >
                <span className="text-xs">Landing</span>
              </div>
              <div
                onClick={handleShare}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Share travel map"
                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </div>
              <div
                onClick={handleEditLocations}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Edit travel locations"
                onKeyDown={(e) => e.key === 'Enter' && handleEditLocations()}
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{statesCount}</div>
              <div className="text-blue-100 text-sm sm:text-base">States Visited</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">{countriesCount}</div>
              <div className="text-blue-100 text-sm sm:text-base">Countries Visited</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">{totalPins}</div>
              <div className="text-blue-100 text-sm sm:text-base">Map Pins</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-1" />
              <Badge className={`bg-gradient-to-r ${milestone.color} text-white border-0 text-xs sm:text-sm`}>
                {milestone.text}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Travel Locations</DialogTitle>
          </DialogHeader>
          <TravelEditForm
            petData={petData}
            onSave={handleEditSave}
            onCancel={() => setIsEditModalOpen(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share {petData.name}'s Travel Map</DialogTitle>
          </DialogHeader>
          <SocialShareButtons
            petName={petData.name}
            petId={petData.id}
            context="travel"
          />
        </DialogContent>
      </Dialog>

      {/* AI Travel Assistant Modal */}
      <AITravelAssistantModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
      />

      {/* Floating AI Button */}
      <FloatingAIButton 
        onClick={() => setIsAIModalOpen(true)} 
        label="AI Travel Assistant"
        description="Get pet-friendly suggestions"
      />

      {/* Enhanced Interactive Map */}
      <EnhancedInteractiveMap 
        petId={petData.id}
        petName={petData.name}
        pins={mapPins}
        locations={locations}
        onPinsUpdate={loadMapPins}
      />

      {/* Locations List */}
      {locations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {locations.map((location) => (
            <Card key={location.id} className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  {location.photo_url ? (
                    <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-blue-200 flex-shrink-0">
                      <img 
                        src={location.photo_url} 
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                    </div>
                  )}
                  
                  <div className="flex-1 text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                      <h4 className="font-semibold text-navy-900 text-sm sm:text-base">{location.name}</h4>
                      <Badge variant="outline" className={`text-xs ${location.type === 'country' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {location.type === 'country' ? '🌍' : '📍'} {location.code || location.type}
                      </Badge>
                    </div>
                    
                    {location.date_visited && (
                      <div className="flex items-center justify-center sm:justify-start space-x-1 text-xs sm:text-sm text-gray-600 mb-2">
                        <span>{location.date_visited}</span>
                      </div>
                    )}
                    
                    {location.notes && (
                      <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">{location.notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
          <CardContent className="p-6 sm:p-8 text-center">
            <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">No Travel Locations Yet</h3>
            <p className="text-blue-700 mb-4 text-sm sm:text-base px-2">
              Start recording the places you've visited with {petData.name}! 
              <br />
              <strong>🔴 Click anywhere on the map above to add RED PINS instantly!</strong>
              <br />
              Or add detailed travel locations below.
            </p>
            <AzureButton 
              onClick={handleAddNewLocation}
              className="text-sm sm:text-base"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Add First Location
            </AzureButton>
          </CardContent>
        </Card>
      )}

      {/* Add New Location */}
      {locations.length > 0 && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
          <CardContent className="p-4 sm:p-6 text-center">
            <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">Add New Adventure</h3>
            <p className="text-blue-700 mb-4 text-sm sm:text-base px-2">
              Record a new place you've visited with {petData.name}
            </p>
            <AzureButton 
              onClick={handleAddNewLocation}
              className="text-sm sm:text-base"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Add Location
            </AzureButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
