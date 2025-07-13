import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, LogOut, LogIn } from "lucide-react";
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

  useEffect(() => {
    const loadPets = async () => {
      try {
        const userPets = await fetchUserPets();
        setPets(userPets);
        
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

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#share-with-members') {
        setIsInAppSharingOpen(true);
        window.location.hash = '';
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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

  const handleDocumentUpdate = async () => {
    if (selectedPet?.id) {
      await fetchDocuments(selectedPet.id);
    }
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Pet Overview */}
            <div className="space-y-4">
              <Card className="bg-[#f8f8f8] shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold-500/50 shadow-lg">
                      <img 
                        src={petData.photoUrl} 
                        alt={petData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-serif font-bold text-navy-900 mb-1">{petData.name}</h2>
                      <p className="text-navy-600 mb-2">{petData.breed} • {petData.age}</p>
                      <div className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 px-4 py-2 rounded-full font-mono text-sm font-bold">
                        {petData.petPassId}
                      </div>
                    </div>
                    <div className="w-full border-t border-gold-500/30 pt-4">
                      <h3 className="text-lg font-serif font-bold text-navy-900 mb-3 text-center border-b-2 border-gold-500 pb-1">Certifications</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {petData.badges.slice(0, 4).map((badge, index) => (
                          <div key={index} className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                              <span className="text-xl">🏆</span>
                            </div>
                            <p className="text-xs text-navy-700 font-medium">{badge}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Animal Status */}
              <SupportAnimalBanner status={petData.supportAnimalStatus} />
            </div>

            {/* Right Column - Main Actions */}
            <div className="space-y-4">
              {/* PDF Generation Card */}
              <Card className="bg-[#f8f8f8] shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
                    🛂 PASSPORT DOCUMENTS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PetPDFGenerator petId={selectedPet?.id || petData.id || ""} petName={petData.name} />
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="bg-[#f8f8f8] shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
                    ⚡ QUICK ACTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab("documents")}
                    className="w-full bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700 border border-gold-500/30"
                  >
                    📄 Manage Documents
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("quickid")}
                    variant="outline"
                    className="w-full border-navy-900 text-navy-900 hover:bg-navy-50"
                  >
                    🆔 Emergency Quick ID
                  </Button>
                  <Button 
                    onClick={() => setIsInAppSharingOpen(true)}
                    variant="outline"
                    className="w-full border-navy-900 text-navy-900 hover:bg-navy-50"
                  >
                    🔗 Share Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Medical Alert Card */}
              {petData.medicalAlert && (
                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-1">⚠️ MEDICAL ALERT</h3>
                      <p className="text-red-100 text-sm">{petData.medicalConditions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
      case "care":
        console.log("Rendering CareInstructionsSection");
        return <CareInstructionsSection petData={petData} />;
      case "resume":
        console.log("Rendering PetResumeSection with integrated badges");
        return (
          <div className="space-y-6">
            <PetResumeSection petData={petData} />
            <Card className="bg-[#f8f8f8] shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
                  🏆 VERIFIED ACHIEVEMENTS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {petData.badges.map((badge, index) => (
                    <div key={index} className="text-center p-4 bg-white/50 rounded-lg border border-gold-500/30">
                      <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg transform rotate-3">
                        <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🐾</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-navy-900">{badge}</p>
                      <div className="w-full h-1 bg-gold-500 rounded-full mt-2 opacity-50"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
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
        console.log("Rendering BadgesSection - redirecting to resume");
        setActiveTab("resume");
        return null;
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
        <div className="text-lg md:text-xl text-navy-800 animate-pulse">Loading your pets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex-shrink-0">
                <img 
                  src="/lovable-uploads/450d05bf-750d-4e05-901d-1a8eb468f62b.png" 
                  alt="PetPort Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error("Header logo failed to load:", e);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log("Header logo loaded successfully")}
                />
              </div>
              <div className="hidden sm:block min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-navy-900 tracking-wide truncate">
                  Digital Pet Passport
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
              {user ? (
                <>
                  <Button 
                    className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap"
                    onClick={() => navigate('/add-pet')}
                  >
                    <PlusCircle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> 
                    <span className="hidden sm:inline">Add Pet</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                  <MobileNavigationMenu activeTab={activeTab} onTabChange={setActiveTab} />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={signOut}
                    title="Sign Out"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> 
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Sign In</span>
                </Button>
              )}
            </div>
          </div>
          
          <div className="sm:hidden mt-2 text-center">
            <h1 className="text-sm font-bold text-navy-900 tracking-wide">
              Digital Pet Passport
            </h1>
          </div>
        </div>
      </header>

      <InAppSharingModal
        isOpen={isInAppSharingOpen}
        onClose={() => setIsInAppSharingOpen(false)}
        petId={selectedPet?.id || petData.id || ""}
        petName={petData.name}
      />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {!user ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/70 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <LogIn className="h-8 w-8 sm:h-10 sm:w-10 text-navy-800/50" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-800 mb-2 sm:mb-3">Welcome to PetPass</h2>
            <p className="text-navy-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">Sign in or create an account to manage your pet's digital passport!</p>
            <Button 
              className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Get Started
            </Button>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/70 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <PlusCircle className="h-8 w-8 sm:h-10 sm:w-10 text-navy-800/50" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-800 mb-2 sm:mb-3">No pets found</h2>
            <p className="text-navy-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">You haven't added any pets yet. Create your first PetPass!</p>
            <Button 
              className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30"
              onClick={() => navigate('/add-pet')}
            >
              <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Add Your First Pet
            </Button>
          </div>
        ) : (
          <>
            {pets.length > 1 && (
              <div className="mb-4 sm:mb-6 overflow-x-auto pb-2">
                <div className="flex space-x-2 sm:space-x-3 min-w-max">
                  {pets.map(pet => (
                    <Card 
                      key={pet.id} 
                      className={`border-2 cursor-pointer flex-shrink-0 w-56 sm:w-64 transition-all ${
                        selectedPet?.id === pet.id 
                          ? 'border-navy-700 shadow-lg' 
                          : 'border-transparent hover:border-navy-300'
                      }`}
                      onClick={() => handleSelectPet(pet.id)}
                    >
                      <div className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          {pet.photoUrl ? (
                            <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-navy-200 flex items-center justify-center text-sm sm:text-base">
                              {pet.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{pet.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{pet.breed}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Card className="mb-6 sm:mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-navy-900 to-slate-800 text-white">
              <div className="bg-gradient-to-r from-navy-900 to-slate-800 p-4 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-yellow-500/10 rounded-full -translate-y-8 sm:-translate-y-12 md:-translate-y-16 translate-x-8 sm:translate-x-12 md:translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-yellow-500/10 rounded-full translate-y-6 sm:translate-y-9 md:translate-y-12 -translate-x-6 sm:-translate-x-9 md:-translate-x-12"></div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-8 relative z-20">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 flex-1">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-lg overflow-hidden border-4 border-yellow-500/50 shadow-lg flex-shrink-0">
                      <img 
                        src={petData.photoUrl || "https://placehold.co/100x100?text=" + petData.name?.charAt(0)} 
                        alt={petData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-lg sm:text-xl md:text-3xl font-serif font-bold text-yellow-400 mb-1 tracking-wide break-words">{petData.name?.toUpperCase()}</h2>
                      <p className="text-yellow-200 font-serif text-sm sm:text-base md:text-lg mb-2">{petData.breed} • {petData.age}</p>
                      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-6 text-xs sm:text-sm mb-4">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                          <span className="font-serif text-yellow-200">Weight: {petData.weight}</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                          <span className="font-serif text-yellow-200">{petData.badges?.length || 0} Certifications</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center sm:min-w-[200px] md:min-w-[250px]">
                    <div className="mb-3 flex justify-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl flex items-center justify-center overflow-hidden border-2 border-yellow-500/50 shadow-lg">
                        <img 
                          src="/lovable-uploads/fda1bf45-8aa7-4652-90b2-3814829f4c95.png" 
                          alt="PetPort Logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error("PetPort logo failed to load:", e);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => console.log("PetPort logo loaded successfully")}
                        />
                      </div>
                    </div>
                    <p className="text-yellow-400 text-sm sm:text-base md:text-lg font-serif tracking-wide font-bold">GLOBE TROTTER</p>
                    <p className="text-xs sm:text-sm text-yellow-300 font-mono">ID: {petData.petPassId}</p>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
              </div>
            </Card>

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
