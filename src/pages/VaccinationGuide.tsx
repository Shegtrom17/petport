/**
 * VaccinationGuide Page Component
 * 
 * NOTE: This is the primary full-page route for /vaccination-guide
 * For the modal version, see src/components/VaccinationGuide.tsx
 * 
 * Navigation: Accessible from both public and authenticated menus
 * - PublicNavigationMenu: Main navigation for non-authenticated users
 * - MobileNavigationMenu: Authenticated user hamburger menu
 * 
 * Both menu types navigate to this page route for consistency.
 */

import { VaccinationGuide as VaccinationGuideComponent } from "@/components/VaccinationGuide";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { useState, useEffect } from "react";

export default function VaccinationGuide() {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleGoBack = () => {
    navigate("/learn");
  };

  useEffect(() => {
    // Signal to Prerender.io that page is ready after meta tags render
    const timer = setTimeout(() => {
      (window as any).prerenderReady = true;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

      {/* FAQPage Schema for Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How often do puppies and kittens need vaccinations?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Puppies and kittens typically require a series of vaccines every 3-4 weeks starting at 6-8 weeks of age until they are about 16 weeks old. This initial series builds immunity against core diseases like distemper, parvovirus, and rabies. After the puppy or kitten series, most pets need annual or triennial boosters depending on the vaccine type and local regulations."
              }
            },
            {
              "@type": "Question",
              "name": "What vaccinations are required for pet boarding and daycare?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most boarding facilities require rabies, DHPP (dogs) or FVRCP (cats), and Bordetella (kennel cough) vaccines. These must be current and documented. Some facilities also require canine influenza or other vaccines. Requirements vary by facility and location, so always check with your specific boarding provider at least 2 weeks before your reservation."
              }
            },
            {
              "@type": "Question",
              "name": "Which pet vaccines are mandatory for domestic and international travel?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "For domestic travel within the US, rabies vaccination is mandatory in most states. For international travel, requirements vary significantly by destination country but typically include rabies (administered at least 21 days before travel), a health certificate from a USDA-accredited veterinarian, and sometimes additional vaccines or blood tests. Some countries require ISO-standard microchips and quarantine periods. Always check specific requirements 3-6 months before travel."
              }
            },
            {
              "@type": "Question",
              "name": "What is the difference between core and non-core vaccines for pets?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Core vaccines are recommended for all pets regardless of lifestyle because they protect against serious, widespread diseases. For dogs, core vaccines include rabies, distemper, parvovirus, and adenovirus (DHPP). For cats, core vaccines are rabies, feline herpesvirus, calicivirus, and panleukopenia (FVRCP). Non-core vaccines like Bordetella, Lyme disease, or feline leukemia are given based on your pet's lifestyle, location, and risk factors."
              }
            },
            {
              "@type": "Question",
              "name": "How can I keep track of my pet's vaccination records digitally?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PetPort provides a secure digital platform to upload, organize, and track all vaccination records including due dates and reminders. You can instantly share these records with veterinarians, boarding facilities, or groomers via QR code or secure link. Digital records are especially valuable for travel, emergencies, and multi-pet households, ensuring you never miss a booster or lose important vaccination documentation."
              }
            },
            {
              "@type": "Question",
              "name": "When do adult dogs and cats need vaccine boosters?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "After the initial puppy or kitten vaccination series, most core vaccines require boosters. DHPP and FVRCP typically need boosters at 1 year after the initial series, then every 1-3 years depending on the vaccine formulation and veterinary protocol. Rabies vaccines are usually given every 1-3 years based on state law and vaccine type. Non-core vaccines like Bordetella may need boosters every 6-12 months. Your veterinarian will create a customized schedule based on your pet's age, health status, and lifestyle."
              }
            },
            {
              "@type": "Question",
              "name": "What vaccination documentation do I need for airline travel with my pet?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Airlines require a health certificate issued by a licensed veterinarian within 10 days of travel, current rabies vaccination (administered at least 30 days prior but not expired), and proof of other core vaccines. For international flights, you'll need a USDA-endorsed health certificate and must meet the destination country's import requirements. Each airline has specific requirements, so verify with your carrier at least 30 days before your flight."
              }
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