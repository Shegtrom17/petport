import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MetaTags } from "@/components/MetaTags";
import { AzureButton } from "@/components/ui/azure-button";
import { Button } from "@/components/ui/button";
import { Heart, Link2, MapPin, Sparkles, Menu } from "lucide-react";
import { GuidanceHint } from "@/components/ui/guidance-hint";
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { PodcastBanner } from "@/components/PodcastBanner";

const FosterProgram = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <MetaTags
        title="Foster to Adopter Program | PetPort LiveLinks"
        description="PetPort's Foster-to-Adopter system makes it effortless to transfer a pet's full history, care plan, and story — complete with LiveLinks for updates and a built-in Lost Pet Finder."
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
              Pass the Leash — Not the Paperwork
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

          {/* Right: Hero Video */}
          <div className="relative">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-auto rounded-2xl shadow-2xl"
            >
              <source src="/hero-16.mp4" type="video/mp4" />
            </video>
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
                  <h3 className="text-xl font-semibold mb-2">Built-In Lost Pet Finder + Flyer Generator</h3>
                  <p className="text-muted-foreground">
                    If the unthinkable happens, adopters can instantly generate a shareable lost pet flyer — complete with photos, contact info, and auto-map location links. PetPort's "Find My Pet" system keeps communities connected in real time.
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default FosterProgram;
