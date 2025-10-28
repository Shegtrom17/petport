import { useState, useEffect, useRef } from "react";
import worldMapOutline from "@/assets/world-map-outline.png";
import { NavigationTabs } from "@/components/NavigationTabs";
import { QuickIDSection } from "@/components/QuickIDSection";
import { CareInstructionsSection } from "@/components/CareInstructionsSection";
import { PetResumeSection } from "@/components/PetResumeSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TravelMapSection } from "@/components/TravelMapSection";
import { DocumentsSection } from "@/components/DocumentsSection";
import { PetGallerySection } from "@/components/PetGallerySection";
import { InAppSharingModal } from "@/components/InAppSharingModal";
import { PWALayout } from "@/components/PWALayout";
import StoryStream from "@/components/StoryStream";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { Phone, Shield } from "lucide-react";
import { PetHeader } from "@/components/PetHeader";
import { PetPassportCard } from "@/components/PetPassportCard";
import { PetSelector } from "@/components/PetSelector";
import { AuthenticationPrompt } from "@/components/AuthenticationPrompt";
import { CompactPrivacyToggle } from "@/components/CompactPrivacyToggle";
import { PetProfileContent } from "@/components/PetProfileContent";
import { usePetData } from "@/hooks/usePetData";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useNavigate, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { SwipeContainer } from "@/components/layout/SwipeContainer";
import { useOverlayOpen } from "@/stores/overlayStore";
import { isTouchDevice } from "@/hooks/useIsTouchDevice";

import { IOSMonitor } from "@/components/IOSMonitor";
import { IOSOptimizedIndex } from "@/components/IOSOptimizedIndex";
import { getPrevNext, type TabId } from "@/features/navigation/tabOrder";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { featureFlags } from "@/config/featureFlags";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

// Always start on profile tab (home screen) for returning users
const getInitialTab = () => {
  return 'profile';
};

const Index = () => {
  console.log("Index component is rendering");
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isInAppSharingOpen, setIsInAppSharingOpen] = useState(false);
  const [petLimit, setPetLimit] = useState<number>(0);
  const restoredRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { user, status } = useAuth();
  const { settings } = useUserSettings(user?.id);
  const isOverlayOpen = useOverlayOpen();
  
  
  // Feature flag and touch capability detection
  const touchCapable = isTouchDevice();
  const swipeEnabled = featureFlags.enableSwipeNavigation && touchCapable;
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

  const { runTour, tourKey, completeTour, skipTour } = useOnboardingTour({
    hasPets: pets.length > 0, // ✅ No-pet safeguard
    currentTab: activeTab,
  });

  const { 
    runTour: runLostPetTour, 
    tourKey: lostPetTourKey, 
    completeTour: completeLostPetTour, 
    skipTour: skipLostPetTour 
  } = useOnboardingTour({
    hasPets: pets.length > 0,
    tourType: 'lostPet',
    requiredTab: 'quickid',
    currentTab: activeTab,
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
    localStorage.setItem('pp_last_tab_last', tab); // General sticky key for Android remounts
    if (user?.id && settings.rememberLastTab && tab !== 'vaccination') {
      localStorage.setItem(`pp_last_tab_${user.id}`, tab);
    }
  };

  // Listen for navigation events from hamburger menu
  useEffect(() => {
    const handleNavigateToTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        handleTabChange(customEvent.detail);
      }
    };

    window.addEventListener('navigate-to-tab', handleNavigateToTab);
    return () => window.removeEventListener('navigate-to-tab', handleNavigateToTab);
  }, [user?.id, settings.rememberLastTab]);

  const { prev, next } = getPrevNext(activeTab as TabId);

  const handlePrivacyToggle = async (isPublic: boolean): Promise<boolean> => {
    if (!selectedPet?.id) return false;
    return await togglePetPublicVisibility(selectedPet.id, isPublic);
  };

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    console.log('iOS PTR: Refreshing data...');
    await queryClient.invalidateQueries();
    window.location.reload();
  };

  // Fetch pet limit when user changes
  useEffect(() => {
    const fetchPetLimit = async () => {
      if (!user?.id) return;
      
      try {
        const { data } = await supabase.rpc('get_user_pet_limit', {
          user_uuid: user.id
        });
        const newLimit = data || 0;
        
        // Show success message if user has more slots than pets (likely just purchased)
        if (newLimit > pets.length && pets.length > 0 && petLimit > 0 && newLimit > petLimit) {
          const addedSlots = newLimit - petLimit;
          toast({
            title: "🎉 Additional Pet Slots Added!",
            description: `You now have ${addedSlots} empty slot${addedSlots > 1 ? 's' : ''} available. Look for the dashed boxes to add new pets.`,
            duration: 8000,
          });
        }
        
        setPetLimit(newLimit);
      } catch (error) {
        console.error('Error fetching pet limit:', error);
      }
    };

    fetchPetLimit();
  }, [user?.id, pets.length, petLimit, toast]);

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

  // Handle query parameters for tab and pet selection (from public preview pages)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const petParam = searchParams.get('pet');
    
    if (tabParam) {
      // Valid tabs: profile, resume, care, quickid, gallery, travel, reviews, certifications, documents
      const validTabs = ['profile', 'resume', 'care', 'quickid', 'gallery', 'travel', 'reviews', 'certifications', 'documents'];
      if (validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
      // Clear the query parameters after processing
      setSearchParams({});
    }
    
    if (petParam && pets.length > 0) {
      // If a specific pet is requested, select it
      const requestedPet = pets.find(p => p.id === petParam);
      if (requestedPet && requestedPet.id !== selectedPet?.id) {
        handleSelectPet(requestedPet.id);
      }
    }
  }, [searchParams, pets, selectedPet?.id]);

  // Mark as restored immediately to prevent any tab restoration
  useEffect(() => {
    restoredRef.current = true;
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
          <PetProfileContent 
            petData={petData}
            selectedPet={selectedPet}
            setActiveTab={handleTabChange}
            setIsInAppSharingOpen={setIsInAppSharingOpen}
            onPhotoUpdate={handlePetUpdate}
            togglePetPublicVisibility={togglePetPublicVisibility}
            handlePetUpdate={handlePetUpdate}
          />
        );
      case "care":
        console.log("Rendering CareInstructionsSection");
        return <CareInstructionsSection petData={petData} onUpdate={handlePetUpdate} handlePetUpdate={handlePetUpdate} />;
      case "resume":
        console.log("Rendering PetResumeSection with integrated certifications and reviews");
        return (
          <div className="space-y-6">
            <PetResumeSection petData={petData} onUpdate={handlePetUpdate} handlePetUpdate={handlePetUpdate} />
            <ReviewsSection petData={petData} onUpdate={handlePetUpdate} />
            
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
        return (
          <>
            <PetGallerySection petData={petData} onUpdate={handlePetUpdate} handlePetUpdate={handlePetUpdate} />
            <div className="mt-8">
              <StoryStream petId={petData.id} petName={petData.name} />
            </div>
          </>
        );
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

  // Early status guards to prevent white screen on iOS
  if (status === "loading") {
    return (
      <PWALayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PWALayout>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <PWALayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-lg md:text-xl text-brand-primary animate-pulse">Loading your pets...</div>
        </div>
      </PWALayout>
    );
  }

  const content = (
    <div className="min-h-screen bg-white">
      {/* Only show PetHeader if user has pets or is unauthenticated */}
      {(selectedPet || !user) && (
        <PetHeader 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          selectedPetId={selectedPet?.id || petData.id}
          selectedPetName={selectedPet?.name || petData.name}
          selectedPet={selectedPet || petData}
          onPrivacyToggle={handlePrivacyToggle}
        />
      )}

      <InAppSharingModal
        isOpen={isInAppSharingOpen}
        onClose={() => setIsInAppSharingOpen(false)}
        petId={selectedPet?.id || petData.id || ""}
        petName={petData.name}
      />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-24">
        <AuthenticationPrompt isSignedIn={!!user} hasPets={pets.length > 0} />
        
        {user && pets.length > 0 && (
          <>
            <PetSelector 
              pets={pets}
              selectedPet={selectedPet}
              onSelectPet={handleSelectPet}
              onReorderPets={handleReorderPets}
              petLimit={petLimit}
              showEmptySlots={true}
            />

            {/* Medical Alert Banner - Only on Profile, Care & QuickID tabs */}
            {petData.medicalAlert && (activeTab === "profile" || activeTab === "care" || activeTab === "quickid") && (
              <Alert className="mb-6 border-red-600 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="ml-2 text-sm">
                  <strong className="text-red-900">MEDICAL ALERT:</strong>{' '}
                  <span className="text-red-800">
                    {petData.medicalConditions || 'This pet has active medical alerts requiring immediate attention.'}
                  </span>
                </AlertDescription>
              </Alert>
            )}


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
    </div>
  );

  return (
    <IOSOptimizedIndex activeTab={activeTab}>
      <PWALayout>
        {/* ✅ Main Onboarding Tour */}
        <OnboardingTour
          runTour={runTour}
          tourKey={tourKey}
          onComplete={completeTour}
          onSkip={skipTour}
          tourType="main"
        />
        
        {/* ✅ Lost Pet Tour - Tab navigation handled by hook */}
        <OnboardingTour
          runTour={runLostPetTour}
          tourKey={lostPetTourKey}
          onComplete={completeLostPetTour}
          onSkip={skipLostPetTour}
          tourType="lostPet"
        />
        
        {featureFlags.enablePullToRefresh ? (
          <PullToRefresh onRefresh={handleRefresh} disabled={isOverlayOpen}>
            {content}
          </PullToRefresh>
        ) : (
          content
        )}
      </PWALayout>
    </IOSOptimizedIndex>
  );
};

export default Index;
