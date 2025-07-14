
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
  createdAt: string;
}

interface FreeInteractiveMapProps {
  petId: string;
  petName: string;
  pins: MapPin[];
  onPinsUpdate: () => void;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const FreeInteractiveMap = ({ petId, petName, pins, onPinsUpdate }: FreeInteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

    // Add existing pins to map
    pins.forEach(pin => {
      addMarkerToMap(pin.lat, pin.lng);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addMarkerToMap = (lat: number, lng: number) => {
    if (!map.current) return;

    const marker = L.marker([lat, lng]).addTo(map.current);
    marker.bindPopup(`${petName} was here! 🐾`);
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

      // Add marker to map immediately
      addMarkerToMap(lat, lng);
      
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
    return `${petName}'s World Tour: Check out where I've been! 🌍🐾🐕‍🦺🐱🐴`;
  };

  const generateStaticMapUrl = () => {
    if (pins.length === 0) return '';
    
    // Use Google Static Maps API (free tier)
    const center = pins.length > 0 ? 
      `${pins[0].lat},${pins[0].lng}` : 
      '39.8283,-98.5795';
    
    const markers = pins.map(pin => `${pin.lat},${pin.lng}`).join('|');
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=4&size=600x400&markers=${markers}&key=YOUR_GOOGLE_MAPS_API_KEY`;
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
    if (!map.current) return;

    try {
      // Use html2canvas or similar library to capture map
      // For now, we'll show a toast with instructions
      toast({
        title: "Download Feature",
        description: "Map download feature coming soon! For now, you can take a screenshot of the map.",
      });
    } catch (error) {
      console.error('Error downloading map:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download map. Please try again.",
      });
    }
  };

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
              <p className="text-sm text-gray-700">
                <MapPin className="w-4 h-4 inline mr-1" />
                Click anywhere to add a pin where {petName} has been!
              </p>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              onClick={handleShareFacebook}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={pins.length === 0}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Share to Facebook
            </Button>
            
            <Button 
              onClick={handleShareTwitter}
              className="flex-1 bg-black hover:bg-gray-800 text-white"
              disabled={pins.length === 0}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Post to X
            </Button>
            
            <Button 
              onClick={handleDownloadMap}
              variant="outline"
              className="flex-1"
              disabled={pins.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Map
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>🗺️ Free interactive map • {pins.length} locations marked • No signup required</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
