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
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [publicPets, setPublicPets] = useState<any[]>([]);
  const [hasReferralCode, setHasReferralCode] = useState(false);

  // Detect if we're in preview environment
  const isPreview = window.location.hostname.includes('lovableproject.com') || window.location.hostname.includes('lovable.app');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    // Capture referral code
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('petport_referral', refCode);
      setHasReferralCode(true);
      console.log('Referral code captured:', refCode);
    }

    // Check for existing referral code
    if (localStorage.getItem('petport_referral')) {
      setHasReferralCode(true);
    }
    const isShare = urlParams.get("share") === "true";
    if (isShare) {
      setShowSharePrompt(true);
    }

    // Landing page always stays on "/" - no auto-redirects
    // Users manually navigate to /app via "Open App" button
  }, [location.search]);

  // Scroll to section if hash present (e.g., /#pricing)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Delay to ensure DOM is ready after navigation
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    }
  }, [location.hash]);

  // Load public pets for development navigation
  useEffect(() => {
    if (isPreview && user) {
      const loadPublicPets = async () => {
        try {
          const {
            data: pets
          } = await supabase.from('pets').select('id, name, species, breed').eq('is_public', true).eq('user_id', user.id).limit(5);
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
  return <div className="min-h-screen bg-white">
      <MetaTags 
        title="PetPort: Digital Pet Portfolio" 
        description="PetPort is your all-in-one digital information platform for pets and horses. Securely organize essential data: vaccines, insurance, medical records, and travel documents." 
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/OG%20General.png"
        url={window.location.origin + "/"} 
      />
      
      {/* Referral Banner */}
      {hasReferralCode && <div className="bg-brand-primary text-white py-2 text-center text-sm">
          🎉 You were referred! Start your free trial to thank your friend.
        </div>}

      {/* Header Navigation */}
      <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-10 h-10" />
          <span className="text-xl font-semibold text-brand-primary">PetPort</span>
        </div>
        <div className="flex items-center gap-3">
          <AppShareButton variant="icon" />
          {user ? <Button onClick={() => navigate('/app')} className="text-white">Open App</Button> : <Button onClick={() => navigate('/auth')} className="text-white">Sign In</Button>}
        </div>
      </header>

      {/* Referral Program Banner */}
      <div className="bg-gradient-to-r from-[#5691af]/10 to-[#5691af]/5 border-b border-[#5691af]/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-[#5691af] font-semibold">💰 Help another pet find their voice and earn $2 as a thank you</span>
            <Button 
              onClick={() => navigate('/referral-program')}
              variant="outline"
              size="sm"
              className="border-[#5691af] text-[#5691af] hover:bg-[#5691af] hover:text-white"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Development Navigation Helper - Preview Only */}
      {isPreview && user && publicPets.length > 0 && <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-700 font-medium">🧪 Preview Mode:</span>
                <span className="text-blue-600 text-sm">Quick links to your public pet profiles</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {publicPets.map(pet => <Button key={pet.id} variant="outline" size="sm" onClick={() => window.open(`/profile/${pet.id}`, '_blank')} className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
                    {pet.name} ({pet.species})
                  </Button>)}
              </div>
            </div>
          </div>
        </div>}

      <main>
        {/* Hero Section with Video/Animation Placeholder */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-brand-primary leading-tight">
                Digital Pet Passport
              </h1>
              <p className="mt-6 text-xl text-brand-primary-dark leading-relaxed">
                PetPort is an all-in-one digital information platform for pets and horses. Securely organize vaccines, insurance, medical records, and travel documents. Our innovative PetPort LiveLinks allow anyone with your shared link to view your pet's information instantly — perfect for groomers, sitters, or emergencies. Share a Lost Pet Link, Pet Résumé, and Care Instructions in real time. Instantly generate PDFs for lost-pet flyers. Update your pet's data from anywhere, to anyone, on any device
              </p>

              
              {/* Free Trial Badge */}
              <div className="mt-4 inline-flex items-center gap-2 bg-transparent border border-[#5691af]/30 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-[#5691af] rounded-full"></span>
                <span className="text-[#5691af] font-medium text-sm">7-Day Free Trial • No charges for 7 days • Cancel anytime</span>
              </div>
              <div className="mt-8 flex flex-col items-center md:items-start gap-2">
                {user ? <Button onClick={() => navigate('/app')} size="lg" className="text-lg px-8 py-3 text-white">
                    Open App
                  </Button> : <>
                    <a href="#pricing">
                      <Button size="lg" className="text-lg px-8 py-3 text-white">
                        Start Free Trial
                      </Button>
                    </a>
                    <p className="text-sm text-white/80">
                      7-day free trial • Card required; billed after trial unless canceled
                    </p>
                  </>}
              </div>
            </div>
            <div className="relative">
              {/* Hero Video */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <video key="hero-14" autoPlay muted loop playsInline preload="metadata" className="w-full h-auto rounded-2xl" poster="">
                  <source src="/hero-14.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>


        {/* Demo Preview Section */}
        <section className="bg-gradient-to-br from-brand-cream via-white to-brand-cream py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-brand-primary mb-4">Experience PetPort LiveLinks</h2>
              <p className="text-xl text-brand-primary-dark mb-8">See how we give your pet a digital voice — fully interactive and easy to update from any device, to anyone, with your link.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Resume Demo Card */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-brand-primary/20 hover:border-brand-primary transition-all hover:shadow-2xl">
                <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Professional Pet Resume</h3>
                  <p className="text-white/90">Certifications, training, achievements & reviews</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2 mb-6 text-brand-primary-dark">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary">✓</span>
                      <span>Professional certifications & credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary">✓</span>
                      <span>Training history & achievements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary">✓</span>
                      <span>References & verified reviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary">✓</span>
                      <span>Experience & activities timeline</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => navigate('/demo/resume')}
                    className="w-full bg-brand-primary hover:bg-brand-secondary text-white"
                    size="lg"
                  >
                    View Live Resume Demo
                  </Button>
                </div>
              </div>

              {/* Missing Pet Demo Card */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-red-200 hover:border-red-500 transition-all hover:shadow-2xl">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Missing Pet Emergency Page</h3>
                  <p className="text-white/90">Instant shareable alert with QR code</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2 mb-6 text-brand-primary-dark">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">✓</span>
                      <span>Last seen location & time details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">✓</span>
                      <span>Emergency contacts & instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">✓</span>
                      <span>Shareable QR code for flyers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">✓</span>
                      <span>Photo gallery & distinctive features</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => navigate('/demo/missing-pet')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    View Missing Pet Demo
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Demos use real data from Finnegan's PetPort Profile Information - all entries updated in real time.
              </p>
              <div className="flex flex-col items-center gap-4">
                <a href="#pricing" className="w-full max-w-md">
                  <Button 
                    size="lg"
                    className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white"
                  >
                    Create LiveLinks for Your Pet
                  </Button>
                </a>
                <Button 
                  onClick={() => navigate('/demos')}
                  variant="outline"
                  size="lg"
                  className="w-full max-w-md border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  See More LiveLink Demos
                </Button>
                <p className="text-sm text-muted-foreground">
                  7-day free trial included
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Showcase */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-brand-primary mb-4">PetPort.app Gives Them a Voice For a Lifetime.</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Pet Owners Section */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary/10">
                    <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-primary">For Pet Owners</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">One‑Tap Missing Pet Flyer</strong>
                      <p className="text-brand-primary-dark text-sm">with photos, last-seen details, and a shareable QR code, Instant PDF Flyer for printing (no designing needed). All can be updated instantly on your Lost Pet LiveLink- share on social media, text and email.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">Digital Pet File</strong>
                      <p className="text-brand-primary-dark text-sm">for vaccines, health records, medications, insurance, and adoption/certification—snap a photo and upload.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">Care & Handling</strong>
                      <p className="text-brand-primary-dark text-sm">routines, diet, meds, allergies, and behaviors so any caregiver has precise instructions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">Pet Credentials</strong>
                      <p className="text-brand-primary-dark text-sm">resume, referrals, and achievements for hotels, groomers, and sitters. Voice-to-text for bio and information builders.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">Travel Map</strong>
                      <p className="text-brand-primary-dark text-sm">drop pins to track trips and attach proof for pet‑friendly stays.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary/10">
                    <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-primary">Perfect App for Foster Caregivers</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">Foster-to-Adopter Transfer</strong>
                      <p className="text-brand-primary-dark text-sm">Streamline the transition. Give adopters a complete, digital version of the pet's profile with all your recorded notes, photos, and health logs.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">Care & Medication Schedule</strong>
                      <p className="text-brand-primary-dark text-sm">diets, routines, meds, allergies, behaviors.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">Behavior & Notes</strong>
                      <p className="text-brand-primary-dark text-sm">track quirks, training progress, and tips.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">Photos & Bio Builder</strong>
                      <p className="text-brand-primary-dark text-sm">create a great adoption profile fast.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <strong className="text-brand-primary">One‑Tap Transfer to Adopter</strong>
                      <p className="text-brand-primary-dark text-sm">move the full pet record to the new owner securely.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2"></div>
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
                  <img src={createProfileScreenshot} alt="Creating a pet profile - Add your pet's basic info, photos, and personality details" className="w-full h-full object-cover" loading="lazy" />
                </AspectRatio>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">1. Create Profile</h3>
              <p className="text-brand-primary-dark">Add your pet's basic info, photos, and personality details in under 5 minutes.</p>
            </div>

            <div className="text-center">
              {/* Step 2 Screenshot */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <AspectRatio ratio={4 / 3}>
                  <img src={documentUploadScreenshot} alt="Uploading documents - Snap photos of vaccines, health records, and certifications" className="w-full h-full object-cover" loading="lazy" />
                </AspectRatio>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">2. Upload Documents</h3>
              <p className="text-brand-primary-dark">Snap photos of vaccines, health records, and certifications. We'll organize everything.</p>
            </div>

            <div className="text-center">
              {/* Step 3 Screenshot */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <AspectRatio ratio={4 / 3}>
                  <img src={resumeDetailsScreenshot} alt="Adding resume details - Showcase achievements, certifications, and professional pet credentials" className="w-full h-full object-cover" loading="lazy" />
                </AspectRatio>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">3. Add Resume Details (optional)</h3>
              <p className="text-brand-primary-dark">Showcase achievements, certifications, and professional credentials to highlight your pet's accomplishments, even request reviews.</p>
            </div>

            <div className="text-center">
              {/* Step 4 Screenshot */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <AspectRatio ratio={4 / 3}>
                  <img src={shareInstructionsScreenshot} alt="Sharing pet information - Quick Share Hub with emergency profile, care instructions, and QR codes" className="w-full h-full object-cover" loading="lazy" />
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
                  With PetPort, it takes seconds — not hours — to get the word out. Our One-Tap Missing Pet Flyer and interactive LiveLink instantly pull your pet's photos, name, and last-seen details into a ready-to-share PDF flyer and LiveLink that can be shared in any format. <a href="/demos" className="font-bold text-brand-primary hover:underline">SEE DEMO</a>
                </p>
                <p className="text-brand-primary-dark leading-relaxed mt-4">
                  Both have a QR code printed that links others directly to your pet's LiveLink Lost Pet page. Anyone who scans it sees the most up-to-date info on the LiveLink page. Flyers can be downloaded straight from that LiveLink page, so others can post in nearby areas. It's not just you!!!
                </p>
                <p className="text-brand-primary-dark leading-relaxed mt-4">
                  The LiveLink has a revolutionary <strong>"Sightings Board"</strong> where the public can add sightings and you will be updated instantly via email if your companion is sighted or found. Updates happen in real-time, with notifications going directly to you as a member.
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
                  What's special about your Care & Handling feature?
                </h3>
                <p className="text-brand-primary-dark leading-relaxed">
                  With PetPort's LiveLinks, you never have to rewrite or resend pet care instructions again. Share one smart link with sitters, vets, or trainers — and they'll always see the most up-to-date info on diets, meds, allergies, routines, and notes.
                </p>
                <p className="text-brand-primary-dark leading-relaxed mt-4">
                  Even better, each Care & Handling LiveLink includes a Care Update board where your sitter or trainer can leave daily messages. That means no more chasing texts or worrying from afar — you get peace of mind, and they get clear, current instructions, whether you're across town or across the country. <a href="/demos" className="font-bold text-brand-primary hover:underline">SEE DEMO</a>
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
          <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": "How can I quickly make a lost pet flyer if my pet goes missing?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "With PetPort, it takes seconds — not hours — to get the word out. Our One-Tap Missing Pet Flyer and interactive LiveLink instantly pull your pet's photos, name, and last-seen details into a ready-to-share PDF flyer and LiveLink that can be shared in any format. Both have a QR code that links directly to your pet's LiveLink Lost Pet page with the most up-to-date info. The LiveLink features a revolutionary Sightings Board where the public can add sightings and you receive instant email notifications if your companion is sighted or found. Flyers can be downloaded from the LiveLink page so others can help post in nearby areas. No graphic design, no formatting headaches — just click, print, or share."
              }
            }, {
              "@type": "Question",
              "name": "How can I store and access my pet's medical records digitally?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "With PetPort, your pet's vaccines, health records, and certifications are all stored in one secure place. But unlike other apps, PetPort goes further — you can also attach emergency contacts, request vet or host referrals, and update care instructions in real time."
              }
            }, {
              "@type": "Question",
              "name": "Is there an app to keep all my pet's documents in one place?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! PetPort organizes everything — from adoption papers to insurance cards — and generates professional PDFs you can share instantly. Plus, you get extras like lost-pet flyers with one tap, travel maps, pet resumes builder and with referral request link, a photo gallery and care and handling instructions you can update from anywhere, Plus there is quick share hub with QR codes and live links to view all features on the web!"
              }
            }, {
              "@type": "Question",
              "name": "How do I transfer my pet's records if they go to a new owner or foster?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PetPort was designed for fosters and rescues. With one tap, you can securely transfer a pet's entire digital portfolio — photos, medical history, behavior notes — so the new owner gets everything they need immediately."
              }
            }, {
              "@type": "Question",
              "name": "What's special about your Care & Handling feature?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "With PetPort's LiveLinks, you never have to rewrite or resend pet care instructions again. Share one smart link with sitters, vets, or trainers — and they'll always see the most up-to-date info on diets, meds, allergies, routines, and notes. Even better, each Care & Handling LiveLink includes a Care Update board where your sitter or trainer can leave daily messages. That means no more chasing texts or worrying from afar — you get peace of mind, and they get clear, current instructions, whether you're across town or across the country."
              }
            }, {
              "@type": "Question",
              "name": "Why should I use PetPort instead of a paper file or basic notes app?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Paper gets lost, notes get outdated. PetPort is a living digital record: always backed up, easy to update, and instantly shareable. Beyond records, you can collect hospitality reviews, track travel history, and build a complete story of your pet's life."
              }
            }]
          })
        }} />
        </section>

        <Testimonials />


        {/* Share Prompt */}
        {showSharePrompt && <section className="max-w-md mx-auto px-4 py-8">
            <AppShareButton variant="full" className="w-full" />
          </section>}

        {/* Pricing Section */}
        <section id="pricing" className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
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
              {user ? <Button onClick={() => navigate('/app')} size="lg" className="text-lg px-8 py-3 bg-white text-brand-primary hover:bg-gray-100">
                  Open App
                </Button> : <Button onClick={() => navigate('/auth')} size="lg" className="text-lg px-8 py-3 bg-white text-brand-primary hover:bg-gray-100">
                  Start Free Trial
                </Button>}
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
                <li><a href="#pricing" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Sign Up</a></li>
                <li><a href="#features" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Pricing</a></li>
                <li><Link to="/referral-program" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Referral Program</Link></li>
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
    </div>;
}