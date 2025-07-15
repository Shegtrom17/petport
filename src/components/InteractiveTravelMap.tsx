
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Eye, EyeOff } from 'lucide-react';

interface TravelLocation {
  id: string;
  name: string;
  type: 'state' | 'country';
  code?: string;
  date_visited?: string;
  photo_url?: string;
  notes?: string;
}

interface InteractiveTravelMapProps {
  locations: TravelLocation[];
  petName: string;
}

// Approximate coordinates for US states and countries
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

export const InteractiveTravelMap = ({ locations, petName }: InteractiveTravelMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const getLocationCoordinates = (location: TravelLocation): [number, number] | null => {
    const searchName = location.name.toLowerCase();
    return locationCoordinates[searchName] || null;
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const addMarkersToMap = () => {
    if (!map.current) return;

    console.log('Adding markers for locations:', locations);
    clearMarkers();

    locations.forEach((location) => {
      const coordinates = getLocationCoordinates(location);
      console.log(`Location ${location.name} coordinates:`, coordinates);
      
      if (coordinates) {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cssText = `
          width: 30px;
          height: 30px;
          background: ${location.type === 'country' ? '#22c55e' : '#3b82f6'};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
          z-index: 1000;
        `;
        el.innerHTML = location.type === 'country' ? '🌍' : '📍';

        // Create popup with sanitized content
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 max-w-xs';
        
        const title = document.createElement('h3');
        title.className = 'font-bold text-lg mb-2';
        title.textContent = location.name;
        popupContent.appendChild(title);

        const details = document.createElement('div');
        details.className = 'space-y-1 text-sm';
        
        const typeInfo = document.createElement('p');
        typeInfo.innerHTML = `<strong>Type:</strong> ${location.type === 'country' ? 'Country' : 'State'}`;
        details.appendChild(typeInfo);

        if (location.code) {
          const codeInfo = document.createElement('p');
          codeInfo.innerHTML = `<strong>Code:</strong> ${location.code}`;
          details.appendChild(codeInfo);
        }

        if (location.date_visited) {
          const dateInfo = document.createElement('p');
          dateInfo.innerHTML = `<strong>Visited:</strong> ${location.date_visited}`;
          details.appendChild(dateInfo);
        }

        if (location.notes) {
          const notesInfo = document.createElement('p');
          notesInfo.innerHTML = `<strong>Notes:</strong> ${location.notes}`;
          details.appendChild(notesInfo);
        }

        popupContent.appendChild(details);

        if (location.photo_url) {
          const img = document.createElement('img');
          img.src = location.photo_url;
          img.alt = location.name;
          img.className = 'w-full h-20 object-cover rounded mt-2';
          popupContent.appendChild(img);
        }

        const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
        console.log(`Added marker for ${location.name} at`, coordinates);
      } else {
        console.warn(`No coordinates found for location: ${location.name}`);
      }
    });

    console.log(`Total markers added: ${markersRef.current.length}`);
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    console.log('Initializing map with token:', mapboxToken.substring(0, 20) + '...');
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-98.5795, 39.8282], // Center of US
      zoom: 3,
      projection: 'globe' as any
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add atmosphere and fog for globe view
    map.current.on('style.load', () => {
      if (map.current) {
        map.current.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        });

        // Add markers after style loads
        addMarkersToMap();
      }
    });

    // Also add markers when map loads (fallback)
    map.current.on('load', () => {
      addMarkersToMap();
    });

    setMapInitialized(true);
    setShowTokenInput(false);
  };

  // Update markers when locations change
  useEffect(() => {
    if (mapInitialized && map.current) {
      console.log('Locations updated, refreshing markers:', locations);
      addMarkersToMap();
    }
  }, [locations, mapInitialized]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      initializeMap();
    }
  };

  if (showTokenInput) {
    return (
      <Card className="border-0 shadow-xl bg-passport-section-bg backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span>Interactive Travel Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 text-center">
            <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Setup Interactive Map</h3>
            <p className="text-blue-700 text-sm mb-4">
              Enter your Mapbox public token to display an interactive map of {petName}'s travel adventures!
            </p>
            <div className="space-y-3 max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Enter Mapbox public token (pk.eyJ1...)"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="text-sm"
              />
              <Button 
                onClick={handleTokenSubmit}
                disabled={!mapboxToken.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Initialize Map
              </Button>
              <p className="text-xs text-blue-600">
                Get your free token at{' '}
                <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">
                  mapbox.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-passport-section-bg backdrop-blur-sm">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span>Interactive Travel Map</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTokenInput(true)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Settings
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          <div ref={mapContainer} className="w-full h-64 sm:h-80 rounded-lg overflow-hidden shadow-lg" />
          {mapInitialized && (
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                  <span>States ({locations.filter(l => l.type === 'state').length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                  <span>Countries ({locations.filter(l => l.type === 'country').length})</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>🗺️ Click on any pin to see travel details • {locations.length} locations mapped</p>
          {locations.length === 0 && (
            <p className="text-amber-600 mt-2">No travel locations found. Add some locations to see pins on the map!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
