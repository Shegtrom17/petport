
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PetProfileCard } from "@/components/PetProfileCard";
import { PetEditForm } from "@/components/PetEditForm";
import { NavigationTabs } from "@/components/NavigationTabs";
import { QuickIDSection } from "@/components/QuickIDSection";
import { CareInstructionsSection } from "@/components/CareInstructionsSection";
import { PetResumeSection } from "@/components/PetResumeSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TravelMapSection } from "@/components/TravelMapSection";
import { DocumentsSection } from "@/components/DocumentsSection";
import { BadgesSection } from "@/components/BadgesSection";
import { PetGallerySection } from "@/components/PetGallerySection";
import { PetPDFGenerator } from "@/components/PetPDFGenerator";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { InAppSharingModal } from "@/components/InAppSharingModal";
import { fetchUserPets, fetchPetDetails } from "@/services/petService";
import { useToast } from "@/hooks/use-toast";
import { MobileNavigationMenu } from "@/components/MobileNavigationMenu";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  console.log("Index component is rendering");
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isInAppSharingOpen, setIsInAppSharingOpen] = useState(false);
  
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  // Fetch documents for the selected pet
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

  // Fetch user's pets
  useEffect(() => {
    const loadPets = async () => {
      try {
        const userPets = await fetchUserPets();
        setPets(userPets);
        
        // If there are pets, select the first one by default
        if (userPets.length > 0) {
          const petDetails = await fetchPetDetails(userPets[0].id);
          setSelectedPet(petDetails);
          await fetchDocuments(userPets[0].id);
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

    loadPets();
  }, [toast]);

  // Check for in-app sharing hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#share-with-members') {
        setIsInAppSharingOpen(true);
        window.location.hash = ''; // Clear the hash
      }
    };

    handleHashChange(); // Check on mount
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Function to select a pet and fetch its details
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

  // Function to refresh pet data after updates
  const handlePetUpdate = async () => {
    if (selectedPet?.id) {
      try {
        const updatedPetDetails = await fetchPetDetails(selectedPet.id);
        setSelectedPet(updatedPetDetails);
        
        // Also refresh the pets list
        const userPets = await fetchUserPets();
        setPets(userPets);
        
        toast({
          title: "Success",
          description: "Pet profile updated successfully!",
        });
      } catch (error) {
        console.error("Error refreshing pet data:", error);
      }
    }
  };

  // Function to refresh documents after changes
  const handleDocumentUpdate = async () => {
    if (selectedPet?.id) {
      await fetchDocuments(selectedPet.id);
    }
  };

  // Use dummy data for now if no pets are found
  const petData = selectedPet || {
    name: "Luna",
    breed: "Golden Retriever", 
    species: "dog",
    age: "3 years",
    weight: "65 lbs",
    microchipId: "985112001234567",
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
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop",
        caption: "Distinctive white chest marking - heart-shaped pattern"
      },
      {
        url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop",
        caption: "Left ear has small brown spot near tip"
      }
    ]
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        console.log("Rendering profile tab");
        return (
          <div className="space-y-6">
            <SupportAnimalBanner />
            <PetProfileCard 
              petData={petData} 
            />
            <PetPDFGenerator petId={selectedPet?.id || petData.id || ""} petName={petData.name} />
          </div>
        );
      case "care":
        console.log("Rendering CareInstructionsSection");
        return <CareInstructionsSection petData={petData} />;
      case "resume":
        console.log("Rendering PetResumeSection");
        return <PetResumeSection petData={petData} />;
      case "reviews":
        console.log("Rendering ReviewsSection");
        return <ReviewsSection petData={petData} />;
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
      case "badges":
        console.log("Rendering BadgesSection");
        return <BadgesSection badges={petData.badges || []} petData={petData} />;
      case "gallery":
        console.log("Rendering PetGallerySection");
        return <PetGallerySection petData={petData} />;
      case "quickid":
        console.log("Rendering QuickIDSection");
        return <QuickIDSection petData={petData} />;
      default:
        return <div>Tab not found</div>;
    }
  };

  console.log("About to render main component");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl text-navy-800 animate-pulse">Loading your pets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo and Title */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex-shrink-0">
                <img 
                  src="/lovable-uploads/d4e1e1f9-612c-48bb-8391-e7bce7658e8c.png" 
                  alt="PetPass Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error("Header logo failed to load:", e);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log("Header logo loaded successfully")}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-navy-900 tracking-wide">
                  Digital Pet Passport
                </h1>
              </div>
            </div>
            
            {/* Right Side Controls */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <Button 
                className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                onClick={() => navigate('/add-pet')}
              >
                <PlusCircle className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Add Pet
              </Button>
              <MobileNavigationMenu activeTab={activeTab} onTabChange={setActiveTab} />
              <Button 
                variant="outline" 
                size="icon"
                onClick={signOut}
                title="Sign Out"
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Title - Show below logo on small screens */}
          <div className="sm:hidden mt-2 text-center">
            <h1 className="text-base font-bold text-navy-900 tracking-wide">
              Digital Pet Passport
            </h1>
          </div>
        </div>
      </header>

      {/* In-App Sharing Modal */}
      <InAppSharingModal
        isOpen={isInAppSharingOpen}
        onClose={() => setIsInAppSharingOpen(false)}
        petId={selectedPet?.id || petData.id || ""}
        petName={petData.name}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {pets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/70 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlusCircle className="h-10 w-10 text-navy-800/50" />
            </div>
            <h2 className="text-2xl font-bold text-navy-800 mb-3">No pets found</h2>
            <p className="text-navy-600 mb-6">You haven't added any pets yet. Create your first PetPass!</p>
            <Button 
              className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30"
              onClick={() => navigate('/add-pet')}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Pet
            </Button>
          </div>
        ) : (
          <>
            {/* Pet Selection (if multiple pets) */}
            {pets.length > 1 && (
              <div className="mb-6 overflow-x-auto pb-2">
                <div className="flex space-x-3">
                  {pets.map(pet => (
                    <Card 
                      key={pet.id} 
                      className={`border-2 cursor-pointer flex-shrink-0 w-64 transition-all ${
                        selectedPet?.id === pet.id 
                          ? 'border-navy-700 shadow-lg' 
                          : 'border-transparent hover:border-navy-300'
                      }`}
                      onClick={() => handleSelectPet(pet.id)}
                    >
                      <div className="p-4 flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          {pet.photoUrl ? (
                            <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-navy-200 flex items-center justify-center">
                              {pet.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{pet.name}</h3>
                          <p className="text-sm text-gray-500">{pet.breed}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Pet Header Card - Updated Passport Style with Moved Logo */}
            <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-navy-900 to-slate-800 p-4 md:p-6 text-white relative overflow-hidden">
                {/* Passport-style decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-yellow-500/10 rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-18 h-18 md:w-24 md:h-24 bg-yellow-500/10 rounded-full translate-y-9 md:translate-y-12 -translate-x-9 md:-translate-x-12"></div>
                
                {/* Moved Logo - Top Right Corner */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-sm border border-yellow-500/30">
                    <img 
                      src="/lovable-uploads/1af9fe70-ed76-44c5-a1e1-1a058e497a10.png" 
                      alt="Pawprint & HoofBeats Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error("Moved logo failed to load:", e);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => console.log("Moved logo loaded successfully")}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 md:space-x-8 relative z-20">
                  <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-lg overflow-hidden border-4 border-yellow-500/50 shadow-lg flex-shrink-0">
                    <img 
                      src={petData.photoUrl || "https://placehold.co/100x100?text=" + petData.name?.charAt(0)} 
                      alt={petData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 pr-12 md:pr-16">
                    <h2 className="text-xl md:text-3xl font-serif font-bold text-yellow-400 mb-1 tracking-wide">{petData.name?.toUpperCase()}</h2>
                    <p className="text-yellow-200 font-serif text-sm md:text-lg mb-2">{petData.breed} • {petData.age}</p>
                    <div className="flex items-center space-x-3 md:space-x-6 text-xs md:text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="font-serif text-yellow-200">Weight: {petData.weight}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="font-serif text-yellow-200">{petData.badges?.length || 0} Certifications</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 text-xs md:text-sm font-serif tracking-wide">GLOBE TROTTER</p>
                      <p className="text-xs text-yellow-300 font-mono">ID: {petData.petPassId}</p>
                    </div>
                  </div>
                </div>
                
                {/* Passport-style bottom border */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
              </div>
            </Card>

            {/* Navigation */}
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content Section */}
            <div className="mt-6">
              {renderTabContent()}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
