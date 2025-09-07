import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { AppShareButton } from "@/components/AppShareButton";
import PricingSection from "@/components/PricingSection";
import { Testimonials } from "@/components/Testimonials";

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
    
    if (user && !isPreview) {
      navigate('/app', { replace: true });
    }
  }, [user, navigate, location.search]);

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
            <Button onClick={() => navigate('/app')}>Open App</Button>
          ) : (
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
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
                  <Button onClick={() => navigate('/app')} variant="outline" size="lg" className="text-lg px-8 py-3 text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10">
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
              {/* PLACEHOLDER: Hero Video/Animation */}
              <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    📱
                  </div>
                  <p className="font-medium">PLACEHOLDER: Hero Video</p>
                  <p className="text-sm mt-2">Demo of app interface or<br />animated pet passport creation</p>
                  <p className="text-xs mt-2 text-gray-400">Recommended: 600x400px MP4/GIF</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators / Social Proof */}
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-brand-primary mb-8">Trusted by pet parents worldwide</p>
            {/* PLACEHOLDER: Logo strip or user count */}
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-xs">Logo 1</div>
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-xs">Logo 2</div>
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-xs">Logo 3</div>
            </div>
          </div>
        </section>

        {/* PWA Benefits Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-primary mb-4">Works Like a Native App</h2>
            <p className="text-xl text-brand-primary-dark max-w-3xl mx-auto">
              Install PetPort on your phone for instant access, offline capabilities, and push notifications when your pet goes missing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              {/* PLACEHOLDER: PWA Installation Demo */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 mb-6 min-h-[200px] flex items-center justify-center border-2 border-dashed border-blue-300">
                <div className="text-center text-blue-600">
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-200 rounded-lg flex items-center justify-center">⚡</div>
                  <p className="text-sm font-medium">PLACEHOLDER: Install Demo</p>
                  <p className="text-xs mt-1">Animation showing "Add to Home Screen"</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">One-Tap Install</h3>
              <p className="text-brand-primary-dark">Add to your home screen like any app store app. No app store required.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 mb-6 min-h-[200px] flex items-center justify-center border-2 border-dashed border-green-300">
                <div className="text-center text-green-600">
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-200 rounded-lg flex items-center justify-center">📱</div>
                  <p className="text-sm font-medium">PLACEHOLDER: Offline Demo</p>
                  <p className="text-xs mt-1">Show app working without internet</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">Works Offline</h3>
              <p className="text-brand-primary-dark">Access your pet's info even without internet. Perfect for emergencies.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 mb-6 min-h-[200px] flex items-center justify-center border-2 border-dashed border-purple-300">
                <div className="text-center text-purple-600">
                  <div className="w-12 h-12 mx-auto mb-2 bg-purple-200 rounded-lg flex items-center justify-center">🔔</div>
                  <p className="text-sm font-medium">PLACEHOLDER: Notification Demo</p>
                  <p className="text-xs mt-1">Show push notification on phone</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">Instant Alerts</h3>
              <p className="text-brand-primary-dark">Get notified immediately when someone finds your missing pet.</p>
            </div>
          </div>
        </section>

        {/* Feature Showcase */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-brand-primary mb-4">Everything Your Pet Needs</h2>
              <p className="text-xl text-brand-primary-dark">Two powerful modes for different needs</p>
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
                      <p className="text-brand-primary-dark text-sm">with photos, last-seen details, and a shareable QR code.</p>
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
                      Easy uploads • Cloud‑secure • Everything in one place — no more lost papers.
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
                  <h3 className="text-2xl font-semibold text-brand-primary">For Foster Caregivers</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">📦</span>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Handoff Kit</strong>
                      <p className="text-brand-primary-dark text-sm">everything an adopter needs in one link and PDF.</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              {/* PLACEHOLDER: Step 1 Screenshot */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 mb-6 min-h-[250px] flex items-center justify-center border-2 border-dashed border-blue-300">
                <div className="text-center text-blue-600">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 rounded-full flex items-center justify-center text-2xl">1</div>
                  <p className="text-sm font-medium">PLACEHOLDER: Setup Screenshot</p>
                  <p className="text-xs mt-1">Show pet profile creation screen</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">1. Create Profile</h3>
              <p className="text-brand-primary-dark">Add your pet's basic info, photos, and personality details in under 5 minutes.</p>
            </div>

            <div className="text-center">
              {/* PLACEHOLDER: Step 2 Screenshot */}
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 mb-6 min-h-[250px] flex items-center justify-center border-2 border-dashed border-green-300">
                <div className="text-center text-green-600">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-200 rounded-full flex items-center justify-center text-2xl">2</div>
                  <p className="text-sm font-medium">PLACEHOLDER: Upload Screenshot</p>
                  <p className="text-xs mt-1">Show document upload interface</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">2. Upload Documents</h3>
              <p className="text-brand-primary-dark">Snap photos of vaccines, health records, and certifications. We'll organize everything.</p>
            </div>

            <div className="text-center">
              {/* PLACEHOLDER: Step 3 Screenshot */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 mb-6 min-h-[250px] flex items-center justify-center border-2 border-dashed border-purple-300">
                <div className="text-center text-purple-600">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-200 rounded-full flex items-center justify-center text-2xl">3</div>
                  <p className="text-sm font-medium">PLACEHOLDER: Share Screenshot</p>
                  <p className="text-xs mt-1">Show sharing options and QR code</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">3. Share & Go</h3>
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