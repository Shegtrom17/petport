import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PetDeleteDialogProps {
  petId: string;
  petName: string;
  onPetDeleted?: () => void;
}

export const PetDeleteDialog = ({ petId, petName, onPetDeleted }: PetDeleteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("pets")
        .delete()
        .eq("id", petId);

      if (error) throw error;

      toast({
        title: "Pet deleted",
        description: `${petName}'s profile has been permanently deleted. Pet slot is now available.`,
      });

      setIsOpen(false);
      onPetDeleted?.();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete pet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-responsive-xs text-destructive border-destructive/20 hover:bg-destructive/5">
          <Trash2 className="w-3 h-3 mr-1" />
          <span className="text-responsive-xs whitespace-nowrap">Delete Pet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {petName}'s Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This will permanently delete {petName}'s profile and all associated data 
              including photos, medical records, and documents. This action cannot be undone.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>About Pet Slots:</strong> Deleting this pet will free up one pet slot immediately. 
              Your subscription billing remains unchanged - manage subscription and pet slot quantities 
              from <span className="font-medium">Settings → Billing & Add-ons</span>.
            </p>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? "Deleting..." : "Delete Forever"}
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => navigate("/billing")}
              className="text-xs text-muted-foreground h-auto p-0"
            >
              Manage subscription & pet slots →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};