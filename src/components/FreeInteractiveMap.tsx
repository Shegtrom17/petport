
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Facebook, Twitter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface TravelLocation {
  id: string;
  name: string;
  type: 'state' | 'country';
  code?: string;
  date_visited?: string;
  photo_url?: string;
  notes?: string;
}

interface FreeInteractiveMapProps {
  petId: string;
  petName: string;
  pins: MapPin[];
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

// Coordinate lookup for states and countries
const locationCoordinates: { [key: string]: [number, number] } = {
  // US States
  'alabama': [-86.9023, 32.8067],
  'alaska': [-152.4044, 61.2181],
  'arizona': [-112.0740, 33.7712],
  'arkansas': [-92.3731, 34.9513],
  'california': [-119.6816, 36.1162],
  'colorado': [-105.3111, 39.0598],
  'connecticut': [-72.7554, 41.5978],
  'delaware': [-75.5277, 39.3185],
  'florida': [-81.6557, 27.7663],
  'georgia': [-83.6431, 33.0406],
  'hawaii': [-157.8583, 21.9420],
  'idaho': [-114.4788, 44.2394],
  'illinois': [-88.9540, 40.4173],
  'indiana': [-86.1349, 39.8647],
  'iowa': [-93.7985, 42.0115],
  'kansas': [-96.7265, 38.5266],
  'kentucky': [-84.6701, 37.6681],
  'louisiana': [-91.8749, 31.1801],
  'maine': [-69.3834, 44.6939],
  'maryland': [-76.2859, 39.0639],
  'massachusetts': [-71.5376, 42.2352],
  'michigan': [-84.5467, 43.3266],
  'minnesota': [-95.3656, 45.7326],
  'mississippi': [-89.6678, 32.7673],
  'missouri': [-92.2884, 38.4623],
  'montana': [-110.3626, 47.0527],
  'nebraska': [-99.9018, 41.8780],
  'nevada': [-117.0554, 39.8283],
  'new hampshire': [-71.5653, 43.4108],
  'new jersey': [-74.7429, 40.5908],
  'new mexico': [-106.2485, 34.8405],
  'new york': [-74.9481, 42.1657],
  'north carolina': [-80.9342, 35.630],
  'north dakota': [-99.784, 47.528],
  'ohio': [-82.7649, 40.3888],
  'oklahoma': [-96.9289, 35.4676],
  'oregon': [-122.0709, 44.572],
  'pennsylvania': [-77.209, 40.590],
  'rhode island': [-71.51, 41.680],
  'south carolina': [-80.945, 33.856],
  'south dakota': [-99.438, 44.299],
  'tennessee': [-86.692, 35.747],
  'texas': [-97.563, 31.054],
  'utah': [-111.892, 40.150],
  'vermont': [-72.710, 44.045],
  'virginia': [-78.169, 37.769],
  'washington': [-121.174, 47.042],
  'west virginia': [-80.954, 38.491],
  'wisconsin': [-89.616, 44.268],
  'wyoming': [-107.30, 42.750],
  
  // Countries
  'canada': [-106.3468, 56.1304],
  'mexico': [-102.5528, 23.6345],
  'united kingdom': [-3.4360, 55.3781],
  'france': [2.2137, 46.2276],
  'germany': [10.4515, 51.1657],
  'italy': [12.5674, 41.8719],
  'spain': [-3.7492, 40.4637],
  'japan': [138.2529, 36.2048],
  'australia': [133.7751, -25.2744],
  'brazil': [-51.9253, -14.2350],
  'china': [104.1954, 35.8617],
  'india': [78.9629, 20.5937],
  'russia': [105.3188, 61.5240],
};

const getLocationCoordinates = (location: TravelLocation): [number, number] | null => {
  const searchName = location.name.toLowerCase();
  return locationCoordinates[searchName] || null;
};

export const FreeInteractiveMap = ({ petId, petName, pins, locations, onPinsUpdate }: FreeInteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4); // Center of US

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Add click handler to add pins
    map.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      await addPin(lat, lng);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when pins or locations change
  useEffect(() => {
    if (!map.current) return;
    
    clearAllMarkers();
    addUserPinsToMap();
    addTravelLocationsToMap();
  }, [pins, locations]);

  const clearAllMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const addUserPinsToMap = () => {
    if (!map.current) return;

    pins.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: L.divIcon({
          html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map.current!);
      
      marker.bindPopup(`🔵 ${petName} was here! 🐾`);
      markersRef.current.push(marker);
    });
  };

  const addTravelLocationsToMap = () => {
    if (!map.current) return;

    locations.forEach(location => {
      const coordinates = getLocationCoordinates(location);
      if (!coordinates) return;

      const isCountry = location.type === 'country';
      const color = isCountry ? '#ef4444' : '#22c55e'; // Red for countries, green for states
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
      markersRef.current.push(marker);
    });
  };

  const addPin = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('map_pins')
        .insert({
          pet_id: petId,
          latitude: lat,
          longitude: lng
        });

      if (error) throw error;

      // Update parent component
      onPinsUpdate();
      
      toast({
        title: "Pin Added!",
        description: `Added a new location where ${petName} has been! 🐾`,
      });
    } catch (error) {
      console.error('Error adding pin:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add pin. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleShareInstagram = () => {
    const text = generateShareText();
    const currentUrl = window.location.href;
    
    // Copy to clipboard and show instructions
    navigator.clipboard.writeText(`${text} ${currentUrl}`).then(() => {
      toast({
        title: "Copied for Instagram! 📷",
        description: "Text and link copied - paste into Instagram Stories or posts.",
        duration: 4000,
      });
    }).catch(() => {
      toast({
        title: "Instagram Limitation",
        description: "Instagram doesn't support direct sharing. Please copy the map URL manually.",
        duration: 4000,
      });
    });
  };

  const handleDownloadMap = async () => {
    toast({
      title: "Download Feature",
      description: "Map download feature coming soon! For now, you can take a screenshot of the map.",
    });
  };

  const totalLocations = pins.length + locations.length;

  return (
    <Card className="border-0 shadow-xl bg-passport-section-bg backdrop-blur-sm">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <span>{petName}'s Travel Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="relative">
            <div 
              ref={mapContainer} 
              className="w-full h-64 sm:h-80 rounded-lg overflow-hidden shadow-lg"
              style={{ cursor: isLoading ? 'wait' : 'crosshair' }}
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <p className="text-sm text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Click anywhere to add a pin where {petName} has been!
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                  <span>Your pins ({pins.length})</span>
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
              onClick={handleShareInstagram}
              className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white"
              disabled={totalLocations === 0}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
              </svg>
              Copy for Instagram
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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
            <p>🗺️ Free interactive map • {totalLocations} locations marked • No signup required</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
