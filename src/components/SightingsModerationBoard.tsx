import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MapPin, Eye, EyeOff, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PetSighting {
  id: string;
  pet_id: string;
  sighting_text: string;
  reported_at: string;
  is_visible: boolean;
  ip_address?: string;
}

interface SightingsModerationBoardProps {
  petId: string;
  petName: string;
}

export const SightingsModerationBoard = ({ petId, petName }: SightingsModerationBoardProps) => {
  const [sightings, setSightings] = useState<PetSighting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSightings();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('sightings-moderation')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pet_sightings',
        filter: `pet_id=eq.${petId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSightings(prev => [payload.new as PetSighting, ...prev]);
          toast({
            title: "New sighting reported!",
            description: "A new sighting has been added to your lost pet board"
          });
        } else if (payload.eventType === 'UPDATE') {
          setSightings(prev => prev.map(s => 
            s.id === payload.new.id ? payload.new as PetSighting : s
          ));
        } else if (payload.eventType === 'DELETE') {
          setSightings(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId]);

  const fetchSightings = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_sightings')
        .select('*')
        .eq('pet_id', petId)
        .order('reported_at', { ascending: false });

      if (error) throw error;
      setSightings(data || []);
    } catch (error) {
      console.error('Error fetching sightings:', error);
      toast({
        title: "Error",
        description: "Failed to load sightings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (sightingId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('pet_sightings')
        .update({ is_visible: !currentVisibility })
        .eq('id', sightingId);

      if (error) throw error;

      toast({
        title: currentVisibility ? "Sighting hidden" : "Sighting visible",
        description: currentVisibility 
          ? "This sighting is now hidden from the public" 
          : "This sighting is now visible to the public"
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive"
      });
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading sightings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <span>Sightings Board</span>
            <Badge variant="outline" className="ml-2">
              {sightings.length} {sightings.length === 1 ? 'sighting' : 'sightings'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sightings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No sightings reported yet</p>
            <p className="text-sm mt-1">Sightings from the community will appear here</p>
          </div>
        ) : (
          sightings.map((sighting) => (
            <Card key={sighting.id} className={`${!sighting.is_visible ? 'bg-gray-50 border-gray-300' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={sighting.is_visible ? "default" : "secondary"} className="text-xs">
                        {sighting.is_visible ? (
                          <><Eye className="w-3 h-3 mr-1" />Visible</>
                        ) : (
                          <><EyeOff className="w-3 h-3 mr-1" />Hidden</>
                        )}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(sighting.reported_at)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{sighting.sighting_text}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(sighting.id, sighting.is_visible)}
                      className="h-8 px-2"
                    >
                      {sighting.is_visible ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Toggle visibility to hide inappropriate sightings without deleting them. Hidden sightings are only visible to you.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
