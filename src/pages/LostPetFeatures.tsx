import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowRight, Eye, Heart, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FreeLostPetFlyerGenerator } from "@/components/FreeLostPetFlyerGenerator";
import { MetaTags } from "@/components/MetaTags";
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { PodcastBanner } from "@/components/PodcastBanner";
import { PodcastEpisodeCard } from "@/components/PodcastEpisodeCard";
import episode2 from "@/data/episodes/episode-2-beyond-lost-pet-flyer";
import lostPetDemoPreview from "@/assets/lost-pet-demo-preview.png";

export default function LostPetFeatures() {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const scrollToGenerator = () => {
    document.getElementById('free-generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <MetaTags 
        title="Lost Pet Flyer Generator & LiveLink Alert System | PetPort"
        description="Free lost pet flyer tool. Create missing pet LiveLinks in 60 seconds with QR codes, sighting board & instant sharing. Help bring your pet home safely."
        type="website"
        url="https://petport.app/lost-pet-features"
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og-lostpet.png"
      />
      
      {/* Schema.org FAQPage Markup for Lost Pet Features */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How does the PetPort LiveLink Alert System help find a lost pet faster?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The LiveLink system uses a unique QR code tied to a digital profile. When the code is scanned, the finder immediately accesses a secure Lost Pet Flyer and a Sighting Board to report the exact location and time, giving the owner real-time alerts."
              }
            },
            {
              "@type": "Question",
              "name": "What happens when a finder scans my pet's LiveLink QR code?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The finder is directed to a secure, mobile-friendly page containing a full Lost Pet Flyer and instructions on contacting the owner's emergency contacts. They can also instantly post a sighting to the pet's dedicated Sighting Board without logging in."
              }
            },
            {
              "@type": "Question",
              "name": "Is the PetPort Lost Pet Flyer Generator free to use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our customizable, high-quality, print-ready Lost Pet Flyer generator is completely free, no sign-up or payment required. The LiveLink Alert System requires a PetPort subscription to activate."
              }
            },
            {
              "@type": "Question",
              "name": "Can I update my lost pet information after creating the flyer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "With PetPort's LiveLink system, yes! Unlike static PDFs, your pet's LiveLink page updates in real-time. If you mark your pet as found or need to change contact info, it updates everywhere instantly without needing to reprint flyers."
              }
            },
            {
              "@type": "Question",
              "name": "How do I receive notifications when someone reports a sighting?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PetPort sends instant notifications via email and SMS when someone posts to your pet's Sighting Board. Each report includes the exact location, time, and optional photos from the community member who spotted your pet."
              }
            }
          ]
        })}
      </script>
      
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-10 h-10" />
              <span className="text-xl font-semibold text-brand-primary">PetPort</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/gift')} variant="outline" className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="hidden sm:inline">Gift PetPort</span>
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        <PublicNavigationMenu 
          isOpen={showMobileMenu} 
          onClose={() => setShowMobileMenu(false)} 
        />

        {/* Podcast Banner */}
        <PodcastBanner />

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Every Minute Counts When They Go Missing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              With PetPort.app you can generate professional lost pet flyers in seconds, share instantly across all platforms, and receive real-time sighting notifications from your community.
            </p>

            {/* Hero Video */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <video 
                key="hero-15"
                autoPlay 
                muted 
                loop 
                playsInline
                preload="metadata"
                className="w-full h-auto rounded-2xl"
                poster=""
              >
                <source src="/hero-15.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="bg-brand-primary hover:bg-brand-primary-dark text-white">
                <Link to="/">
                  Explore Full Platform
                </Link>
              </Button>
              <Button size="lg" onClick={() => navigate('/gift')} variant="outline" className="border-2 flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Give PetPort as a Gift
              </Button>
              <Button size="lg" asChild className="bg-brand-primary hover:bg-brand-primary-dark text-white">
                <Link to="/demo/missing-pet">
                  <Eye className="mr-2 h-5 w-5" />
                  View Live Demo
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How It Works in 4 Simple Steps
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: "Report Missing",
                  description: "Mark your pet as missing with one tap. Update status anytime from anywhere.",
                  image: "/lovable-uploads/mark_lost_1000_x_1000_px.png"
                },
                {
                  step: 2,
                  title: "Generate Flyer",
                  description: "Professional PDF flyer created instantly with photos, details, and QR code.",
                  image: "/lovable-uploads/flyer-preview.png"
                },
                {
                  step: 3,
                  title: "Share Everywhere",
                  description: "One-tap sharing to SMS, email, social media, and printable posters.",
                  image: "/lovable-uploads/LiveLink_lost_1000_x_1000_px.png"
                },
                {
                  step: 4,
                  title: "Sightings Board",
                  description: "Receive real-time notifications when community members report sightings.",
                  image: "/lovable-uploads/Sighting_board_lost_1000_x_1000_px.png"
                }
              ].map((step) => (
                <Card key={step.step} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {step.step}
                    </div>
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Free Flyer Generator Section */}
        <section id="free-generator" className="container mx-auto px-4 py-16 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Gift: A Free Tool to Bring Them Home
              </h2>
              <p className="text-lg text-muted-foreground">
                This free tool creates a basic printable flyer — perfect for quick distribution. For the full-featured Lost Pet PDF Flyer with QR codes, plus dynamic LiveLinks with real-time updates and sighting notifications, explore the full PetPort platform below.
              </p>
            </div>

            <FreeLostPetFlyerGenerator />

            <div className="text-center mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/30 shadow-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full mb-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Static Flyer</span>
                <ArrowRight className="h-3 w-3 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Dynamic LiveLink</span>
              </div>
              
              <p className="text-sm font-semibold mb-2">
                This free tool creates a static PDF — great for printing and sharing.
              </p>
              
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Upgrade to PetPort's Lost Pet LiveLink</strong> for QR codes that link to a live, updateable page with real-time Sightings Board, automatic notifications, social sharing, and more.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="text-white">
                  <Link to="/#pricing">See Full Features & Pricing</Link>
                </Button>
                <Button onClick={() => navigate('/gift')} variant="outline" className="flex items-center gap-2 border-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Give as a Gift
                </Button>
                <Button asChild variant="outline">
                  <Link to="/demo/missing-pet">
                    <Eye className="mr-2 h-4 w-4" />
                    View Live Demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-500/5 rounded-2xl p-8 md:p-12 border-2 border-red-500/20 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full mb-4">
                  <Eye className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">Live Interactive Demo</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">See a Real Lost Pet Alert in Action</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Experience how PetPort's Lost Pet LiveLink works with Finnegan's live demo profile. 
                  See exactly what your emergency alert would look like.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                <div>
                  <img 
                    src={lostPetDemoPreview} 
                    alt="Lost Pet Demo Preview"
                    className="rounded-lg shadow-2xl border-2 border-red-500/30"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">What You'll See in the Demo:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                      <div>
                        <p className="font-semibold">Real-Time Sighting Board</p>
                        <p className="text-sm text-muted-foreground">Community-powered updates and location tracking</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                      <div>
                        <p className="font-semibold">Instant QR Code Sharing</p>
                        <p className="text-sm text-muted-foreground">Print and post anywhere for quick mobile access</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                      <div>
                        <p className="font-semibold">Photo Gallery & Details</p>
                        <p className="text-sm text-muted-foreground">Multiple photos to help identify your pet</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                      <div>
                        <p className="font-semibold">Emergency Contact Access</p>
                        <p className="text-sm text-muted-foreground">One-tap calling and social media sharing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
                  <Link to="/demo/missing-pet" className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    View Full Live Demo
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  No signup required • See it in action right now
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Podcast Episode Section */}
        <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Deep Dive: The Complete Lost Pet Recovery System
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Want to understand the full ecosystem? Listen to our podcast episode covering everything from the free flyer generator to the LiveLink system, sighting boards, and community coordination.
            </p>
            
            <div className="max-w-md mx-auto mb-8">
              <PodcastEpisodeCard
                slug={episode2.slug}
                title={episode2.title}
                description={episode2.description}
                coverImage={episode2.coverImage}
                duration={episode2.duration}
                publishDate={episode2.publishDate}
              />
            </div>

            <div className="bg-card border rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg mb-3">What You'll Learn:</h3>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>How the free Lost Pet Flyer Generator works and when to use it</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>The power of LiveLink QR codes for real-time pet recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>How the community Sightings Board coordinates search efforts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Real-world examples of successful pet recoveries using PetPort</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <Button asChild variant="outline" size="lg">
                  <Link to="/podcast">
                    Browse All Episodes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Free vs. Full PetPort Lost Pet Solution
            </h2>

            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-4 font-semibold">Feature</th>
                        <th className="text-center py-4 px-4 font-semibold">Free Generator</th>
                        <th className="text-center py-4 px-4 font-semibold bg-primary/5">PetPort Lost Pet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Basic Flyer PDF", free: true, premium: true },
                        { feature: "QR Code to Live Page", free: false, premium: true },
                        { feature: "Real-time Sightings Board", free: false, premium: true },
                        { feature: "Email Notifications", free: false, premium: true },
                        { feature: "Update Info Anytime", free: false, premium: true },
                        { feature: "Social Media Sharing", free: false, premium: true },
                        { feature: "Gallery Photos", free: false, premium: true },
                        { feature: "Medical Alerts", free: false, premium: true },
                        { feature: "Contact Prioritization", free: false, premium: true },
                        { feature: "SMS Notifications", free: false, premium: true },
                        { feature: "Custom Reward Amount", free: false, premium: true },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="py-4 px-4">{row.feature}</td>
                          <td className="text-center py-4 px-4">
                            {row.free ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                          <td className="text-center py-4 px-4 bg-primary/5">
                            {row.premium ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Success Story / Testimonial */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Success Story</h3>
                  <blockquote className="text-lg italic text-muted-foreground">
                    "Our dog escaped during a thunderstorm. Within 30 minutes of using PetPort's lost pet feature, we had our first sighting report. The QR code on the flyer made it so easy for neighbors to contact us. We found him safe 2 hours later thanks to the real-time updates."
                  </blockquote>
                  <p className="font-semibold">— Sarah M., California</p>
                  <p className="text-sm text-muted-foreground">Reunited with Max in under 3 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Referral Program Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#5691af]/10 to-[#5691af]/5 rounded-2xl p-8 border-2 border-[#5691af]/20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#5691af] mb-4">
                💰 Help Another Pet Find Their Voice
              </h2>
              <p className="text-lg text-[#5691af]/80 mb-6">
                Share PetPort with fellow pet owners and earn $2 as a thank you when they subscribe
              </p>
              <Link to="/referral-program">
                <Button 
                  size="lg"
                  className="bg-[#5691af] hover:bg-[#4a7d99] text-white"
                >
                  Learn More About Referrals
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Protect Your Pet with Full PetPort
            </h2>
            <p className="text-xl text-muted-foreground">
              Complete digital profile, medical records, care instructions, and advanced lost pet tools - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-white">
                <Link to="/">See All Features</Link>
              </Button>
              <Button size="lg" onClick={() => navigate('/gift')} variant="outline" className="flex items-center gap-2 border-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Give as a Gift
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="container mx-auto px-4 pb-8">
          <div className="text-center text-muted-foreground text-sm">
            <div className="border-t border-border mb-6 max-w-md mx-auto" />
            <p className="mb-3">
              Powered by{" "}
              <button 
                onClick={() => navigate('/')}
                className="text-primary hover:underline font-medium"
              >
                PetPort.app
              </button>
              {" "}— Be ready for travel, sitters, lost pet, and emergencies
            </p>
            <div className="flex gap-3 justify-center text-xs">
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy</Link>
              <span>•</span>
              <Link to="/terms" className="text-muted-foreground hover:text-primary">Terms</Link>
              <span>•</span>
              <Link to="/data-deletion" className="text-muted-foreground hover:text-primary">Data Deletion</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
