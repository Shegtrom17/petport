import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MetaTags } from "@/components/MetaTags";
import { AppShareButton } from "@/components/AppShareButton";
import PricingSection from "@/components/PricingSection";
import { Testimonials } from "@/components/Testimonials";
import createProfileScreenshot from "@/assets/create-profile-screenshot.png";
import documentUploadScreenshot from "@/assets/document-upload-screenshot.png";
import resumeDetailsScreenshot from "@/assets/resume-details-screenshot.png";
import shareInstructionsScreenshot from "@/assets/share-instructions-screenshot.png";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSharePrompt, setShowSharePrompt] = useState(false);

  useEffect(() => {
    const isPreview = new URLSearchParams(location.search).get("preview") === "1";
    const isShare = new URLSearchParams(location.search).get("share") === "true";
    
    if (isShare) {
      setShowSharePrompt(true);
    }
    
    // Only auto-redirect from the root ("/") so logged-in users can view /landing
    if (user && !isPreview && location.pathname === "/") {
      navigate('/app', { replace: true });
    }
  }, [user, navigate, location.search, location.pathname]);

  return (
    <div className="min-h-screen bg-white">
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

      <main>
        {/* Hero Section with Video/Animation Placeholder */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-brand-primary leading-tight">
                Digital Pet Portfolio
              </h1>
              <p className="mt-6 text-xl text-brand-primary-dark leading-relaxed">
                One place for everything about your pet. Beautiful profiles, emergency info, instant lost pet flyers, shareable links, PDFs, documents, and travel maps.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button onClick={() => navigate('/app')} size="lg" className="text-lg px-8 py-3 text-white">
                    Open App
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/auth')} size="lg" className="text-lg px-8 py-3">
                    Start Free Trial
                  </Button>
                )}
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Hero Video */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-auto rounded-2xl"
                  poster=""
                >
                  <source src="/hero-video.mp4" type="video/mp4" />
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

        <Testimonials />

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-primary mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">What is the primary focus of this app?</h3>
              <p className="text-brand-primary-dark">We focus on preserving and sharing your pet's life story. Unlike a simple appointment tracker, Petport captures —all documents/records, care instructions, achievements, even referrals. This ensures a seamless relay of information, whether to a pet sitter, vet or a new family.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">Is my pet's data secure?</h3>
              <p className="text-brand-primary-dark">Yes! All data is encrypted and stored securely. You control what's shared publicly vs. kept private.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">How many pets can I add?</h3>
              <p className="text-brand-primary-dark">Each plan includes 1 pet. You can add more pets with our affordable add-on packages.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">Does it work on all devices?</h3>
              <p className="text-brand-primary-dark">Yes! PetPort works on phones, tablets, and computers. Install it like an app or use it in your browser.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">Can I cancel anytime?</h3>
              <p className="text-brand-primary-dark">Absolutely. Cancel anytime from your account settings. No long-term commitments.</p>
            </div>
          </div>
        </section>

        {/* Share Prompt */}
        {showSharePrompt && (
          <section className="max-w-md mx-auto px-4 py-8">
            <AppShareButton variant="full" className="w-full" />
          </section>
        )}

        {/* Pricing Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
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
              <Button size="lg" className="text-lg px-8 py-3 bg-white text-brand-primary hover:bg-gray-100">
                Learn More
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