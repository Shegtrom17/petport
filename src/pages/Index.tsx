import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, FileText, Star, Shield, Heart, Award } from "lucide-react";
import { PetProfileCard } from "@/components/PetProfileCard";
import { NavigationTabs } from "@/components/NavigationTabs";
import { DocumentsSection } from "@/components/DocumentsSection";
import { BadgesSection } from "@/components/BadgesSection";
import { CareInstructionsSection } from "@/components/CareInstructionsSection";
import { QuickIDSection } from "@/components/QuickIDSection";
import { PetResumeSection } from "@/components/PetResumeSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TravelMapSection } from "@/components/TravelMapSection";
import { PetGallerySection } from "@/components/PetGallerySection";

const Index = () => {
  console.log("Index component is rendering");
  
  const [activeTab, setActiveTab] = useState("profile");
  console.log("Active tab:", activeTab);
  
  // Enhanced pet data with new fields
  const petData = {
    name: "Luna",
    breed: "Golden Retriever",
    species: "dog",
    age: "3 years",
    weight: "65 lbs",
    microchipId: "985112001234567",
    petPassId: "PP-2025-001", // New simplified ID
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
    fullBodyPhotoUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    vetContact: "Dr. Sarah Johnson - (555) 123-4567",
    emergencyContact: "John Smith - (555) 987-6543",
    secondEmergencyContact: "Jane Smith - (555) 456-7890", // New field
    petCaretaker: "John Smith", // New field
    lastVaccination: "March 2024",
    badges: ["Well-Behaved", "Good with Kids", "House Trained", "Therapy Certified"],
    medications: ["Daily joint supplement", "Allergy medication as needed"],
    notes: "Friendly with other dogs, loves swimming, afraid of thunderstorms",
    bio: "Luna is a gentle and loving Golden Retriever with an exceptional temperament. She's been professionally trained and has a calm, patient demeanor that makes her wonderful with children and other pets. Luna loves outdoor adventures, especially hiking and swimming, but is equally content relaxing at home. She's house-trained, leash-trained, and responds well to commands. Her favorite activities include fetch, long walks, and meeting new people at the dog park.",
    supportAnimalStatus: "Certified Therapy Dog",
    // New medical alert fields
    medicalAlert: true,
    medicalConditions: "Diabetes - requires insulin twice daily, Mild hip dysplasia",
    medicalEmergencyDocument: null, // URL to uploaded document
    // New experience and training fields
    experience: [
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
    // Gallery photos with captions
    galleryPhotos: [
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

  console.log("Pet data:", petData);

  const renderActiveSection = () => {
    console.log("Rendering section for tab:", activeTab);
    
    try {
      switch (activeTab) {
        case "profile":
          console.log("Rendering PetProfileCard");
          return <PetProfileCard petData={petData} />;
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
          return <DocumentsSection />;
        case "badges":
          console.log("Rendering BadgesSection");
          return <BadgesSection badges={petData.badges} petData={petData} />;
        case "care":
          console.log("Rendering CareInstructionsSection");
          return <CareInstructionsSection petData={petData} />;
        case "quickid":
          console.log("Rendering QuickIDSection");
          return <QuickIDSection petData={petData} />;
        case "gallery":
          console.log("Rendering PetGallerySection");
          return <PetGallerySection petData={petData} />;
        default:
          console.log("Default case - rendering PetProfileCard");
          return <PetProfileCard petData={petData} />;
      }
    } catch (error) {
      console.error("Error rendering section:", error);
      return <div className="p-4 text-red-600">Error loading section: {error.message}</div>;
    }
  };

  console.log("About to render main component");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/61126f7b-5822-4f60-bf90-f595bb83b874.png" 
                  alt="PetPass Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-navy-900 to-gold-500 bg-clip-text text-transparent">
                  PetPass
                </h1>
                <p className="text-sm text-gray-600">Digital Pet Passport</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30">
              Add Pet
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Pet Header Card - Updated Passport Style */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-navy-900 to-slate-800 p-6 text-white relative overflow-hidden">
            {/* Passport-style decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Centered Global Travel Stamp - Smaller, Straighter, More Opaque */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-14 bg-yellow-500/70 rounded border-2 border-yellow-400/80 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-4 h-4 bg-yellow-200 rounded-full mx-auto mb-1"></div>
                <span className="text-xs font-bold text-navy-900 block leading-tight tracking-wide">GLOBAL<br/>TRAVEL</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4 relative z-20">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/61126f7b-5822-4f60-bf90-f595bb83b874.png" 
                  alt="PetPass Logo"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h1 className="text-yellow-400 text-lg font-serif font-bold tracking-wider">PETPASS</h1>
                  <p className="text-yellow-300 text-xs font-serif tracking-wide">DIGITAL PET PASSPORT</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 text-sm font-serif tracking-wide">UNITED STATES</p>
                <p className="text-xs text-yellow-300 font-mono">ID: {petData.petPassId}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 relative z-20">
              <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-yellow-500/50 shadow-lg flex-shrink-0">
                <img 
                  src={petData.photoUrl} 
                  alt={petData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-serif font-bold text-yellow-400 mb-1 tracking-wide">{petData.name.toUpperCase()}</h2>
                <p className="text-yellow-200 font-serif text-lg mb-2">{petData.breed} • {petData.age}</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="font-serif text-yellow-200">Weight: {petData.weight}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="font-serif text-yellow-200">{petData.badges.length} Certifications</span>
                  </div>
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
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
