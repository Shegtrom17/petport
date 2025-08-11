import { VaccinationGuide as VaccinationGuideComponent } from "@/components/VaccinationGuide";
import { PWALayout } from "@/components/PWALayout";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VaccinationGuide() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Go back to the main app page
    navigate("/app");
  };

  return (
    <PWALayout>
      <MetaTags 
        title="Vaccination Guide | PetPort"
        description="Comprehensive vaccination guide for dogs, cats, and horses. Travel requirements, boarding needs, and age-based vaccination schedules."
        url={`${window.location.origin}/vaccination-guide`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Back Button */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className="flex items-center gap-2 text-navy-700 hover:text-navy-900 hover:bg-navy-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Button>
          </div>

          <header className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
              Vaccination Guide
            </h1>
            <p className="mt-2 text-navy-600">
              Comprehensive vaccination requirements for travel, boarding, and age-based schedules
            </p>
          </header>

          {/* Render the vaccination guide component in page mode */}
          <VaccinationGuideComponent isOpen={true} onClose={handleGoBack} isPageMode={true} />
        </main>
      </div>
    </PWALayout>
  );
}