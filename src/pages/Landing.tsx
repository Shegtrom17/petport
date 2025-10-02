import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MetaTags } from "@/components/MetaTags";
import { AppShareButton } from "@/components/AppShareButton";
import PricingSection from "@/components/PricingSection";
import { Testimonials } from "@/components/Testimonials";
import { supabase } from "@/integrations/supabase/client";
import createProfileScreenshot from "@/assets/create-profile-screenshot.png";
import documentUploadScreenshot from "@/assets/document-upload-screenshot.png";
import resumeDetailsScreenshot from "@/assets/resume-details-screenshot.png";
import shareInstructionsScreenshot from "@/assets/share-instructions-screenshot.png";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [publicPets, setPublicPets] = useState<any[]>([]);
  
  // Detect if we're in preview environment
  const isPreview = window.location.hostname.includes('lovableproject.com') || 
                   window.location.hostname.includes('lovable.app');

  useEffect(() => {
    const isShare = new URLSearchParams(location.search).get("share") === "true";
    
    if (isShare) {
      setShowSharePrompt(true);
    }
    
    // Landing page always stays on "/" - no auto-redirects
    // Users manually navigate to /app via "Open App" button
  }, [location.search]);

  // Load public pets for development navigation
  useEffect(() => {
    if (isPreview && user) {
      const loadPublicPets = async () => {
        try {
          const { data: pets } = await supabase
            .from('pets')
            .select('id, name, species, breed')
            .eq('is_public', true)
            .eq('user_id', user.id)
            .limit(5);
          
          if (pets) {
            setPublicPets(pets);
          }
        } catch (error) {
          console.error('Error loading public pets:', error);
        }
      };
      
      loadPublicPets();
    }
  }, [isPreview, user]);

  return (
    <div className="h-screen flex flex-col bg-white">
      <MetaTags
        title="PetPort: Digital Pet Portfolio"
        description="Create a digital pet portfolio for pet owners and foster caregivers."
        url={window.location.origin + "/"}
      />

      {/* Header Navigation */}
      <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-10 h-10" />
          <span className="text-xl font-semibold text-brand-primary">PetPort</span>
        </div>
        <div className="flex items-center gap-3">
          <AppShareButton variant="icon" />
          {user ? (
            <Button onClick={() => navigate('/app')} className="text-white">Open App</Button>
          ) : (
            <Button onClick={() => navigate('/auth')} className="text-white">Sign In</Button>
          )}
        </div>
      </header>

      {/* Development Navigation Helper - Preview Only */}
      {isPreview && user && publicPets.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-700 font-medium">🧪 Preview Mode:</span>
                <span className="text-blue-600 text-sm">Quick links to your public pet profiles</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {publicPets.map((pet) => (
                  <Button
                    key={pet.id}
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/profile/${pet.id}`, '_blank')}
                    className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {pet.name} ({pet.species})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto native-scroll hide-scrollbar touch-pan-y overscroll-y-contain">
        {/* Hero Section with Video/Animation Placeholder */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-brand-primary leading-tight">
                Digital Pet Passport
              </h1>
              <p className="mt-6 text-xl text-brand-primary-dark leading-relaxed">
                PetPort is your all-in-one app for pets and horses. Keep vaccines, vet visits, and travel documents organized. Instantly create lost pet flyers, PDFs, and QR codes — all with shareable links that update automatically. Add care instructions for sitters or adopters, plus a résumé builder, photo gallery and travel maps to showcase your pet's achievements.
              </p>
              
              {/* Free Trial Badge */}
              <div className="mt-4 inline-flex items-center gap-2 bg-transparent border border-[#5691af]/30 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-[#5691af] rounded-full"></span>
                <span className="text-[#5691af] font-medium text-sm">7-Day Free Trial • No charges for 7 days • Cancel anytime</span>
              </div>
              <div className="mt-8 flex justify-center md:justify-start">
                {user ? (
                  <Button onClick={() => navigate('/app')} size="lg" className="text-lg px-8 py-3 text-white">
                    Open App
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/auth?plan=monthly')} size="lg" className="text-lg px-8 py-3 text-white">
                    Start Free Trial
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              {/* Hero Video */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <video key="hero-6"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-auto rounded-2xl"
                  poster=""
                >
                  <source src="/hero-6.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>


        {/* Feature Showcase */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-brand-primary mb-4">Finally... Everything Your Pet Needs.</h2>
              <p className="text-xl text-brand-primary-dark">Your pet doesn't have a voice. Give them a permanent record.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Pet Owners Section */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  {/* PLACEHOLDER: Pet Owner Icon/Image */}
                  <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center border-2 border-dashed border-blue-400">
                    <span className="text-blue-600">👨‍👩‍👧‍👦</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-primary">For Pet Owners</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">🚨</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">One‑Tap Missing Pet Flyer</strong>
                      <p className="text-brand-primary-dark text-sm">with photos, last-seen details, and a shareable QR code (no designing needed).</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">📁</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Digital Pet File</strong>
                      <p className="text-brand-primary-dark text-sm">for vaccines, health records, medications, insurance, and adoption/certification—snap a photo and upload.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">💊</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Care & Handling</strong>
                      <p className="text-brand-primary-dark text-sm">routines, diet, meds, allergies, and behaviors so any caregiver has precise instructions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">🏆</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Pet Credentials</strong>
                      <p className="text-brand-primary-dark text-sm">resume, referrals, and achievements for hotels, groomers, and sitters.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">🗺️</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Travel Map</strong>
                      <p className="text-brand-primary-dark text-sm">drop pins to track trips and attach proof for pet‑friendly stays.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">⭐</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Reviews & Hospitality</strong>
                      <p className="text-brand-primary-dark text-sm">collect, store, and share vet or host reviews for references.</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                    <p className="text-blue-800 font-medium text-center">
                      Cloud‑secure • no more lost papers or searching computer files and gallery photos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Foster Caregivers Section */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  {/* PLACEHOLDER: Foster Caregiver Icon/Image */}
                  <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center border-2 border-dashed border-green-400">
                    <span className="text-green-600">🤝</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-primary">Perfect App for Foster Caregivers</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">📦</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Foster-to-Adopter Transfer</strong>
                      <p className="text-brand-primary-dark text-sm">Streamline the transition. Give adopters a complete, digital version of the pet's profile with all your recorded notes, photos, and health logs.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">📅</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Care & Medication Schedule</strong>
                      <p className="text-brand-primary-dark text-sm">diets, routines, meds, allergies, behaviors.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">📝</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Behavior & Notes</strong>
                      <p className="text-brand-primary-dark text-sm">track quirks, training progress, and tips.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">📸</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Photos & Bio Builder</strong>
                      <p className="text-brand-primary-dark text-sm">create a great adoption profile fast.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">🔄</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">One‑Tap Transfer to Adopter</strong>
                      <p className="text-brand-primary-dark text-sm">move the full pet record to the new owner securely.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Privacy by Default</strong>
                      <p className="text-brand-primary-dark text-sm">you choose what's shared publicly.</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-100 rounded-lg">
                    <p className="text-green-800 font-medium text-center">
                      Perfect for rescues, shelters, and foster families.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-primary mb-4">How It Works</h2>
            <p className="text-xl text-brand-primary-dark">Get started in minutes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              {/* Step 1 Screenshot */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <AspectRatio ratio={4 / 3}>
                  <img 
                    src={createProfileScreenshot} 
                    alt="Creating a pet profile - Add your pet's basic info, photos, and personality details"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">1. Create Profile</h3>
              <p className="text-brand-primary-dark">Add your pet's basic info, photos, and personality details in under 5 minutes.</p>
            </div>

            <div className="text-center">
              {/* Step 2 Screenshot */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <AspectRatio ratio={4 / 3}>
                  <img 
                    src={documentUploadScreenshot} 
                    alt="Uploading documents - Snap photos of vaccines, health records, and certifications"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">2. Upload Documents</h3>
              <p className="text-brand-primary-dark">Snap photos of vaccines, health records, and certifications. We'll organize everything.</p>
            </div>

            <div className="text-center">
              {/* Step 3 Screenshot */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <AspectRatio ratio={4 / 3}>
                  <img 
                    src={resumeDetailsScreenshot} 
                    alt="Adding resume details - Showcase achievements, certifications, and professional pet credentials"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">3. Add Resume Details (optional)</h3>
              <p className="text-brand-primary-dark">Showcase achievements, certifications, and professional credentials to highlight your pet's accomplishments, even request reviews.</p>
            </div>

            <div className="text-center">
              {/* Step 4 Screenshot */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <AspectRatio ratio={4 / 3}>
                  <img 
                    src={shareInstructionsScreenshot} 
                    alt="Sharing pet information - Quick Share Hub with emergency profile, care instructions, and QR codes"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">4. Share & Go</h3>
              <p className="text-brand-primary-dark">Share with vets, sitters, or hotels instantly. Generate PDFs and QR codes on demand.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-brand-primary-dark">
                Everything you need to know about PetPort
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">
                  How can I quickly make a lost pet flyer if my pet goes missing?
                </h3>
                <p className="text-brand-primary-dark leading-relaxed">
                  With PetPort, it takes seconds — not hours — to get the word out. Our One-Tap Missing Pet Flyer instantly pulls your pet's photos, name, and last-seen details into a ready-to-share PDF flyer. Each flyer includes:
                </p>
                <p className="text-brand-primary-dark leading-relaxed mt-4">
                  A QR code printed right on the flyer that links directly to your pet's live profile page. Anyone who scans it sees the most up-to-date info, even if you add new sightings later.
                </p>
                <p className="text-brand-primary-dark leading-relaxed mt-4">
                  A social media–ready share link, so you can blast the flyer to Facebook, Instagram, Nextdoor, or text it to neighbors with one tap.
                </p>
                <p className="text-brand-primary-dark leading-relaxed mt-4">
                  No graphic design, no formatting headaches — just click, print, or share. It's the fastest way to rally help when minutes matter.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">
                  How can I store and access my pet's medical records digitally?
                </h3>
                <p className="text-brand-primary-dark leading-relaxed">
                  With PetPort, your pet's vaccines, health records, and certifications are all stored in one secure place. But unlike other apps, PetPort goes further — you can also attach emergency contacts, request vet or host referrals, and update care instructions in real time.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">
                  Is there an app to keep all my pet's documents in one place?
                </h3>
                <p className="text-brand-primary-dark leading-relaxed">
                  Yes! PetPort organizes everything — from adoption papers to insurance cards — and generates professional PDFs you can share instantly. Plus, you get extras like lost-pet flyers with one tap, travel maps, pet resumes builder and with referral request link, a photo gallery and care and handling instructions you can update from anywhere, Plus there is quick share hub with QR codes and live links to view all features on the web!
                </p>
              </div>

              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">
                  How do I transfer my pet's records if they go to a new owner or foster?
                </h3>
                <p className="text-brand-primary-dark leading-relaxed">
                  PetPort was designed for fosters and rescues. With one tap, you can securely transfer a pet's entire digital portfolio — photos, medical history, behavior notes — so the new owner gets everything they need immediately.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">
                  Can I share my pet's care instructions with sitters or vets?
                </h3>
                <p className="text-brand-primary-dark leading-relaxed">
                  Absolutely. PetPort makes it simple to share real-time updates about diets, medications, allergies, and routines. It is viewable by anyone with the link or send an PDF via email. You control what's shared publicly vs. privately, and your sitter or vet always has the latest version.
                </p>
              </div>

              <div className="pb-8">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">
                  Why should I use PetPort instead of a paper file or basic notes app?
                </h3>
                <p className="text-brand-primary-dark leading-relaxed">
                  Paper gets lost, notes get outdated. PetPort is a living digital record: always backed up, easy to update, and instantly shareable. Beyond records, you can collect hospitality reviews, track travel history, and build a complete story of your pet's life.
                </p>
              </div>
            </div>
          </div>
          
          {/* Schema Markup for FAQ */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How can I quickly make a lost pet flyer if my pet goes missing?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "With PetPort, it takes seconds — not hours — to get the word out. Our One-Tap Missing Pet Flyer instantly pulls your pet's photos, name, and last-seen details into a ready-to-share PDF flyer. Each flyer includes: A QR code printed right on the flyer that links directly to your pet's live profile page. Anyone who scans it sees the most up-to-date info, even if you add new sightings later. A social media–ready share link, so you can blast the flyer to Facebook, Instagram, Nextdoor, or text it to neighbors with one tap. No graphic design, no formatting headaches — just click, print, or share. It's the fastest way to rally help when minutes matter."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How can I store and access my pet's medical records digitally?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "With PetPort, your pet's vaccines, health records, and certifications are all stored in one secure place. But unlike other apps, PetPort goes further — you can also attach emergency contacts, request vet or host referrals, and update care instructions in real time."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is there an app to keep all my pet's documents in one place?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes! PetPort organizes everything — from adoption papers to insurance cards — and generates professional PDFs you can share instantly. Plus, you get extras like lost-pet flyers with one tap, travel maps, pet resumes builder and with referral request link, a photo gallery and care and handling instructions you can update from anywhere, Plus there is quick share hub with QR codes and live links to view all features on the web!"
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How do I transfer my pet's records if they go to a new owner or foster?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "PetPort was designed for fosters and rescues. With one tap, you can securely transfer a pet's entire digital portfolio — photos, medical history, behavior notes — so the new owner gets everything they need immediately."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I share my pet's care instructions with sitters or vets?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Absolutely. PetPort makes it simple to share real-time updates about diets, medications, allergies, and routines. It is viewable by anyone with the link or send an PDF via email. You control what's shared publicly vs. privately, and your sitter or vet always has the latest version."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Why should I use PetPort instead of a paper file or basic notes app?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Paper gets lost, notes get outdated. PetPort is a living digital record: always backed up, easy to update, and instantly shareable. Beyond records, you can collect hospitality reviews, track travel history, and build a complete story of your pet's life."
                    }
                  }
                ]
              })
            }}
          />
        </section>

        <Testimonials />


        {/* Share Prompt */}
        {showSharePrompt && (
          <section className="max-w-md mx-auto px-4 py-8">
            <AppShareButton variant="full" className="w-full" />
          </section>
        )}

        {/* Pricing Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
          {/* Free Trial Banner */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <div className="bg-gradient-to-r from-[#5691af] to-[#4a7c9d] rounded-2xl text-white text-center py-6 px-8 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h3 className="text-2xl font-bold">Start Your 7-Day Free Trial</h3>
              </div>
              <p className="text-white/90 text-lg">Full access to all features • No charges for 7 days • Cancel anytime</p>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4">
            <PricingSection context="landing" />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-brand-primary text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Create Your Pet's Digital Portfolio?</h2>
            <p className="text-xl text-white/80 mb-8">Join thousands of pet parents who never worry about lost paperwork again.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button onClick={() => navigate('/app')} size="lg" className="text-lg px-8 py-3 bg-white text-brand-primary hover:bg-gray-100">
                  Open App
                </Button>
              ) : (
                <Button onClick={() => navigate('/auth')} size="lg" className="text-lg px-8 py-3 bg-white text-brand-primary hover:bg-gray-100">
                  Start Free Trial
                </Button>
              )}
              <Button size="lg" className="text-lg px-8 py-3 bg-white text-brand-primary hover:bg-gray-100" asChild>
                <Link to="/learn">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-brand-primary-dark py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-8 h-8" />
                <span className="text-xl font-semibold text-brand-primary">PetPort</span>
              </div>
              <p className="text-brand-primary-dark mb-4 max-w-md">
                The complete digital pet portfolio solution for pet owners and foster caregivers.
              </p>
              <p className="text-sm text-brand-primary/70">© {new Date().getFullYear()} PetPort. All rights reserved.</p>
              <p className="text-sm text-brand-primary/70 mt-1">PetPort, Blaine, MN</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-brand-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Sign Up</Link></li>
                <li><a href="#features" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Pricing</a></li>
                <li><a href="#faq" className="text-brand-primary-dark hover:text-brand-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-brand-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}