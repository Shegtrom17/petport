import { useState, useEffect } from "react";
import worldMapOutline from "@/assets/world-map-outline.png";
import { NavigationTabs } from "@/components/NavigationTabs";
import { QuickIDSection } from "@/components/QuickIDSection";
import { CareInstructionsSection } from "@/components/CareInstructionsSection";
import { PetResumeSection } from "@/components/PetResumeSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { CertificationSection } from "@/components/CertificationSection";
import { TravelMapSection } from "@/components/TravelMapSection";
import { DocumentsSection } from "@/components/DocumentsSection";
import { PetGallerySection } from "@/components/PetGallerySection";
import { InAppSharingModal } from "@/components/InAppSharingModal";
import LostPet from "./LostPet";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PetHeader } from "@/components/PetHeader";
import { PetPassportCard } from "@/components/PetPassportCard";
import { PetSelector } from "@/components/PetSelector";
import { AuthenticationPrompt } from "@/components/AuthenticationPrompt";
import { PetProfileContent } from "@/components/PetProfileContent";
import { PetProfileCard } from "@/components/PetProfileCard";
import { usePetData } from "@/hooks/usePetData";

const Index = () => {
  console.log("Index component is rendering");
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isInAppSharingOpen, setIsInAppSharingOpen] = useState(false);
  
  const { user } = useAuth();
  const {
    pets,
    selectedPet,
    isLoading,
    documents,
    handleSelectPet,
    handlePetUpdate,
    handleDocumentUpdate,
    handleReorderPets
  } = usePetData();

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#share-with-members') {
        setIsInAppSharingOpen(true);
        window.location.hash = '';
      }
    };

    const handleNavigateToCare = () => {
      setActiveTab("care");
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('navigate-to-care', handleNavigateToCare);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('navigate-to-care', handleNavigateToCare);
    };
  }, []);

  // Enhanced petData with proper user_id from selectedPet or current user
  const petData = selectedPet ? {
    ...selectedPet,
    user_id: selectedPet.user_id || user?.id // Ensure user_id is always set
  } : {
    id: "sample-id",
    name: "Luna",
    breed: "Golden Retriever", 
    species: "dog",
    age: "3 years",
    weight: "65 lbs",
    microchipId: "985112001234567",
    petPortId: "PP-2025-001",
    petPassId: "PP-2025-001",
    bio: "Luna is a gentle and loving Golden Retriever with an exceptional temperament. She's been professionally trained and has a calm, patient demeanor that makes her wonderful with children and other pets. Luna loves outdoor adventures, especially hiking and swimming, but is equally content relaxing at home. She's house-trained, leash-trained, and responds well to commands. Her favorite activities include fetch, long walks, and meeting new people at the dog park.",
    notes: "Friendly with other dogs, loves swimming, afraid of thunderstorms",
    vetContact: "Dr. Sarah Johnson - (555) 123-4567",
    emergencyContact: "John Smith - (555) 987-6543",
    secondEmergencyContact: "Jane Smith - (555) 456-7890",
    petCaretaker: "John Smith",
    medicalAlert: true,
    medicalConditions: "Diabetes - requires insulin twice daily, Mild hip dysplasia",
    medications: ["Daily joint supplement", "Allergy medication as needed"],
    lastVaccination: "March 2024",
    medicalEmergencyDocument: null,
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
    fullBodyPhotoUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    badges: ["Well-Behaved", "Good with Kids", "House Trained", "Therapy Certified"],
    supportAnimalStatus: "Certified Therapy Dog",
    experiences: [
      {
        activity: "Therapy visits at Sunny Meadows Nursing Home",
        contact: "Sarah Wilson - (555) 234-5678",
        description: "Weekly visits providing comfort to residents"
      }
    ],
    achievements: [
      {
        title: "Outstanding Therapy Dog Award 2024",
        description: "Recognized for exceptional service and gentle temperament with elderly residents"
      }
    ],
    training: [
      {
        course: "Advanced Obedience Training",
        facility: "Happy Paws Training Center",
        phone: "(555) 345-6789",
        completed: "January 2024"
      }
    ],
    reviews: [
      {
        reviewerName: "Sarah Johnson",
        reviewerContact: "(555) 123-4567",
        rating: 5,
        text: "Luna is an exceptional therapy dog!",
        date: "March 2024",
        location: "Sunny Meadows Nursing Home",
        type: "Therapy Visit"
      }
    ],
    gallery_photos: [
      {
        id: "sample-gallery-1",
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop",
        caption: "Distinctive white chest marking - heart-shaped pattern"
      },
      {
        id: "sample-gallery-2",
        url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop",
        caption: "Left ear has small brown spot near tip"
      }
    ],
    user_id: user?.id || "sample-user-id" // Ensure user_id is always set
  };

  console.log("Index - Enhanced petData user_id:", petData.user_id);
  console.log("Index - Current user:", user?.id);

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        console.log("Rendering profile tab");
        return (
          <div className="space-y-6">
            <PetProfileContent 
              petData={petData}
              selectedPet={selectedPet}
              setActiveTab={setActiveTab}
              setIsInAppSharingOpen={setIsInAppSharingOpen}
              onPhotoUpdate={handlePetUpdate}
            />
            <PetProfileCard 
              petData={petData} 
              onUpdate={handlePetUpdate}
            />
          </div>
        );
      case "care":
        console.log("Rendering CareInstructionsSection");
        return <CareInstructionsSection petData={petData} />;
      case "resume":
        console.log("Rendering PetResumeSection with integrated certifications and reviews");
        return (
          <div className="space-y-6">
            <PetResumeSection petData={petData} />
            <CertificationSection petData={petData} />
            <ReviewsSection petData={petData} />
          </div>
        );
      case "travel":
        console.log("Rendering TravelMapSection");
        return <TravelMapSection petData={petData} />;
      case "documents":
        console.log("Rendering DocumentsSection");
        return <DocumentsSection 
          petId={selectedPet?.id || petData.id || ""} 
          documents={documents} 
          onDocumentDeleted={handleDocumentUpdate}
        />;
      case "gallery":
        console.log("Rendering PetGallerySection");
        return <PetGallerySection petData={petData} onUpdate={handlePetUpdate} />;
      case "quickid":
        console.log("Rendering QuickIDSection");
        return <QuickIDSection petData={petData} />;
      case "lostpet":
        console.log("Rendering LostPet");
        return <LostPet />;
      default:
        return <div>Tab not found</div>;
    }
  };

  console.log("About to render main component");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg md:text-xl text-navy-800 animate-pulse">Loading your pets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <PetHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <InAppSharingModal
        isOpen={isInAppSharingOpen}
        onClose={() => setIsInAppSharingOpen(false)}
        petId={selectedPet?.id || petData.id || ""}
        petName={petData.name}
      />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <AuthenticationPrompt isSignedIn={!!user} hasPets={pets.length > 0} />
        
        {user && pets.length > 0 && (
          <>
            <PetSelector 
              pets={pets}
              selectedPet={selectedPet}
              onSelectPet={handleSelectPet}
              onReorderPets={handleReorderPets}
            />

            <PetPassportCard petData={petData} />

            <div className="mb-4 sm:mb-6">
              <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="space-y-4 sm:space-y-6">
              {renderTabContent()}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
