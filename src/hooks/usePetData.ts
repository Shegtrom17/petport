
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
      const userPets = await fetchUserPets();
      // Sort pets by creation date to ensure first pet stays first
      const sortedPets = userPets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setPets(sortedPets);
      
      if (sortedPets.length > 0) {
        const petDetails = await fetchPetDetails(sortedPets[0].id);
        setSelectedPet(petDetails);
        await fetchDocuments(sortedPets[0].id);
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
      setIsLoading(true);
      const petDetails = await fetchPetDetails(petId);
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
    handleReorderPets
  };
};
