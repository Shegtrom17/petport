
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Sample pet data - can be modified to test horse features
  const petData = {
    name: "Luna",
    breed: "Golden Retriever",
    species: "dog", // Change to "horse" to test horse features
    age: "3 years",
    weight: "65 lbs",
    microchipId: "985112001234567",
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
    fullBodyPhotoUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    vetContact: "Dr. Sarah Johnson - (555) 123-4567",
    emergencyContact: "John Smith - (555) 987-6543",
    lastVaccination: "March 2024",
    badges: ["Well-Behaved", "Good with Kids", "House Trained", "Therapy Certified"],
    medications: ["Daily joint supplement", "Allergy medication as needed"],
    notes: "Friendly with other dogs, loves swimming, afraid of thunderstorms"
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case "profile":
        return <PetProfileCard petData={petData} />;
      case "documents":
        return <DocumentsSection />;
      case "badges":
        return <BadgesSection badges={petData.badges} petData={petData} />;
      case "care":
        return <CareInstructionsSection petData={petData} />;
      case "quickid":
        return <QuickIDSection petData={petData} />;
      default:
        return <PetProfileCard petData={petData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PetPass
                </h1>
                <p className="text-sm text-gray-600">Digital Pet Passport</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Add Pet
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Pet Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
                <img 
                  src={petData.photoUrl} 
                  alt={petData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{petData.name}</h2>
                <p className="text-blue-100">{petData.breed} • {petData.age}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{petData.weight}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{petData.badges.length} badges</span>
                  </span>
                </div>
              </div>
            </div>
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
