
import { useState, useEffect } from "react";
import { fetchUserPets, fetchPetDetails } from "@/services/petService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePetData = () => {
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchDocuments = async (petId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const loadPets = async () => {
    try {
      console.log("usePetData - Loading pets...");
      setIsLoading(true);
      const userPets = await fetchUserPets();
      console.log("usePetData - Fetched pets:", userPets);
      
      // Sort pets by creation date to ensure first pet stays first
      const sortedPets = userPets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setPets(sortedPets);
      
      if (sortedPets.length > 0) {
        console.log("usePetData - Loading first pet details:", sortedPets[0].id);
        const petDetails = await fetchPetDetails(sortedPets[0].id);
        console.log("usePetData - Fetched pet details:", petDetails);
        setSelectedPet(petDetails);
        await fetchDocuments(sortedPets[0].id);
      } else {
        console.log("usePetData - No pets found");
        setSelectedPet(null);
      }
    } catch (error) {
      console.error("Error loading pets:", error);
      toast({
        variant: "destructive",
        title: "Error loading pets",
        description: "Could not load your pets. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPet = async (petId: string) => {
    try {
      console.log("usePetData - Selecting pet:", petId);
      setIsLoading(true);
      const petDetails = await fetchPetDetails(petId);
      console.log("usePetData - Selected pet details:", petDetails);
      setSelectedPet(petDetails);
      await fetchDocuments(petId);
    } catch (error) {
      console.error("Error fetching pet details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load pet details. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePetUpdate = async () => {
    if (selectedPet?.id) {
      try {
        console.log("usePetData - Updating pet:", selectedPet.id);
        const updatedPetDetails = await fetchPetDetails(selectedPet.id);
        setSelectedPet(updatedPetDetails);
        
        const userPets = await fetchUserPets();
        const sortedPets = userPets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setPets(sortedPets);
        
        toast({
          title: "Success",
          description: "Pet profile updated successfully!",
        });
      } catch (error) {
        console.error("Error refreshing pet data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not refresh pet data. Please try again."
        });
      }
    }
  };

  const handleReorderPets = (reorderedPets: any[]) => {
    setPets(reorderedPets);
  };

  const handleDocumentUpdate = async () => {
    if (selectedPet?.id) {
      await fetchDocuments(selectedPet.id);
    }
  };

  const togglePetPublicVisibility = async (petId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('pets')
        .update({ is_public: isPublic })
        .eq('id', petId);

      if (error) {
        console.error("Error updating pet visibility:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not update pet visibility. Please try again."
        });
        return false;
      }

      // Update local state
      setPets(pets => pets.map(pet => 
        pet.id === petId ? { ...pet, is_public: isPublic } : pet
      ));

      if (selectedPet?.id === petId) {
        setSelectedPet(prev => prev ? { ...prev, is_public: isPublic } : null);
      }

      toast({
        title: "Success",
        description: `Pet profile is now ${isPublic ? 'public' : 'private'}.`
      });

      return true;
    } catch (error) {
      console.error("Error updating pet visibility:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update pet visibility. Please try again."
      });
      return false;
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  return {
    pets,
    selectedPet,
    isLoading,
    documents,
    handleSelectPet,
    handlePetUpdate,
    handleDocumentUpdate,
    handleReorderPets,
    togglePetPublicVisibility
  };
};
