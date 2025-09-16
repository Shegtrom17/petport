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
import { PWALayout } from "@/components/PWALayout";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { Phone, Shield } from "lucide-react";
import { PetHeader } from "@/components/PetHeader";
import { PetPassportCard } from "@/components/PetPassportCard";
import { PetSelector } from "@/components/PetSelector";
import { AuthenticationPrompt } from "@/components/AuthenticationPrompt";
import { CompactPrivacyToggle } from "@/components/CompactPrivacyToggle";
import { PetProfileContent } from "@/components/PetProfileContent";
import { PetProfileCard } from "@/components/PetProfileCard";
import { usePetData } from "@/hooks/usePetData";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useNavigate } from "react-router-dom";
import { SwipeContainer } from "@/components/layout/SwipeContainer";
import { useOverlayOpen } from "@/stores/overlayStore";
import { isTouchDevice } from "@/hooks/useIsTouchDevice";
import { featureFlags } from "@/config/featureFlags";
import { getPrevNext, type TabId } from "@/features/navigation/tabOrder";
import { PullToRefresh } from "@/components/PullToRefresh";
import { IOSRefreshPrompt } from "@/components/IOSRefreshPrompt";
import { ExternalLink } from "lucide-react";

const Index = () => {
  console.log("Index component is rendering");
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isInAppSharingOpen, setIsInAppSharingOpen] = useState(false);
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { settings } = useUserSettings(user?.id);
  const isOverlayOpen = useOverlayOpen();
  
  
  // Feature flag and touch capability detection
  const ENABLE_SWIPE_NAV = (import.meta.env.VITE_ENABLE_SWIPE_NAV ?? "true") === "true";
  const touchCapable = isTouchDevice();
  const swipeEnabled = ENABLE_SWIPE_NAV && touchCapable;
  const {
    pets,
    selectedPet,
    isLoading,
    documents,
    handleSelectPet,
    handlePetUpdate,
    handleDocumentUpdate,
    handleReorderPets,
    togglePetPublicVisibility
  } = usePetData();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (user?.id && settings.rememberLastTab && tab !== 'vaccination') {
      localStorage.setItem(`pp_last_tab_${user.id}`, tab);
    }
  };

  const { prev, next } = getPrevNext(activeTab as TabId);

  const handlePrivacyToggle = async (isPublic: boolean): Promise<boolean> => {
    if (!selectedPet?.id) return false;
    return await togglePetPublicVisibility(selectedPet.id, isPublic);
  };

  const handleRefresh = async () => {
    // Refresh pet data when user pulls to refresh
    if (selectedPet?.id) {
      await handlePetUpdate();
    }
    
    // Force page reload for iOS users to ensure fresh content
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#share-with-members') {
        setIsInAppSharingOpen(true);
        window.location.hash = '';
      }
    };

    const handleNavigateToCare = () => {
      handleTabChange("care");
    };

    const handleNavigateToHome = () => {
      handleTabChange("profile");
    };

    const handleNavigateToQuickid = () => {
      handleTabChange("quickid");
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('navigate-to-care', handleNavigateToCare);
    window.addEventListener('navigate-to-home', handleNavigateToHome);
    window.addEventListener('navigate-to-quickid', handleNavigateToQuickid);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('navigate-to-care', handleNavigateToCare);
      window.removeEventListener('navigate-to-home', handleNavigateToHome);
      window.removeEventListener('navigate-to-quickid', handleNavigateToQuickid);
    };
  }, []);

  useEffect(() => {
    if (user?.id && settings.rememberLastTab) {
      const saved = localStorage.getItem(`pp_last_tab_${user.id}`);
      if (saved) setActiveTab(saved === 'vaccination' ? 'profile' : saved);
    }
  }, [user?.id, settings.rememberLastTab]);

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
              setActiveTab={handleTabChange}
              setIsInAppSharingOpen={setIsInAppSharingOpen}
              onPhotoUpdate={handlePetUpdate}
              togglePetPublicVisibility={togglePetPublicVisibility}
              handlePetUpdate={handlePetUpdate}
              onEditClick={() => {
                // Trigger the PetProfileCard to enter edit mode
                window.dispatchEvent(new CustomEvent('trigger-pet-edit'));
              }}
            />
            <PetProfileCard 
              petData={petData} 
              onUpdate={handlePetUpdate}
              togglePetPublicVisibility={togglePetPublicVisibility}
            />
          </div>
        );
      case "care":
        console.log("Rendering CareInstructionsSection");
        return <CareInstructionsSection petData={petData} onUpdate={handlePetUpdate} handlePetUpdate={handlePetUpdate} />;
      case "resume":
        console.log("Rendering PetResumeSection with integrated certifications and reviews");
        return (
          <div className="space-y-6">
            <PetResumeSection petData={petData} onUpdate={handlePetUpdate} handlePetUpdate={handlePetUpdate} />
            <CertificationSection petData={petData} onUpdate={handlePetUpdate} />
            <ReviewsSection petData={petData} onUpdate={handlePetUpdate} />
            
            {/* Contact Information Section - NOW TRULY at the bottom */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ContactsDisplay petId={petData.id} hideHeader={true} />
                  
                  <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-gray-200">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">PetPort ID</p>
                      <p className="text-sm text-blue-700 font-mono">{petData.petPassId}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Documentation Note - Placed after contact info */}
            <Card className="border-0 shadow-sm bg-brand-primary/5 border-l-4 border-brand-primary">
              <CardContent className="p-4">
                <p className="text-brand-primary-dark text-sm font-medium">
                  📄 For supporting documentation, please see the Documents page.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case "travel":
        console.log("Rendering TravelMapSection");
        return <TravelMapSection petData={petData} onUpdate={handlePetUpdate} />;
      case "documents":
        console.log("Rendering DocumentsSection");
        return <DocumentsSection 
          petId={selectedPet?.id || petData.id || ""} 
          petName={selectedPet?.name || petData.name || 'Your Pet'}
          documents={documents} 
          onDocumentDeleted={handleDocumentUpdate}
        />;
      case "gallery":
        console.log("Rendering PetGallerySection");
        return <PetGallerySection petData={petData} onUpdate={handlePetUpdate} handlePetUpdate={handlePetUpdate} />;
      case "quickid":
        console.log("Rendering QuickIDSection");
        return <QuickIDSection petData={petData} onUpdate={handlePetUpdate} />;
      case "lostpet":
        console.log("Redirecting to QuickID for lost pet management");
        handleTabChange("quickid");
        return null;
      case "vaccination":
        console.log("Navigating to VaccinationGuide page");
        navigate("/vaccination-guide");
        return null;
      default:
        return <div>Tab not found</div>;
    }
  };

  console.log("About to render main component");

  if (isLoading) {
    return (
      <PWALayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-lg md:text-xl text-brand-primary animate-pulse">Loading your pets...</div>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout>
      <div className="min-h-screen bg-white">
        <PetHeader 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          selectedPetId={selectedPet?.id || petData.id}
          selectedPetName={selectedPet?.name || petData.name}
          selectedPet={selectedPet || petData}
          onPrivacyToggle={handlePrivacyToggle}
        />

        <InAppSharingModal
          isOpen={isInAppSharingOpen}
          onClose={() => setIsInAppSharingOpen(false)}
          petId={selectedPet?.id || petData.id || ""}
          petName={petData.name}
        />

        <IOSRefreshPrompt onRefresh={handleRefresh} />
        <PullToRefresh onRefresh={handleRefresh} disabled={!user || pets.length === 0}>
          <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-24">
            {/* TestMode Helper - Quick Access to Lost Pet Page */}
            {featureFlags.testMode && user && pets.length > 0 && selectedPet && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">TestMode Helper:</span>
                    <span className="text-sm text-blue-700">Quick access to Lost Pet page</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/lost-pet/${selectedPet.id}`, '_blank')}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open Lost Pet
                  </Button>
                </div>
              </div>
            )}
            
            <AuthenticationPrompt isSignedIn={!!user} hasPets={pets.length > 0} />
            
            {user && pets.length > 0 && (
              <>
                <PetSelector 
                  pets={pets}
                  selectedPet={selectedPet}
                  onSelectPet={handleSelectPet}
                  onReorderPets={handleReorderPets}
                />


                {/* Show PetPassportCard only on Profile tab */}
                {activeTab === "profile" && (
                  <PetPassportCard petData={petData} onUpdate={handlePetUpdate} />
                )}

                <div className="mb-4 sm:mb-6">
                  <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} />
                </div>

                <SwipeContainer
                  enabled={swipeEnabled}
                  isOverlayOpen={isOverlayOpen}
                  isPtrActive={false}
                  onPrev={() => handleTabChange(prev)}
                  onNext={() => handleTabChange(next)}
                  debug={false}
                >
                  <div className="space-y-4 sm:space-y-6">
                    {renderTabContent()}
                  </div>
                </SwipeContainer>
              </>
            )}
          </main>
        </PullToRefresh>

        {/* Floating Report Issue Button */}
        
      </div>
    </PWALayout>
  );
};

export default Index;
