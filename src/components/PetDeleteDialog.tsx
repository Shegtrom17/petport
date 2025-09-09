import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
        description: `${petName}'s profile has been permanently deleted.`,
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
        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Pet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {petName}'s Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This will permanently delete {petName}'s profile and all associated data 
              including photos, medical records, and documents. This action cannot be undone.
            </p>
          </div>
          
          <div className="flex gap-2 pt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};