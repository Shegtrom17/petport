
import { useState, useEffect } from "react";
import { fetchUserPets, fetchPetDetails } from "@/services/petService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useIOSResilience } from "@/hooks/useIOSResilience";

const SELECTED_PET_KEY = 'selectedPetId';

export const usePetData = (initialPetId?: string) => {
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { safeAsync } = useIOSResilience();

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
    console.log("usePetData - Loading pets...");
    setIsLoading(true);
    
    const result = await safeAsync(
      async () => {
        const userPets = await fetchUserPets();
        console.log("usePetData - Fetched pets:", userPets);
        console.log("usePetData - User ID:", user?.id);
        
        // Keep DB order (already ordered in fetchUserPets)
        const orderedPets = userPets;
        setPets(orderedPets);
        
        if (orderedPets.length > 0) {
          // Determine which pet to select: initialPetId > localStorage > first pet
          let targetPetId = initialPetId;
          
          if (!targetPetId) {
            const savedPetId = localStorage.getItem(SELECTED_PET_KEY);
            if (savedPetId && orderedPets.find(p => p.id === savedPetId)) {
              targetPetId = savedPetId;
            } else {
              targetPetId = orderedPets[0].id;
            }
          }
          
          console.log("usePetData - Target pet ID:", targetPetId, "initial:", initialPetId, "saved:", localStorage.getItem(SELECTED_PET_KEY));
          
          const petDetails = await fetchPetDetails(targetPetId);
          console.log("usePetData - Selected pet details:", petDetails?.name, petDetails?.id);
          setSelectedPet(petDetails);
          
          // Load documents with resilience
          await safeAsync(
            () => fetchDocuments(targetPetId),
            undefined,
            'fetch-documents'
          );
          
          // Save selection to localStorage
          localStorage.setItem(SELECTED_PET_KEY, targetPetId);
        } else {
          console.log("usePetData - No pets found");
          setSelectedPet(null);
        }
        
        return true;
      },
      false, // Fallback value
      'load-pets'
    );
    
    if (!result) {
      toast({
        variant: "destructive",
        title: "Loading issue",
        description: "Could not load your pets. Check your connection and try again."
      });
    }
    
    setIsLoading(false);
  };

  const handleSelectPet = async (petId: string) => {
    console.log("usePetData - Selecting pet:", petId, "current selected:", selectedPet?.id);
    
    // Don't reload if already selected
    if (selectedPet?.id === petId) {
      console.log("usePetData - Pet already selected, skipping reload");
      return;
    }
    
    setIsLoading(true);
    
    const result = await safeAsync(
      async () => {
        const petDetails = await fetchPetDetails(petId);
        console.log("usePetData - Selected pet details:", petDetails?.name, petDetails?.id);
        setSelectedPet(petDetails);
        
        await safeAsync(
          () => fetchDocuments(petId),
          undefined,
          'fetch-documents-select'
        );
        
        // Save selection to localStorage
        localStorage.setItem(SELECTED_PET_KEY, petId);
        return true;
      },
      false,
      'select-pet'
    );
    
    if (!result) {
      toast({
        variant: "destructive",
        title: "Loading issue",
        description: "Could not load pet details. Check your connection and try again."
      });
    }
    
    setIsLoading(false);
  };

  const handlePetUpdate = async () => {
    if (selectedPet?.id) {
      try {
        console.log("usePetData - Updating pet:", selectedPet.id);
        const updatedPetDetails = await fetchPetDetails(selectedPet.id);
        setSelectedPet(updatedPetDetails);
        
        const userPets = await fetchUserPets();
        setPets(userPets);
        
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
    if (user?.id) {
      console.log("usePetData - User changed, loading pets for:", user.id);
      loadPets();
    }
  }, [user?.id]);

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
