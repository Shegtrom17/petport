import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Facebook, Twitter, Download, Edit, Trash2, Plus, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PinEditDialog, EnhancedMapPin } from './PinEditDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TravelLocation {
  id: string;
  name: string;
  type: 'state' | 'country';
  code?: string;
  date_visited?: string;
  photo_url?: string;
  notes?: string;
}

interface EnhancedInteractiveMapProps {
  petId: string;
  petName: string;
  pins: EnhancedMapPin[];
  locations: TravelLocation[];
  onPinsUpdate: () => void;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PIN_CATEGORIES = [
  { value: 'all', label: 'All Pins', color: '#6b7280' },
  { value: 'custom', label: '📍 Custom Pin', color: '#ef4444' },
  { value: 'travel_location', label: '✈️ Travel Location', color: '#3b82f6' },
  { value: 'favorite', label: '❤️ Favorite Place', color: '#ec4899' },
  { value: 'vet', label: '🏥 Veterinary', color: '#10b981' },
  { value: 'park', label: '🌳 Park/Recreation', color: '#84cc16' },
  { value: 'hotel', label: '🏨 Accommodation', color: '#8b5cf6' },
  { value: 'restaurant', label: '🍽️ Pet-Friendly Dining', color: '#f59e0b' },
  { value: 'grooming', label: '✂️ Grooming', color: '#06b6d4' },
  { value: 'training', label: '🎓 Training', color: '#6366f1' },
  { value: 'emergency', label: '🚨 Emergency', color: '#dc2626' }
];

// Coordinate lookup for states and countries
const locationCoordinates: { [key: string]: [number, number] } = {
  // US States
  'alabama': [-86.9023, 32.8067], 'alaska': [-152.4044, 61.2181], 'arizona': [-112.0740, 33.7712],
  'arkansas': [-92.3731, 34.9513], 'california': [-119.6816, 36.1162], 'colorado': [-105.3111, 39.0598],
  'connecticut': [-72.7554, 41.5978], 'delaware': [-75.5277, 39.3185], 'florida': [-81.6557, 27.7663],
  'georgia': [-83.6431, 33.0406], 'hawaii': [-157.8583, 21.9420], 'idaho': [-114.4788, 44.2394],
  'illinois': [-88.9540, 40.4173], 'indiana': [-86.1349, 39.8647], 'iowa': [-93.7985, 42.0115],
  'kansas': [-96.7265, 38.5266], 'kentucky': [-84.6701, 37.6681], 'louisiana': [-91.8749, 31.1801],
  'maine': [-69.3834, 44.6939], 'maryland': [-76.2859, 39.0639], 'massachusetts': [-71.5376, 42.2352],
  'michigan': [-84.5467, 43.3266], 'minnesota': [-95.3656, 45.7326], 'mississippi': [-89.6678, 32.7673],
  'missouri': [-92.2884, 38.4623], 'montana': [-110.3626, 47.0527], 'nebraska': [-99.9018, 41.8780],
  'nevada': [-117.0554, 39.8283], 'new hampshire': [-71.5653, 43.4108], 'new jersey': [-74.7429, 40.5908],
  'new mexico': [-106.2485, 34.8405], 'new york': [-74.9481, 42.1657], 'north carolina': [-80.9342, 35.630],
  'north dakota': [-99.784, 47.528], 'ohio': [-82.7649, 40.3888], 'oklahoma': [-96.9289, 35.4676],
  'oregon': [-122.0709, 44.572], 'pennsylvania': [-77.209, 40.590], 'rhode island': [-71.51, 41.680],
  'south carolina': [-80.945, 33.856], 'south dakota': [-99.438, 44.299], 'tennessee': [-86.692, 35.747],
  'texas': [-97.563, 31.054], 'utah': [-111.892, 40.150], 'vermont': [-72.710, 44.045],
  'virginia': [-78.169, 37.769], 'washington': [-121.174, 47.042], 'west virginia': [-80.954, 38.491],
  'wisconsin': [-89.616, 44.268], 'wyoming': [-107.30, 42.750],
  
  // Countries
  'canada': [-106.3468, 56.1304], 'mexico': [-102.5528, 23.6345], 'united kingdom': [-3.4360, 55.3781],
  'france': [2.2137, 46.2276], 'germany': [10.4515, 51.1657], 'italy': [12.5674, 41.8719],
  'spain': [-3.7492, 40.4637], 'japan': [138.2529, 36.2048], 'australia': [133.7751, -25.2744],
  'brazil': [-51.9253, -14.2350], 'china': [104.1954, 35.8617], 'india': [78.9629, 20.5937],
  'russia': [105.3188, 61.5240],
};

const getLocationCoordinates = (location: TravelLocation): [number, number] | null => {
  const searchName = location.name.toLowerCase();
  return locationCoordinates[searchName] || null;
};

const getCategoryColor = (category?: string): string => {
  const categoryInfo = PIN_CATEGORIES.find(cat => cat.value === category);
  return categoryInfo?.color || '#ef4444';
};

export const EnhancedInteractiveMap = ({ petId, petName, pins, locations, onPinsUpdate }: EnhancedInteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<EnhancedMapPin | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isNewPin, setIsNewPin] = useState(false);
  const { toast } = useToast();
  const markersRef = useRef<{ marker: L.Marker; pin?: EnhancedMapPin; location?: TravelLocation }[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Add click handler to add pins with visual feedback
    map.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      console.log('🗺️ Map clicked at coordinates:', { lat, lng });
      
      // Add temporary loading indicator
      const tempMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: '<div style="background: #f59e0b; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 10px; animation: pulse 1s infinite;">⏳</div>',
          className: 'temp-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map.current!);
      
      try {
        await addPin(lat, lng);
      } finally {
        // Remove temporary marker
        tempMarker.remove();
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when pins, locations, or filter change
  useEffect(() => {
    if (!map.current) return;
    
    clearAllMarkers();
    addUserPinsToMap();
    addTravelLocationsToMap();
  }, [pins, locations, categoryFilter]);

  const clearAllMarkers = () => {
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];
  };

  const shouldShowPin = (pin: EnhancedMapPin): boolean => {
    if (categoryFilter === 'all') return true;
    return pin.category === categoryFilter;
  };

  const addUserPinsToMap = () => {
    if (!map.current) return;

    pins.filter(shouldShowPin).forEach(pin => {
      const color = getCategoryColor(pin.category);
      const categoryInfo = PIN_CATEGORIES.find(cat => cat.value === pin.category);
      const emoji = categoryInfo?.label.split(' ')[0] || '📍';

      const marker = L.marker([pin.lat, pin.lng], {
        icon: L.divIcon({
          html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 10px;">${emoji}</div>`,
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map.current!);

      // Create enhanced popup content
      let popupContent = `<div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${pin.title || `${petName} was here!`}</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${categoryInfo?.label || 'Custom Pin'}</p>`;
      
      if (pin.description) {
        popupContent += `<p style="margin: 4px 0; font-size: 14px;"><strong>Notes:</strong> ${pin.description}</p>`;
      }
      
      if (pin.travel_location_id) {
        const location = locations.find(l => l.id === pin.travel_location_id);
        if (location) {
          popupContent += `<p style="margin: 4px 0; font-size: 14px;"><strong>Travel Location:</strong> ${location.name}</p>`;
        }
      }
      
      popupContent += `<p style="margin: 4px 0; font-size: 12px; color: #666;">Coordinates: ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}</p>`;
      
      // Add action buttons
      popupContent += `
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button onclick="editPin('${pin.id}')" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">Edit</button>
          <button onclick="deletePin('${pin.id}')" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">Delete</button>
        </div>
      `;
      
      popupContent += '</div>';

      marker.bindPopup(popupContent);
      markersRef.current.push({ marker, pin });
    });
  };

  const addTravelLocationsToMap = () => {
    if (!map.current) return;

    locations.forEach(location => {
      const coordinates = getLocationCoordinates(location);
      if (!coordinates) return;

      const isCountry = location.type === 'country';
      const color = isCountry ? '#ef4444' : '#22c55e';
      const emoji = isCountry ? '🌍' : '📍';

      const marker = L.marker(coordinates, {
        icon: L.divIcon({
          html: `<div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 12px;">${emoji}</div>`,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map.current!);

      // Create popup content
      let popupContent = `<div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${location.name}</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Type:</strong> ${location.type === 'country' ? 'Country' : 'State'}</p>`;
      
      if (location.code) {
        popupContent += `<p style="margin: 4px 0; font-size: 14px;"><strong>Code:</strong> ${location.code}</p>`;
      }
      
      if (location.date_visited) {
        popupContent += `<p style="margin: 4px 0; font-size: 14px;"><strong>Visited:</strong> ${location.date_visited}</p>`;
      }
      
      if (location.notes) {
        popupContent += `<p style="margin: 4px 0; font-size: 14px;"><strong>Notes:</strong> ${location.notes}</p>`;
      }
      
      popupContent += '</div>';

      marker.bindPopup(popupContent);
      markersRef.current.push({ marker, location });
    });
  };

  // Global functions for popup buttons
  useEffect(() => {
    (window as any).editPin = (pinId: string) => {
      const pin = pins.find(p => p.id === pinId);
      if (pin) {
        setSelectedPin(pin);
        setIsNewPin(false);
        setIsEditDialogOpen(true);
      }
    };

    (window as any).deletePin = async (pinId: string) => {
      if (window.confirm('Are you sure you want to delete this pin?')) {
        await deletePin(pinId);
      }
    };

    return () => {
      delete (window as any).editPin;
      delete (window as any).deletePin;
    };
  }, [pins]);

  const addPin = async (lat: number, lng: number) => {
    setIsLoading(true);
    
    // Enhanced debugging
    console.log('🔧 Adding pin at coordinates:', { lat, lng, petId });
    
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }
      console.log('✅ User authenticated:', session.user.id);
      
      // Insert pin with enhanced logging
      const pinData = {
        pet_id: petId,
        latitude: lat,
        longitude: lng,
        title: null,
        description: null,
        category: 'custom'
      };
      console.log('📍 Inserting pin data:', pinData);
      
      const { data, error } = await supabase
        .from('map_pins')
        .insert(pinData)
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('✅ Pin added successfully:', data);
      onPinsUpdate();
      
      toast({
        title: "Pin Added! 📍",
        description: `Added a new red pin where ${petName} has been! Click the pin to edit it.`,
      });
    } catch (error: any) {
      console.error('❌ Error adding pin:', error);
      
      let errorMessage = "Failed to add pin. Please try again.";
      if (error.message?.includes('not authenticated')) {
        errorMessage = "Please log in to add pins to the map.";
      } else if (error.message?.includes('violates row-level security')) {
        errorMessage = "Permission denied. Make sure you own this pet profile.";
      } else if (error.details) {
        errorMessage = `Database error: ${error.details}`;
      }
      
      toast({
        variant: "destructive",
        title: "Error Adding Pin",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePin = async (pinId: string) => {
    try {
      const { error } = await supabase
        .from('map_pins')
        .delete()
        .eq('id', pinId);

      if (error) throw error;

      onPinsUpdate();
      
      toast({
        title: "Pin Deleted",
        description: "Pin has been successfully removed from the map.",
      });
    } catch (error) {
      console.error('Error deleting pin:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete pin. Please try again.",
      });
    }
  };

  const clearAllPins = async () => {
    if (!window.confirm(`Are you sure you want to delete all ${pins.length} pins? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('map_pins')
        .delete()
        .eq('pet_id', petId);

      if (error) throw error;

      onPinsUpdate();
      
      toast({
        title: "All Pins Cleared",
        description: "All pins have been successfully removed from the map.",
      });
    } catch (error) {
      console.error('Error clearing pins:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear pins. Please try again.",
      });
    }
  };

  const handlePinEditSave = () => {
    onPinsUpdate();
    setIsEditDialogOpen(false);
    setSelectedPin(null);
  };

  const generateShareText = () => {
    const totalLocations = pins.length + locations.length;
    return `${petName}'s Travel Adventures: ${totalLocations} amazing places explored! 🌍🐾`;
  };

  const handleShareFacebook = () => {
    const text = generateShareText();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const text = generateShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleDownloadMap = async () => {
    toast({
      title: "Download Feature",
      description: "Map download feature coming soon! For now, you can take a screenshot of the map.",
    });
  };

  const filteredPins = pins.filter(shouldShowPin);
  const totalLocations = pins.length + locations.length;

  return (
    <Card className="border-0 shadow-xl bg-passport-section-bg backdrop-blur-sm">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-base sm:text-lg">{petName}'s Travel Map</span>
          </div>
          {pins.length > 0 && (
            <Button
              onClick={clearAllPins}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Filter Controls */}
          {pins.length > 0 && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {PIN_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative">
            <div 
              ref={mapContainer} 
              className="w-full h-64 sm:h-80 rounded-lg overflow-hidden shadow-lg"
              style={{ cursor: isLoading ? 'wait' : 'crosshair' }}
            />
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/20">
              <p className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                Click anywhere to add a RED PIN where {petName} has been!
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                  <span>Pins ({filteredPins.length}/{pins.length})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                  <span>States ({locations.filter(l => l.type === 'state').length})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                  <span>Countries ({locations.filter(l => l.type === 'country').length})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              onClick={handleShareFacebook}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={totalLocations === 0}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Share to Facebook
            </Button>
            
            <Button 
              onClick={handleShareTwitter}
              className="flex-1 bg-black hover:bg-gray-800 text-white"
              disabled={totalLocations === 0}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Post to X
            </Button>
            
            <Button 
              onClick={handleDownloadMap}
              variant="outline"
              className="flex-1"
              disabled={totalLocations === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Map
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>🗺️ Enhanced interactive map • {totalLocations} locations marked • Click pins to edit or delete</p>
          </div>
        </div>
      </CardContent>

      {/* Pin Edit Dialog */}
      <PinEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        pin={selectedPin}
        onSave={handlePinEditSave}
        isNewPin={isNewPin}
      />
    </Card>
  );
};