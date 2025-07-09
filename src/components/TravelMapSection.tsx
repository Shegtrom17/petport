
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Camera, Download, Share2, Calendar, Trophy, Edit } from "lucide-react";
import { TravelEditForm } from "@/components/TravelEditForm";
import { fetchPetDetails } from "@/services/petService";
import { useToast } from "@/hooks/use-toast";

interface TravelLocation {
  id: string;
  name: string;
  type: 'state' | 'country';
  code?: string;
  date_visited?: string;
  photo_url?: string;
  notes?: string;
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
  const [locations, setLocations] = useState<TravelLocation[]>(petData.travel_locations || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update locations when petData changes
  useEffect(() => {
    setLocations(petData.travel_locations || []);
  }, [petData.travel_locations]);

  const statesCount = locations.filter(loc => loc.type === 'state').length;
  const countriesCount = locations.filter(loc => loc.type === 'country').length;

  const getMilestonebadge = () => {
    if (statesCount >= 25) return { text: 'Explorer Champion', color: 'from-purple-500 to-pink-600' };
    if (statesCount >= 15) return { text: 'Travel Master', color: 'from-blue-500 to-purple-600' };
    if (statesCount >= 10) return { text: 'Adventure Seeker', color: 'from-green-500 to-blue-600' };
    if (statesCount >= 5) return { text: 'Travel Buddy', color: 'from-yellow-500 to-orange-600' };
    return { text: 'Getting Started', color: 'from-gray-400 to-gray-600' };
  };

  const milestone = getMilestonebadge();

  const handleDownload = () => {
    console.log("Downloading travel map...");
    toast({
      title: "Feature Coming Soon",
      description: "Travel map download will be available soon!",
    });
  };

  const handleShare = () => {
    console.log("Sharing travel map...");
    toast({
      title: "Feature Coming Soon", 
      description: "Travel map sharing will be available soon!",
    });
  };

  const handleEditSave = async () => {
    setIsLoading(true);
    try {
      // Refresh the pet data to get the latest travel locations
      const updatedPetData = await fetchPetDetails(petData.id);
      if (updatedPetData && updatedPetData.travel_locations) {
        setLocations(updatedPetData.travel_locations);
      }
      
      setIsEditModalOpen(false);
      
      if (onUpdate) {
        onUpdate();
      }
      
      toast({
        title: "Success",
        description: "Travel locations refreshed successfully!",
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
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Stats */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{petData.name}'s Travel Adventures</h2>
              <p className="text-blue-100 text-sm sm:text-base">Places we've explored together</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button 
                onClick={() => setIsEditModalOpen(true)} 
                variant="secondary" 
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Edit
              </Button>
              <div className="flex space-x-2 sm:space-x-0">
                <Button onClick={handleDownload} variant="secondary" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button onClick={handleShare} variant="secondary" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-2">Share</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{statesCount}</div>
              <div className="text-blue-100 text-sm sm:text-base">States Visited</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">{countriesCount}</div>
              <div className="text-blue-100 text-sm sm:text-base">Countries Visited</div>
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
          />
        </DialogContent>
      </Dialog>

      {/* Travel Map Placeholder */}
      <Card className="border-0 shadow-xl bg-passport-section-bg backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span>Travel Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-blue-300">
            <div className="text-center p-4">
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">Interactive Travel Map</h3>
              <p className="text-blue-700 text-sm sm:text-base">Map visualization would be displayed here</p>
              <p className="text-xs sm:text-sm text-blue-600 mt-2">Showing pins for all {statesCount + countriesCount} locations</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
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
            </p>
            <Button 
              onClick={handleAddNewLocation}
              className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Add First Location
            </Button>
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
            <Button 
              onClick={handleAddNewLocation}
              className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
