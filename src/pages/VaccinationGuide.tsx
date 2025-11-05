import { VaccinationGuide as VaccinationGuideComponent } from "@/components/VaccinationGuide";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { useState } from "react";

export default function VaccinationGuide() {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleGoBack = () => {
    navigate("/learn");
  };

  return (
    <div className="min-h-screen bg-white">
      <MetaTags 
        title="Pet Vaccination Guide: Dog, Cat & Horse Vaccine Schedules | PetPort"
        description="Complete pet vaccination schedules for dogs, cats, and horses. Puppy shots timeline, kitten vaccines, pet travel requirements, boarding vaccination needs, and age-based immunization guides."
        url={`${window.location.origin}/vaccination-guide`}
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/OG%20General.png"
      />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Pet Vaccination Guide - Dog, Cat & Horse Vaccine Schedules",
          "description": "Comprehensive pet vaccination schedules for dogs, cats, and horses including puppy shots, kitten vaccines, pet travel vaccination requirements, and boarding immunization needs.",
          "url": "https://petport.app/vaccination-guide",
          "keywords": "pet vaccination schedule, dog vaccine timeline, puppy shots schedule, cat vaccination guide, kitten vaccines, horse vaccination schedule, pet travel vaccines, pet boarding requirements, rabies vaccine dogs, distemper vaccine, parvo vaccine puppies, pet immunization guide, core vaccines dogs, non-core vaccines cats, pet wellness vaccines, veterinary vaccination guide, pet health records, digital pet vaccine tracker",
          "about": {
            "@type": "MedicalWebPage",
            "medicalAudience": [{
              "@type": "MedicalAudience",
              "name": "Pet Owners"
            }]
          },
          "mainEntity": {
            "@type": "ItemList",
            "name": "Pet Vaccination Categories",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Dog Vaccination Schedule by Age"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Cat Vaccination Schedule by Age"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Horse Vaccination Requirements"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Pet Travel Vaccination Requirements"
              },
              {
                "@type": "ListItem",
                "position": 5,
                "name": "Pet Boarding Vaccination Needs"
              }
            ]
          }
        })}
      </script>

      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://petport.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Pet Vaccination Guide",
              "item": "https://petport.app/vaccination-guide"
            }
          ]
        })}
      </script>

      {/* Header Navigation */}
      <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
          <Link to="/" className="flex items-center gap-3">
            <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-10 h-10" />
            <span className="text-xl font-semibold text-brand-primary">PetPort</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button className="text-white">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <PublicNavigationMenu 
        isOpen={showMobileMenu} 
        onClose={() => setShowMobileMenu(false)}
      />
      
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Back Button */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className="flex items-center gap-2 text-navy-700 hover:text-navy-900 hover:bg-navy-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Features
            </Button>
          </div>

          <header className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
              Pet Vaccination Guide
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Comprehensive vaccination schedules for dogs, cats, and horses including travel requirements and boarding needs
            </p>
          </header>

          {/* Render the vaccination guide component in page mode */}
          <VaccinationGuideComponent isOpen={true} onClose={handleGoBack} isPageMode={true} />
        </main>
      </div>
    </div>
  );
}