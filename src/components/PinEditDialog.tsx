import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedMapPin {
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

interface PinEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pin: EnhancedMapPin | null;
  onSave: () => void;
  isNewPin?: boolean;
}

const PIN_CATEGORIES = [
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

export const PinEditDialog: React.FC<PinEditDialogProps> = ({
  isOpen,
  onOpenChange,
  pin,
  onSave,
  isNewPin = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pin) {
      setTitle(pin.title || '');
      setDescription(pin.description || '');
      setCategory(pin.category || 'custom');
    } else {
      setTitle('');
      setDescription('');
      setCategory('custom');
    }
  }, [pin]);

  const handleSave = async () => {
    if (!pin) return;

    setIsLoading(true);
    try {
      const updateData = {
        title: title.trim() || null,
        description: description.trim() || null,
        category: category,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('map_pins')
        .update(updateData)
        .eq('id', pin.id);

      if (error) throw error;

      toast({
        title: "Pin updated",
        description: "Your pin has been successfully updated.",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating pin:', error);
      toast({
        title: "Error",
        description: "Failed to update pin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = PIN_CATEGORIES.find(cat => cat.value === category);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isNewPin ? 'New Pin' : 'Edit Pin'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin-title">Pin Title</Label>
            <Input
              id="pin-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this pin..."
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PIN_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin-description">Description</Label>
            <Textarea
              id="pin-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or description for this location..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </div>
          </div>

          {pin && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <div>Coordinates: {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}</div>
              <div>Created: {new Date(pin.createdAt).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Pin'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};