import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquare, Eye, EyeOff, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CareUpdate {
  id: string;
  pet_id: string;
  update_text: string;
  reported_at: string;
  is_visible: boolean;
  ip_address?: string;
}

interface CareUpdatesModerationBoardProps {
  petId: string;
  petName: string;
}

export const CareUpdatesModerationBoard = ({ petId, petName }: CareUpdatesModerationBoardProps) => {
  const [updates, setUpdates] = useState<CareUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUpdates();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('care-updates-moderation')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'care_updates',
        filter: `pet_id=eq.${petId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setUpdates(prev => [payload.new as CareUpdate, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setUpdates(prev => prev.map(u => 
            u.id === payload.new.id ? payload.new as CareUpdate : u
          ));
        } else if (payload.eventType === 'DELETE') {
          setUpdates(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId]);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('care_updates')
        .select('*')
        .eq('pet_id', petId)
        .order('reported_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching care updates:', error);
      toast({
        title: "Error",
        description: "Failed to load care updates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (updateId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('care_updates')
        .update({ is_visible: !currentVisibility })
        .eq('id', updateId);

      if (error) throw error;

      toast({
        title: currentVisibility ? "Update hidden" : "Update visible",
        description: currentVisibility 
          ? "This update is now hidden from the public" 
          : "This update is now visible to the public"
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

  const deleteUpdate = async (updateId: string) => {
    try {
      const { error } = await supabase
        .from('care_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;

      toast({
        title: "Update deleted",
        description: "The care update has been permanently removed"
      });
    } catch (error) {
      console.error('Error deleting update:', error);
      toast({
        title: "Error",
        description: "Failed to delete update",
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
          <p className="text-center text-gray-500">Loading care updates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-brand-primary" />
            <span>Care Updates Board</span>
            <Badge variant="outline" className="ml-2">
              {updates.length} {updates.length === 1 ? 'update' : 'updates'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No care updates yet</p>
            <p className="text-sm mt-1">Updates from caretakers will appear here</p>
          </div>
        ) : (
          updates.map((update) => (
            <Card key={update.id} className={`${!update.is_visible ? 'bg-gray-50 border-gray-300' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={update.is_visible ? "default" : "secondary"} className="text-xs">
                        {update.is_visible ? (
                          <><Eye className="w-3 h-3 mr-1" />Visible</>
                        ) : (
                          <><EyeOff className="w-3 h-3 mr-1" />Hidden</>
                        )}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(update.reported_at)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{update.update_text}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(update.id, update.is_visible)}
                      className="h-8 px-2"
                    >
                      {update.is_visible ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Care Update?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this care update. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUpdate(update.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
