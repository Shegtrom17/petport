import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PricingSection } from "@/components/PricingSection";
import createProfileScreenshot from "@/assets/create-profile-screenshot.png";
import documentUploadScreenshot from "@/assets/document-upload-screenshot.png";
import resumeDetailsScreenshot from "@/assets/resume-details-screenshot.png";
import shareInstructionsScreenshot from "@/assets/share-instructions-screenshot.png";

export default function Learn() {
  return (
    <div className="min-h-screen bg-white">
      <MetaTags
        title="Complete Pet Care Guide: Digital Documentation & Reviews | PetPort"
        description="Learn how to organize pet documents, request reviews from trainers, groomers & sitters, and create emergency profiles. Complete guide to digital pet management."
        url={window.location.origin + "/learn"}
      />

      {/* Header Navigation */}
      <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-10 h-10" />
            <span className="text-xl font-semibold text-brand-primary">PetPort</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button className="text-white">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-brand-primary mb-6 leading-tight">
            Instant Access Anywhere Anytime for Anyone
          </h1>
          <div className="text-xl text-brand-primary-dark leading-relaxed max-w-3xl mx-auto">
            <ul className="text-left space-y-3">
              <li>• Instant PDF generation for vet visits, boarding, travel</li>
              <li>• Live-updating shareable links - when you update info, shared links update too</li>
              <li>• From phone to PDF in seconds, from profile to shareable link instantly</li>
            </ul>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="bg-blue-50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-brand-primary mb-6">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <a href="#digital-organization" className="block text-brand-primary hover:text-blue-600 font-medium">📁 Digital Pet Document Organization</a>
              <a href="#emergency-preparedness" className="block text-brand-primary hover:text-blue-600 font-medium">🚨 Emergency Preparedness for Pets</a>
              <a href="#professional-reviews" className="block text-brand-primary hover:text-blue-600 font-medium">⭐ Building Professional Pet Reviews</a>
              <a href="#travel-documentation" className="block text-brand-primary hover:text-blue-600 font-medium">✈️ Pet Travel Documentation</a>
            </div>
            <div className="space-y-2">
              <a href="#health-records" className="block text-brand-primary hover:text-blue-600 font-medium">🏥 Health Record Management</a>
              <a href="#foster-care" className="block text-brand-primary hover:text-blue-600 font-medium">🤝 Foster Care Best Practices</a>
              <a href="#sharing-securely" className="block text-brand-primary hover:text-blue-600 font-medium">🔒 Secure Information Sharing</a>
              <a href="#getting-started" className="block text-brand-primary hover:text-blue-600 font-medium">🚀 Getting Started with PetPort</a>
            </div>
          </div>
        </section>

        {/* Digital Organization Section */}
        <section id="digital-organization" className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-6">📁 Digital Pet Document Organization</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-primary-dark mb-6">
              Gone are the days of lost vaccination records and scattered pet documents. Learn how to create 
              a comprehensive digital filing system that keeps everything organized and accessible.
            </p>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">Essential Documents Every Pet Owner Needs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-brand-primary mb-2">Health Records</h4>
                  <ul className="text-brand-primary-dark space-y-1 text-sm">
                    <li>• Vaccination certificates</li>
                    <li>• Veterinary exam records</li>
                    <li>• Medication prescriptions</li>
                    <li>• Lab test results</li>
                    <li>• Surgery records</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-brand-primary mb-2">Legal & Insurance</h4>
                  <ul className="text-brand-primary-dark space-y-1 text-sm">
                    <li>• Registration papers</li>
                    <li>• Insurance policies</li>
                    <li>• Adoption certificates</li>
                    <li>• Microchip information</li>
                    <li>• Travel permits</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">💡 Pro Tip: Photo Documentation</h3>
              <p className="text-brand-primary-dark">
                Instead of keeping physical papers, upload or take high-quality photos of all documents. 
                PetPort automatically organizes them by category and makes them searchable and into instant PDF's, 
                so you'll never lose important information again and can view or forward information anytime, anywhere.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Preparedness */}
        <section id="emergency-preparedness" className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-6">🚨 Emergency Preparedness for Pets</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-primary-dark mb-6">
              Every pet owner's worst nightmare is a lost pet. Learn how to create an emergency-ready profile 
              that can help bring your pet home faster. Create Social media shareable link and PDF with a tap. 
              No design skills needed.
            </p>

            <div className="bg-red-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">Critical Information for Lost Pet Situations</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-brand-primary mb-2">Essential Details</h4>
                  <ul className="text-brand-primary-dark space-y-1">
                    <li>• Recent, clear photos from multiple angles</li>
                    <li>• Distinguishing marks, scars, or unique features</li>
                    <li>• Behavioral traits (friendly, shy, fearful)</li>
                    <li>• Last known location and time</li>
                     <li>• Microchip number and registration info</li>
                     <li>• Reward information</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-brand-primary mb-2">🚨 Medical Alerts & Care Instructions</h4>
                  <ul className="text-brand-primary-dark space-y-1">
                    <li>• Critical medical conditions and allergies</li>
                    <li>• Emergency medication requirements</li>
                    <li>• Special care instructions for finders/caregivers</li>
                    <li>• Emergency vet contact information</li>
                    <li>• Behavioral warnings for safe handling</li>
                  </ul>
                  <p className="text-brand-primary-dark text-sm mt-3 italic">
                    These medical alerts automatically appear in both your care instructions and lost pet profiles, 
                    ensuring anyone helping your pet has critical safety information.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-brand-primary mb-2">🚀 One-Tap Missing Pet Flyer</h4>
                  <p className="text-brand-primary-dark text-sm">
                    With PetPort, you can generate a professional missing pet flyer in seconds, 
                    complete with QR codes for easy sharing and all essential information formatted 
                    for maximum visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Reviews Section */}
        <section id="professional-reviews" className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-6">⭐ Building Professional Pet Reviews & References</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-primary-dark mb-6">
              Just like professionals need references, your pet can benefit from reviews from service providers. 
              Build a credible reputation that opens doors to better care and accommodations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">🎓 Professional Trainers</h3>
                <p className="text-brand-primary-dark mb-4">Request reviews from certified dog trainers, behaviorists, and obedience instructors.</p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-brand-primary mb-2">What to Include:</h4>
                  <ul className="text-brand-primary-dark text-sm space-y-1">
                    <li>• Training milestones achieved</li>
                    <li>• Behavioral improvements</li>
                    <li>• Response to commands</li>
                    <li>• Social skills with other pets</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">✂️ Professional Groomers</h3>
                <p className="text-brand-primary-dark mb-4">Showcase your pet's grooming history and temperament during care.</p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-brand-primary mb-2">Review Points:</h4>
                  <ul className="text-brand-primary-dark text-sm space-y-1">
                    <li>• Behavior during grooming</li>
                    <li>• Coat condition and care needs</li>
                    <li>• Special handling requirements</li>
                    <li>• Overall temperament</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">🏠 Pet Sitters & Daycare</h3>
                <p className="text-brand-primary-dark mb-4">Build trust with future caregivers through verified sitting experiences.</p>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-brand-primary mb-2">Key Attributes:</h4>
                  <ul className="text-brand-primary-dark text-sm space-y-1">
                    <li>• Daily routine adherence</li>
                    <li>• Interaction with caregivers</li>
                    <li>• House behavior and cleanliness</li>
                    <li>• Emergency situation response</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-brand-primary mb-4">🏨 Hotels & Lodging</h3>
                <p className="text-brand-primary-dark mb-4">Create a travel reputation that gets you welcomed at pet-friendly accommodations.</p>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-brand-primary mb-2">Hotel Reviews Cover:</h4>
                  <ul className="text-brand-primary-dark text-sm space-y-1">
                    <li>• Property respect and cleanliness</li>
                    <li>• Noise levels and disturbance</li>
                    <li>• Interaction with other guests</li>
                    <li>• Damage-free stays</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">🔗 How to Request Reviews with PetPort</h3>
              <ol className="text-brand-primary-dark space-y-3">
                <li><strong>1. Share Your Pet's Profile:</strong> Send your PetPort profile link to service providers after a positive experience.</li>
                <li><strong>2. Request Specific Feedback:</strong> Ask for comments on behavior, training, cleanliness, and overall experience.</li>
                <li><strong>3. Build Your Portfolio:</strong> Collect reviews over time to create a comprehensive reputation.</li>
                <li><strong>4. Share with New Providers:</strong> Show your pet's track record to new groomers, sitters, and hotels - instantly share via PDF download, shareable link, or directly from your phone.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Travel Documentation */}
        <section id="travel-documentation" className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-6">✈️ Pet Travel Documentation Made Simple</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-primary-dark mb-6">
              Traveling with pets requires careful planning and proper documentation. Learn what you need 
              for domestic and international travel.
            </p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">✈️ Pet Travel Made Simple</h3>
              <p className="text-brand-primary-dark mb-6">
                Travel with confidence, whether it's a road trip or crossing state lines.
                With PetPort, your pet's important health and ID records are always at your fingertips — no frantic searching before a trip.
              </p>
              
              <div className="mb-6">
                <h4 className="font-semibold text-brand-primary mb-3">What you'll always have ready in your PetPort profile:</h4>
                <ul className="text-brand-primary-dark space-y-2">
                  <li>✅ Vaccination & rabies records (often required for boarding, hotels, or travel)</li>
                  <li>✅ Vet-issued health certificate (for airlines or border checks)</li>
                  <li>✅ Microchip info and ID tags</li>
                  <li>✅ Care instructions and emergency contacts</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-brand-primary mb-3">Pet Resume</h4>
                <p className="text-brand-primary-dark">
                  Build your pet's travel reputation with reviews from boarding facilities, hotels, and service providers.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-brand-primary mb-3">For International Travelers (when needed):</h4>
                <ul className="text-brand-primary-dark space-y-2">
                  <li>📝 General vaccination documentation for border checks</li>
                  <li>🌍 Guidance notes on where to find official requirements (embassies, airlines)</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">🗺️ Travel Map Feature</h3>
              <p className="text-brand-primary-dark">
                Use PetPort's travel map to track your adventures, save important locations like 
                pet-friendly hotels and emergency vets, and build a visual record of your travels together.
              </p>
            </div>
          </div>
        </section>

        {/* Health Records Management */}
        <section id="health-records" className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-6">🏥 Digital vs Paper: Health Record Management</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-primary-dark mb-6">
              Keeping track of your pet's health history is crucial for providing the best care. 
              Learn why digital records are superior and how to make the transition.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-700 mb-4">❌ Problems with Paper Records</h3>
                <ul className="text-red-600 space-y-2">
                  <li>• Easy to lose or damage</li>
                  <li>• Hard to organize and find</li>
                  <li>• Can't share quickly with vets</li>
                  <li>• Take up physical storage space</li>
                  <li>• No backup if lost</li>
                  <li>• Difficult to read handwriting</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-700 mb-4">✅ Benefits of Digital Records</h3>
                <ul className="text-green-600 space-y-2">
                  <li>• Accessible from anywhere</li>
                  <li>• Accessible from phone with a tap</li>
                  <li>• Automatically organized</li>
                  <li>• Easy to share with providers</li>
                  <li>• Searchable and filterable</li>
                  <li>• Cloud backup protection</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Foster Care Best Practices */}
        <section id="foster-care" className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-6">🤝 Foster Care Documentation Best Practices</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-primary-dark mb-6">
              Foster caregivers play a crucial role in pet rehabilitation and adoption. Learn how to document 
              your foster pet's journey to help them find their forever home. Share pet's profile on social media 
              or through links to interested adopters.
            </p>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">📝 Essential Foster Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-brand-primary mb-3">Behavioral Progress</h4>
                  <ul className="text-brand-primary-dark space-y-1 text-sm">
                    <li>• Socialization improvements</li>
                    <li>• Training milestones</li>
                    <li>• Interaction with other pets</li>
                    <li>• Response to humans</li>
                    <li>• Anxiety or fear reductions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-brand-primary mb-3">Health & Care Notes</h4>
                  <ul className="text-brand-primary-dark space-y-1 text-sm">
                    <li>• Medical treatments given</li>
                    <li>• Weight gain/loss tracking</li>
                    <li>• Dietary preferences and restrictions</li>
                    <li>• Exercise routines</li>
                    <li>• Behavioral quirks and preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">🔄 Seamless Adoption Transfer</h3>
              <p className="text-brand-primary-dark mb-4">
                When it's time for adoption, PetPort makes the handoff seamless. Transfer the complete 
                digital profile to the new family with one click, including:
              </p>
              <ul className="text-brand-primary-dark space-y-2">
                <li>• Complete health history and records</li>
                <li>• Behavioral notes and training progress</li>
                <li>• Photo gallery showing transformation</li>
                <li>• Care instructions and routines</li>
                <li>• Favorite activities and preferences</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Secure Sharing */}
        <section id="sharing-securely" className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-6">🔒 Secure Information Sharing</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-primary-dark mb-6">
              Privacy and security are paramount when sharing your pet's information. Learn how to control 
              what you share and with whom.
            </p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">Privacy Control Features</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-primary">Selective Sharing</h4>
                    <p className="text-brand-primary-dark text-sm">Choose exactly what information to share - emergency info only, full profile, or custom selections.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-primary">Time-Limited Access</h4>
                    <p className="text-brand-primary-dark text-sm">Set expiration dates on shared links for temporary access during boarding or sitting.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-primary">Access Tracking</h4>
                    <p className="text-brand-primary-dark text-sm">See who has accessed your pet's information and when.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section id="getting-started" className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-6">🚀 Getting Started with PetPort</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-primary-dark mb-8">
              Ready to create your pet's digital portfolio? Follow these simple steps to get started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="text-center">
                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                  <AspectRatio ratio={4 / 3}>
                    <img 
                      src={createProfileScreenshot} 
                      alt="Step 1: Create your pet's profile with basic information and photos"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </AspectRatio>
                </div>
                <h3 className="text-xl font-semibold text-brand-primary mb-2">Step 1: Create Profile</h3>
                <p className="text-brand-primary-dark">Add your pet's basic info, photos, and personality details in under 5 minutes.</p>
              </div>

              <div className="text-center">
                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                  <AspectRatio ratio={4 / 3}>
                    <img 
                      src={documentUploadScreenshot} 
                      alt="Step 2: Upload important documents like vaccination records and certificates"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </AspectRatio>
                </div>
                <h3 className="text-xl font-semibold text-brand-primary mb-2">Step 2: Upload Documents</h3>
                <p className="text-brand-primary-dark">Snap photos of vaccines, health records, and certifications. We'll organize everything.</p>
              </div>

              <div className="text-center">
                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                  <AspectRatio ratio={4 / 3}>
                    <img 
                      src={resumeDetailsScreenshot} 
                      alt="Step 3: Build your pet's professional resume and request reviews"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </AspectRatio>
                </div>
                <h3 className="text-xl font-semibold text-brand-primary mb-2">Step 3: Build Resume & Request Reviews</h3>
                <p className="text-brand-primary-dark">Add achievements, request reviews from trainers and groomers, and build your pet's professional reputation.</p>
              </div>

              <div className="text-center">
                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                  <AspectRatio ratio={4 / 3}>
                    <img 
                      src={shareInstructionsScreenshot} 
                      alt="Step 4: Share your pet's information securely with caregivers and service providers"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </AspectRatio>
                </div>
                <h3 className="text-xl font-semibold text-brand-primary mb-2">Step 4: Share & Go</h3>
                <p className="text-brand-primary-dark">Share with vets, sitters, hotels, or groomers instantly. Generate PDFs and QR codes on demand.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection context="landing" />

        {/* Call to Action */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-brand-primary">Ready to Get Started?</h2>
          <p className="text-xl text-brand-primary-dark mb-8 max-w-2xl mx-auto">
            Join thousands of pet parents who never worry about lost paperwork, missing documentation, 
            or emergency preparedness again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-3 bg-brand-primary text-white hover:bg-brand-primary-dark">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-brand-primary text-brand-primary hover:bg-brand-primary/5">
                Learn More About PetPort
              </Button>
            </Link>
          </div>
          <p className="text-brand-primary/70 text-sm mt-4">7-day free trial • No charges for 7 days • Cancel anytime</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-brand-primary-dark py-16 border-t border-gray-200 mt-16">
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
            </div>
            
            <div>
              <h4 className="font-semibold text-brand-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Sign Up</Link></li>
                <li><Link to="/#features" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Features</Link></li>
                <li><Link to="/#pricing" className="text-brand-primary-dark hover:text-brand-primary transition-colors">Pricing</Link></li>
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