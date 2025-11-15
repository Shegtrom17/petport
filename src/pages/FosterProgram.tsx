import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MetaTags } from "@/components/MetaTags";
import { AzureButton } from "@/components/ui/azure-button";
import { Button } from "@/components/ui/button";
import { Heart, Link2, MapPin, Sparkles, Menu, Home } from "lucide-react";
import { GuidanceHint } from "@/components/ui/guidance-hint";
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { PodcastBanner } from "@/components/PodcastBanner";
import { PodcastEpisodeCard } from "@/components/PodcastEpisodeCard";

const FosterProgram = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Signal to Prerender.io that page is ready after meta tags render
    const timer = setTimeout(() => {
      (window as any).prerenderReady = true;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <MetaTags
        title="Pet Foster & Adoption Transfer | Pet Records Management | PetPort"
        description="Seamless pet foster and adoption transfer system. Effortlessly share pet medical records, behavioral profiles, and care plans using LiveLinks. Built-in Lost Pet Finder for safety."
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/OG%20General.png"
        url={window.location.origin + "/foster-program"}
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
              "name": "Foster Program",
              "item": "https://petport.app/foster-program"
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
              "name": "How does the foster-to-adopter pet profile transfer work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PetPort's foster-to-adopter transfer is simple: the foster creates a complete digital profile including medical records, care instructions, personality traits, and photos. When adoption is finalized, the foster transfers full ownership of the profile to the adopter with one click. The adopter receives all history, documents, and LiveLinks instantly - no paperwork, no lost records, and complete continuity of care."
              }
            },
            {
              "@type": "Question",
              "name": "What information should be included in a foster pet's digital profile?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A comprehensive foster pet profile should include vaccination records, medical history, spay/neuter documentation, microchip information, care instructions (feeding, medications, behavioral notes), emergency contacts, personality traits, likes and dislikes, training progress, and photos showing identifying features. PetPort provides structured sections for all of this information, making it easy for fosters to document everything adopters need to know."
              }
            },
            {
              "@type": "Question",
              "name": "Can adopters update the pet profile after receiving it from a foster?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Once the profile is transferred, the adopter becomes the full owner and can update any information including adding new photos, medical records, training achievements, or care instructions. The digital profile grows with the pet throughout their lifetime. Fosters can optionally stay connected to see updates, creating a lifelong bond between foster families and the pets they helped save."
              }
            },
            {
              "@type": "Question",
              "name": "What is a LiveLink and how does it help foster and adopted pets?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A LiveLink is a QR code that connects to your pet's digital profile. If a foster or adopted pet gets lost, anyone who finds them can scan the QR code on their collar tag to instantly access the Lost Pet page with owner contact information, photos, and a sighting board. Unlike static tags, LiveLinks update in real-time - perfect for foster pets who may have temporary contact information that changes when they're adopted."
              }
            },
            {
              "@type": "Question",
              "name": "How do rescue organizations benefit from digital foster profiles?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Rescue organizations benefit tremendously: fosters can create detailed, professional profiles that help pets get adopted faster; all medical records and history stay organized in one place; profile transfers are instant and traceable; adopters receive complete information reducing return rates; and the rescue maintains a connection to alumni pets through optional updates. PetPort also helps rescues showcase their impact and success stories."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a cost for foster families to use PetPort?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Individual foster families can use PetPort with a standard subscription. Many rescue organizations provide PetPort subscriptions to their foster network as part of their foster support program. We also offer special pricing for rescue organizations managing multiple foster pets. Contact us to learn about rescue organization partnerships and foster family programs."
              }
            },
            {
              "@type": "Question",
              "name": "Can I keep a connection with a pet after they're adopted?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! When transferring a foster pet's profile, you can request to stay connected as a 'Guardian' - allowing you to see updates the adopter chooses to share like new photos, milestones, or story updates. This optional feature lets foster families maintain a lifelong bond with the pets they helped rescue, without requiring direct contact information exchange. Adopters control what they share, creating a healthy boundary while honoring the foster relationship."
              }
            }
          ]
        })}
      </script>

      {/* HowTo Schema for Foster-to-Adopter Transfer */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Transfer a Foster Pet's Profile to an Adopter",
          "description": "Complete step-by-step guide for foster families to seamlessly transfer a pet's complete digital profile, medical records, care instructions, and history to adopters using PetPort's foster-to-adopter system.",
          "image": "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/OG%20General.png",
          "totalTime": "PT10M",
          "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": "0"
          },
          "supply": [
            {
              "@type": "HowToSupply",
              "name": "Pet's medical records and vaccination history"
            },
            {
              "@type": "HowToSupply",
              "name": "Behavioral notes and care instructions"
            },
            {
              "@type": "HowToSupply",
              "name": "Pet photos showing identifying features"
            },
            {
              "@type": "HowToSupply",
              "name": "Adopter's email address"
            }
          ],
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Create the Pet's Digital Profile",
              "text": "Build a comprehensive digital profile for your foster pet including photos, medical records, vaccination history, care instructions, personality notes, behavioral observations, feeding schedules, medication requirements, and any special needs. The more complete the profile, the smoother the transition for the adopter and pet.",
              "url": "https://petport.app/foster-program#step-1"
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Share the LiveLink",
              "text": "Generate a secure LiveLink that gives adopters instant access to view the pet's complete profile before adoption is finalized. They can review all information without needing to create an account. The LiveLink updates in real-time, so any changes you make are immediately visible to potential adopters.",
              "url": "https://petport.app/foster-program#step-2"
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Transfer Ownership",
              "text": "When adoption is finalized, initiate the secure ownership transfer with one click. Enter the adopter's email address and the entire profile—including all medical records, photos, care instructions, and history—transfers to their account. The adopter receives full ownership and can update information while you optionally maintain viewing access as a Guardian to stay connected.",
              "url": "https://petport.app/foster-program#step-3"
            }
          ],
          "tool": [
            {
              "@type": "HowToTool",
              "name": "PetPort account (foster subscription)"
            },
            {
              "@type": "HowToTool",
              "name": "Smartphone or computer"
            }
          ]
        })}
      </script>

      {/* Service Schema for Foster-to-Adopter Transfer */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Pet Foster & Adoption Management Service",
          "name": "PetPort Foster-to-Adopter Transfer System",
          "description": "Professional digital pet profile management and transfer service for foster families, rescue organizations, and adopters. Seamlessly transfer complete medical records, care instructions, behavioral notes, and photos from foster to forever home.",
          "provider": {
            "@type": "Organization",
            "name": "PetPort",
            "url": "https://petport.app/"
          },
          "areaServed": {
            "@type": "Country",
            "name": "United States"
          },
          "availableChannel": {
            "@type": "ServiceChannel",
            "serviceUrl": "https://petport.app/foster-program",
            "servicePhone": "",
            "availableLanguage": ["en"]
          },
          "offers": {
            "@type": "Offer",
            "priceSpecification": [
              {
                "@type": "PriceSpecification",
                "price": "14.99",
                "priceCurrency": "USD",
                "billingPeriod": "YEAR",
                "description": "Annual subscription with 7-day free trial"
              },
              {
                "@type": "PriceSpecification",
                "price": "1.99",
                "priceCurrency": "USD",
                "billingPeriod": "MONTH",
                "description": "Monthly subscription with 7-day free trial"
              }
            ],
            "availability": "https://schema.org/InStock",
            "validFrom": "2024-01-01"
          },
          "termsOfService": "https://petport.app/terms",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "87",
            "bestRating": "5",
            "worstRating": "1"
          },
          "serviceOutput": [
            {
              "@type": "Thing",
              "name": "Complete digital pet profile transfer",
              "description": "Full ownership transfer of pet's medical records, photos, care instructions, and history from foster to adopter"
            },
            {
              "@type": "Thing",
              "name": "Real-time LiveLink access",
              "description": "Dynamic links that update instantly when information changes, perfect for foster pets with temporary contact details"
            },
            {
              "@type": "Thing",
              "name": "Guardian connection option",
              "description": "Foster families can maintain viewing access to see updates from adopters, creating lifelong bonds"
            }
          ],
          "audience": {
            "@type": "Audience",
            "audienceType": "Foster families, rescue organizations, pet adopters"
          },
          "keywords": "pet foster transfer, adoption profile transfer, rescue organization tools, foster pet records, digital pet adoption, pet profile handoff, foster to adopter transition, rescue management software"
        })}
      </script>
      
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

      {/* Podcast Banner */}
      <PodcastBanner />

      {/* Mobile Navigation Menu */}
      <PublicNavigationMenu
        isOpen={showMobileMenu} 
        onClose={() => setShowMobileMenu(false)} 
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Copy + CTAs */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Pet Foster & Adoption Transfer: Manage Pet Records Digitally
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground">
              The easiest way for fosters to hand off a pet's full story, care plan, and personality profile to adopters — complete with real-time LiveLinks, a one-tap Lost Pet system, and a lifetime connection that never fades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <AzureButton size="lg" asChild>
                <Link to="/#pricing">Start 7-Day Free Trial</Link>
              </AzureButton>
              <AzureButton size="lg" variant="outline" asChild>
                <Link to="/demos">See LiveLinks</Link>
              </AzureButton>
            </div>
          </div>

          {/* Right: Featured Podcast Episode */}
          <div className="relative">
            <PodcastEpisodeCard
              slug="petport-digital-pet-adoption-foster-transfer"
              title="Digital Pet Adoption & Foster Transfer: Giving Pets a Voice for Life"
              description="Learn how PetPort's LiveLinks make foster-to-adopter transfers seamless with digital medical records, vaccination history, and care instructions that follow your pet."
              coverImage="https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/digital-pet-adoption-foster-transfer-og-1000x1000.jpg"
              duration="10:30"
              publishDate="2025-09-30"
              className="max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            Everything You Need for a Seamless Transition
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Complete Account Transfer</h3>
                  <p className="text-muted-foreground">
                    Hand off the entire pet portfolio — health, habits, history, and heart — in one click. Each adopter receives a cloud-based record they can access anywhere, anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">LiveLinks for Real-Time Updates</h3>
                  <p className="text-muted-foreground">
                    Foster parents can share live care instructions, diet updates, and training notes. Each link stays current, automatically updating for sitters, trainers, and adopters — no re-sending, no confusion.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Built In Lost Pet LiveLink + Generator</h3>
                  <p className="text-muted-foreground">
                    If the unthinkable happens, adopters can instantly generate a shareable lost pet flyer — complete with photos, contact info, and LiveLinks. In app Sighting Board with notifications, Scannable QR codes. PetPort's "Find My Pet" system keeps communities connected in real time.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">A Forever Connection</h3>
                  <p className="text-muted-foreground">
                    Fosters can follow their former pets' life journey through shared Story Streams and updates — because letting go shouldn't mean losing touch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create the Pet's Digital Profile</h3>
                <p className="text-muted-foreground">
                  Add photos, care instructions, personality notes, and vet records.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share the LiveLink</h3>
                <p className="text-muted-foreground">
                  Adopters get instant access, no login or setup needed.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Transfer Ownership</h3>
                <p className="text-muted-foreground">
                  When adoption is complete, the account (and all data) move securely to the adopter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Slot System Info */}
      <section className="container mx-auto px-4 py-8 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <GuidanceHint
            variant="gentle"
            message="💰 Reusable Pet Slots = Maximum Value: Unlike traditional systems, your pet slots never disappear when you transfer a pet. Transfer 100 pets with just 1 slot, or manage 21 fosters simultaneously—your choice! Start with 1 included slot, add more ($3.99/year each) as your rescue grows. Pay once, reuse endlessly."
          />
        </div>
      </section>

      {/* Positioning */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Because every pet deserves to take their story — and their safety — with them.
          </h2>
          <p className="text-lg text-muted-foreground">
            PetPort isn't just a record keeper — it's a living bridge between foster and forever home. From daily routines to emergency flyers, every tool is designed for simplicity, security, and care that travels.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            What Fosters & Adopters Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background p-6 rounded-xl shadow-lg">
              <p className="text-lg mb-4 italic">
                "This made the adoption handoff so easy — every update, every note, already there."
              </p>
              <p className="font-semibold">— Sarah M., Foster Mom</p>
            </div>

            <div className="bg-background p-6 rounded-xl shadow-lg">
              <p className="text-lg mb-4 italic">
                "Our foster stayed part of Cooper's story. We still share updates in his Story Stream!"
              </p>
              <p className="font-semibold">— Tina & Cooper, PetPort users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to Pass the Leash?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AzureButton size="lg" asChild>
              <Link to="/#pricing">Start 7-Day Free Trial</Link>
            </AzureButton>
            <AzureButton size="lg" variant="outline" asChild>
              <Link to="/demos">See LiveLinks</Link>
            </AzureButton>
            <AzureButton size="lg" variant="outline" asChild>
              <Link to="/learn">Learn More</Link>
            </AzureButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FosterProgram;
