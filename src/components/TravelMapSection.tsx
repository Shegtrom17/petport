import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Camera, Download, Share2, Calendar, Trophy, Edit } from "lucide-react";
import { TravelEditForm } from "@/components/TravelEditForm";

interface TravelLocation {
  id: string;
  name: string;
  type: 'state' | 'country';
  code: string;
  dateVisited?: string;
  photoUrl?: string;
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
  const [locations] = useState<TravelLocation[]>(petData.travel_locations || [
    { id: '1', name: 'Colorado', type: 'state', code: 'CO', dateVisited: '2023-01-15', notes: 'Home state - loves the mountains!' },
    { id: '2', name: 'Utah', type: 'state', code: 'UT', dateVisited: '2023-07-20', photoUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=200&h=150&fit=crop', notes: 'Great hiking adventure' },
    { id: '3', name: 'Wyoming', type: 'state', code: 'WY', dateVisited: '2023-09-10', notes: 'Yellowstone camping trip' },
    { id: '4', name: 'New Mexico', type: 'state', code: 'NM', dateVisited: '2024-03-05', notes: 'Desert exploration' },
    { id: '5', name: 'Canada', type: 'country', code: 'CA', dateVisited: '2024-06-15', photoUrl: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=200&h=150&fit=crop', notes: 'First international trip!' }
  ]);

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
  };

  const handleShare = () => {
    console.log("Sharing travel map...");
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{petData.name}'s Travel Adventures</h2>
              <p className="text-blue-100">Places we've explored together</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setIsEditModalOpen(true)} 
                variant="secondary" 
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleDownload} variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleShare} variant="secondary" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-yellow-400">{statesCount}</div>
              <div className="text-blue-100">States Visited</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-400">{countriesCount}</div>
              <div className="text-blue-100">Countries Visited</div>
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Travel Locations</DialogTitle>
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
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Travel Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-blue-300">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Interactive Travel Map</h3>
              <p className="text-blue-700">Map visualization would be displayed here</p>
              <p className="text-sm text-blue-600 mt-2">Showing pins for all {statesCount + countriesCount} locations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((location) => (
          <Card key={location.id} className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {location.photoUrl ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-200">
                    <img 
                      src={location.photoUrl} 
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-200 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-blue-500" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-navy-900">{location.name}</h4>
                    <Badge variant="outline" className={location.type === 'country' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}>
                      {location.type === 'country' ? '🌍' : '📍'} {location.code}
                    </Badge>
                  </div>
                  
                  {location.dateVisited && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(location.dateVisited).toLocaleDateString()}</span>
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

      {/* Add New Location */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
        <CardContent className="p-6 text-center">
          <Camera className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Add New Adventure</h3>
          <p className="text-blue-700 mb-4">
            Record a new place you've visited with {petData.name}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <MapPin className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
