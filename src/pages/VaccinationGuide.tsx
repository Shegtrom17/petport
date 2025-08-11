import { VaccinationGuide as VaccinationGuideComponent } from "@/components/VaccinationGuide";
import { PWALayout } from "@/components/PWALayout";
import { MetaTags } from "@/components/MetaTags";

export default function VaccinationGuide() {
  return (
    <PWALayout>
      <MetaTags 
        title="Vaccination Guide | PetPort"
        description="Comprehensive vaccination guide for dogs, cats, and horses. Travel requirements, boarding needs, and age-based vaccination schedules."
        url={`${window.location.origin}/vaccination-guide`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
              Vaccination Guide
            </h1>
            <p className="mt-2 text-navy-600">
              Comprehensive vaccination requirements for travel, boarding, and age-based schedules
            </p>
          </header>

          {/* Render the vaccination guide component without modal wrapper */}
          <VaccinationGuideComponent isOpen={true} onClose={() => {}} />
        </main>
      </div>
    </PWALayout>
  );
}