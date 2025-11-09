import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowRight, Eye, Heart, Menu, Home, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FreeLostPetFlyerGenerator } from "@/components/FreeLostPetFlyerGenerator";
import { MetaTags } from "@/components/MetaTags";
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { PodcastBanner } from "@/components/PodcastBanner";
import { PodcastEpisodeCard } from "@/components/PodcastEpisodeCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
              "name": "Lost Pet Features",
              "item": "https://petport.app/lost-pet-features"
            }
          ]
        })}
      </script>
      
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
              "name": "Is the Free Lost Pet Flyer really free to use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! print-ready Lost Pet Flyer is completely free with no sign-up or payment required. We want every lost pet to be found. The in app, PetPort Lost Pet Generator with LiveLinks, Alert System, QR codes, real-time updates, and sighting boards requires a PetPort subscription to activate."
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
            },
            {
              "@type": "Question",
              "name": "What should I include on my lost pet flyer to maximize chances of recovery?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Essential elements include: clear, recent photos showing distinctive markings, your pet's name (helps them respond if called), what will make pet most comfortable to come to stranger, last seen location and date/time, your contact phone number, and any medical conditions or special needs. PetPort's flyer generator guides you through all these elements and auto-generates a professional layout."
              }
            },
            {
              "@type": "Question",
              "name": "How quickly should I start distributing flyers after my pet goes missing?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Time is critical! Start distributing flyers within the first 24 hours if possible. Lost pets typically stay within a 1-mile radius initially, so saturate your immediate area first. Post flyers at vet clinics, pet stores, shelters, parks, and high-traffic intersections. With PetPort's one-tap sharing, you can instantly distribute your pet's information digitally to social media, email, and SMS while you're printing physical flyers and anyone with the LiveLink or QR code can Print Flyers Also, this gets help fast!!!"
              }
            },
            {
              "@type": "Question",
              "name": "How can I share my lost pet information on social media?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "With PetPort's one-tap sharing, you can instantly distribute your pet's LiveLink to Facebook, Twitter, Instagram, and community groups. The LiveLink includes your pet's photo, description, last seen location, and a direct contact button. Anyone who sees the post can share it further, creating a viral search network."
              }
            },
            {
              "@type": "Question",
              "name": "Can community members share my lost pet flyer without creating an account?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Anyone with your pet's LiveLink or QR code can view the full lost pet flyer and share it to their own social networks without signing up. They can also print additional flyers directly from the link, making it easy for friends, neighbors, and community members to help spread the word."
              }
            },
            {
              "@type": "Question",
              "name": "What's the best way to share on local community groups?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Share your pet's LiveLink to local Facebook groups, Nextdoor, and neighborhood apps within the first 24 hours. Include a brief message with your pet's name, species, and last seen location. The LiveLink automatically updates if your pet is found, so shared posts stay current without needing to edit multiple group posts."
              }
            }
          ]
        })}
      </script>
      
      {/* SoftwareApplication Schema for Free Tool */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Free Lost Pet Flyer Generator",
          "applicationCategory": "UtilityApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": "Free online tool to create professional lost pet flyers in seconds. No signup required. Generate printable PDF flyers with pet photos, contact information, and last seen details instantly.",
          "url": "https://petport.app/lost-pet-features#free-generator",
          "screenshot": "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og-lostpet.png",
          "featureList": [
            "Create professional lost pet flyers instantly",
            "No signup or payment required",
            "Printable PDF format",
            "Add pet photos and contact details",
            "Include last seen location and time",
            "Free forever"
          ],
          "publisher": {
            "@type": "Organization",
            "name": "PetPort",
            "url": "https://petport.app"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          }
        })}
      </script>

      {/* HowTo Schema for 4-Step Process */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Find a Lost Pet Using PetPort",
          "description": "Step-by-step guide to recovering a lost pet using PetPort's LiveLink alert system, flyer generator, and community sighting board.",
          "image": "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og-lostpet.png",
          "totalTime": "PT5M",
          "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": "0"
          },
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Report Missing",
              "text": "Mark your pet as missing with one tap. Update status anytime from anywhere using the PetPort app.",
              "image": "https://petport.app/lovable-uploads/mark_lost_1000_x_1000_px.png",
              "url": "https://petport.app/lost-pet-features#step-1"
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Generate Flyer",
              "text": "Professional PDF flyer created instantly with photos, details, and QR code. Download and print or share digitally.",
              "image": "https://petport.app/lovable-uploads/flyer-preview.png",
              "url": "https://petport.app/lost-pet-features#step-2"
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Share Everywhere",
              "text": "One-tap sharing to SMS, email, social media, and printable posters. Spread the word instantly to your entire community.",
              "image": "https://petport.app/lovable-uploads/LiveLink_lost_1000_x_1000_px.png",
              "url": "https://petport.app/lost-pet-features#step-3"
            },
            {
              "@type": "HowToStep",
              "position": 4,
              "name": "Sightings Board",
              "text": "Receive real-time notifications when community members report sightings. Track your pet's location and coordinate search efforts.",
              "image": "https://petport.app/lovable-uploads/Sighting_board_lost_1000_x_1000_px.png",
              "url": "https://petport.app/lost-pet-features#step-4"
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
            <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
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

        {/* Hero Section - Dual Path */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
              Every Minute Counts When They Go Missing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose your path: Get immediate help with our free tool, or protect your pet with the complete PetPort platform
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* LEFT: Emergency Free Tool Path */}
            <Card className="border-2 border-red-500/30 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
              <CardContent className="p-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">🚨 Emergency</span>
                </div>
                
                <h2 className="text-3xl font-bold">Need Help NOW?</h2>
                
                <p className="text-muted-foreground text-lg">
                  Your pet is missing right now and you need a flyer immediately. Use our <strong>free tool</strong> below to create a basic printable flyer in seconds.
                </p>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Create printable PDF instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>No signup required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Free forever</span>
                  </li>
                </ul>

                <Button 
                  size="lg" 
                  onClick={scrollToGenerator}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-lg"
                >
                  Use Free Generator Below ↓
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  This creates a static flyer. For dynamic updates, QR codes, and sighting boards, see the full platform →
                </p>
              </CardContent>
            </Card>

            {/* RIGHT: Full Platform Path */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">✨ Complete Solution</span>
                </div>
                
                <h2 className="text-3xl font-bold">Want Full Protection?</h2>
                
                <p className="text-muted-foreground text-lg">
                  Be prepared BEFORE an emergency. Get LiveLinks with QR codes, real-time sighting boards, instant updates, and complete pet management.
                </p>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>LiveLink QR codes</strong> that update in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Sighting board</strong> with email notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Medical records</strong> & care instructions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>One-tap sharing</strong> to all platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Photo gallery</strong> & complete profile</span>
                  </li>
                </ul>

                <div className="space-y-3">
                  <Button size="lg" asChild variant="azure" className="w-full">
                    <Link to="/demo/missing-pet">
                      <Eye className="mr-2 h-5 w-5" />
                      View Live Demo
                    </Link>
                  </Button>
                  
                  <Button size="lg" asChild variant="outline" className="w-full border-2">
                    <Link to="/">
                      See All Features
                    </Link>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  7-day free trial • No credit card required
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Podcast Episode - Below Hero */}
          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Deep Dive: The Complete Lost Pet Recovery System
            </h2>
            <p className="text-base text-muted-foreground mb-8 text-center">
              Want to understand the full ecosystem? Listen to our podcast episode covering everything from the free flyer generator to the LiveLink system, sighting boards, and community coordination.
            </p>
            
            <div className="max-w-md mx-auto mb-6">
              <PodcastEpisodeCard
                slug={episode2.slug}
                title={episode2.title}
                description={episode2.description}
                coverImage={episode2.coverImage}
                duration={episode2.duration}
                publishDate={episode2.publishDate}
              />
            </div>
          </div>
        </section>

        {/* Free Flyer Generator Section - SECTION 2 */}
        <section id="free-generator" className="container mx-auto px-4 py-16 scroll-mt-20 bg-gradient-to-br from-red-50/30 to-orange-50/30 dark:from-red-950/10 dark:to-orange-950/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 mb-4">
                <span className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">🆓 Free Tool</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Create Your Free Lost Pet Flyer
              </h2>
              <p className="text-lg text-muted-foreground">
                This free tool creates a basic printable flyer — perfect for quick distribution. For the full-featured Lost Pet system with QR codes, LiveLinks, real-time updates and sighting notifications, <Link to="/" className="text-primary hover:underline font-semibold">explore the full PetPort platform</Link>.
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
                Upgrade to PetPort for Real-Time Updates
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                The free generator creates a static PDF. With PetPort, your Lost Pet LiveLink updates instantly with new photos, location changes, and community sightings — no need to reprint or reshare.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild variant="azure">
                  <Link to="/demo/missing-pet">
                    <Eye className="mr-2 h-4 w-4" />
                    See Full Platform Demo
                  </Link>
                </Button>
                <Button size="lg" asChild variant="outline" className="border-2">
                  <Link to="/#pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
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
                  variant="azure"
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

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mb-4">
                <HelpCircle className="h-8 w-8 text-brand-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about finding lost pets and using our tools
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    How does the PetPort LiveLink Alert System help find a lost pet faster?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  The LiveLink system uses a unique QR code tied to a digital profile. When the code is scanned, the finder immediately accesses a secure Lost Pet Flyer and a Sighting Board to report the exact location and time, giving the owner real-time alerts. This creates an instant communication channel between finders and owners, dramatically reducing the time it takes to reunite.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    What happens when a finder scans my pet's LiveLink QR code?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  The finder is directed to a secure, mobile-friendly page containing a full Lost Pet Flyer and instructions on contacting your emergency contacts. They can also instantly post a sighting to your pet's dedicated Sighting Board without logging in. You receive immediate email and SMS notifications with the sighting details, including time, location, and optional photos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    Is the Free Lost Pet Flyer really free to use?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! print-ready Lost Pet Flyer is completely free with no sign-up or payment required. We want every lost pet to be found. The in app, PetPort Lost Pet Generator with LiveLinks, Alert System, QR codes, real-time updates, and sighting boards requires a PetPort subscription to activate.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    Can I update my lost pet information after creating the flyer?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  With PetPort's LiveLink system, yes! Unlike static PDFs, your pet's LiveLink page updates in real-time. If you mark your pet as found or need to change contact info, it updates everywhere instantly without needing to reprint flyers. The QR codes on printed flyers will always point to your current information.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    How do I receive notifications when someone reports a sighting?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PetPort sends instant notifications via email and SMS when someone posts to your pet's Sighting Board. Each report includes the exact location, time, and optional photos from the community member who spotted your pet. You can view all sightings on an interactive map to coordinate your search efforts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    What should I include on my lost pet flyer to maximize chances of recovery?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Essential elements include: clear, recent photos showing distinctive markings, your pet's name (helps them respond if called), what will make pet most comfortable to come to stranger, last seen location and date/time, your contact phone number, and any medical conditions or special needs. PetPort's flyer generator guides you through all these elements and auto-generates a professional layout.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    How quickly should I start distributing flyers after my pet goes missing?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Time is critical! Start distributing flyers within the first 24 hours if possible. Lost pets typically stay within a 1-mile radius initially, so saturate your immediate area first. Post flyers at vet clinics, pet stores, shelters, parks, and high-traffic intersections. With PetPort's one-tap sharing, you can instantly distribute your pet's information digitally to social media, email, and SMS while you're printing physical flyers and anyone with the LiveLink or QR code can Print Flyers Also, this gets help fast!!!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    How can I share my lost pet information on social media?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  With PetPort's one-tap sharing, you can instantly distribute your pet's LiveLink to Facebook, Twitter, Instagram, and community groups. The LiveLink includes your pet's photo, description, last seen location, and a direct contact button. Anyone who sees the post can share it further, creating a viral search network.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    Can community members share my lost pet flyer without creating an account?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! Anyone with your pet's LiveLink or QR code can view the full lost pet flyer and share it to their own social networks without signing up. They can also print additional flyers directly from the link, making it easy for friends, neighbors, and community members to help spread the word.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    What's the best way to share on local community groups?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Share your pet's LiveLink to local Facebook groups, Nextdoor, and neighborhood apps within the first 24 hours. Include a brief message with your pet's name, species, and last seen location. The LiveLink automatically updates if your pet is found, so shared posts stay current without needing to edit multiple group posts.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* CTA after FAQ */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-8 border border-brand-primary/20">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Protect Your Pet Before It's Too Late
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Don't wait for an emergency. Set up your pet's LiveLink now with QR codes, sighting boards, and instant recovery tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate('/#pricing')}
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-opacity"
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/demo/missing-pet')}
                    className="border-brand-primary text-brand-primary hover:bg-brand-primary/5"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Live Demo
                  </Button>
                </div>
              </div>
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
