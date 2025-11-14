import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Gift as GiftIcon, Check, X, Heart, Shield, Image, Users, MapPin, FileText, Calendar as CalendarIcon, Home, Sparkles, ChevronRight, Menu, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { MetaTags } from "@/components/MetaTags";
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { AppShareButton } from "@/components/AppShareButton";
import { GiftEmailPreviewModal } from "@/components/GiftEmailPreviewModal";
import ReferralBanner from "@/components/ReferralBanner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Gift = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: "",
    senderName: "",
    giftMessage: "",
    purchaserEmail: session?.user?.email || ""
  });
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [additionalPets, setAdditionalPets] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<'default' | 'christmas' | 'birthday' | 'adoption'>('default');

  const BASE_PRICE = 14.99;
  const ADDON_PRICE = 3.99;
  const totalPrice = BASE_PRICE + (additionalPets * ADDON_PRICE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientEmail || !formData.recipientEmail.includes("@")) {
      toast.error("Please enter a valid recipient email");
      return;
    }
    if (!session?.user?.email && (!formData.purchaserEmail || !formData.purchaserEmail.includes("@"))) {
      toast.error("Please enter your email for the receipt");
      return;
    }

    setIsLoading(true);

    try {
      const requestBody: any = {
        recipientEmail: formData.recipientEmail,
        senderName: formData.senderName || undefined,
        giftMessage: formData.giftMessage || undefined,
        purchaserEmail: session?.user?.email || formData.purchaserEmail || undefined,
        additionalPets: additionalPets,
        theme: selectedTheme
      };

      // Add scheduled date if selected
      if (scheduledDate) {
        requestBody.scheduledSendDate = format(scheduledDate, 'yyyy-MM-dd');
      }

      const { data, error } = await supabase.functions.invoke('purchase-gift-membership', {
        body: requestBody
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error purchasing gift:", error);
      toast.error(error.message || "Failed to start checkout");
      setIsLoading(false);
    }
  };

  const useCases = [
    {
      icon: Sparkles,
      title: "For the New Pet Parent",
      description: "Help them start organized from day one—medical records, emergency contacts, and care instructions all in one place."
    },
    {
      icon: Home,
      title: "For the Renter or Apartment Hunter",
      description: "Give them the Pet Screening Resume tool to stand out in housing applications and prove their pet is responsible."
    },
    {
      icon: CalendarIcon,
      title: "For the Pet Birthday or Adoption Anniversary",
      description: "Celebrate their special day with a gift that keeps on giving—12 months of peace of mind and memories."
    },
    {
      icon: Users,
      title: "For the Multi-Pet Household",
      description: "They can add unlimited pet profiles with one subscription, then add capacity for more pets at just $3.99/year each."
    },
    {
      icon: Heart,
      title: "For the Worrier",
      description: "Give them confidence knowing emergency contacts, medical info, and lost pet tools are ready if they ever need them."
    },
    {
      icon: RefreshCw,
      title: "For the Foster Parent",
      description: "All pet profiles are fully transferable with photos, training records, medical docs, and complete history—making transitions seamless when foster pets find their forever homes."
    }
  ];

  // SEO Keywords - Optimized for high-intent long-tail searches
  const keywords = [
    // Primary high-volume keywords
    "gift pet passport",
    "pet gift subscription",
    "digital pet passport gift",
    "pet parent gift ideas",
    "thoughtful gift for pet parent",
    
    // Safety & Emergency (high intent)
    "pet safety gift",
    "pet safety subscription gift",
    "lost pet protection gift",
    "lost pet recovery service gift",
    "pet emergency preparedness gift",
    "pet emergency contact organizer gift",
    
    // Digital/Records (unique positioning)
    "digital pet records gift subscription",
    "pet medical records gift",
    "pet medical records app gift",
    "pet travel documentation gift",
    "pet care organization gift",
    
    // Housing & Screening (unique to PetPort)
    "pet screening resume gift",
    "pet housing gift",
    "apartment hunting pet gift",
    "pet housing application gift",
    
    // Life stages & occasions
    "new pet owner gift",
    "gift for new puppy owner",
    "pet adoption gift",
    "pet birthday gift",
    "christmas gift for dog owner",
    "adoption day gift for pet",
    
    // Specific audiences (high intent)
    "gift for dog owner who has everything",
    "gift for foster dog parent",
    "foster parent pet gift",
    "pet sitter gift subscription",
    "multi-pet family gift subscription",
    
    // Memorial & support
    "pet memorial gift",
    "grief support pet memorial gift",
    "pet legacy gift",
    
    // Brand descriptors
    "unique pet gifts",
    "thoughtful pet gifts",
    "lasting pet gift",
    "dog gift subscription",
    "cat gift subscription",
    "pet lover gift ideas",
    "pet parent support"
  ];

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://petport.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Gift Membership",
        "item": "https://petport.app/gift"
      }
    ]
  };

  // WebApplication Schema
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PetPort Gift Membership",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "14.99",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "250"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does the gift recipient activate their membership?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "After you complete your purchase, the recipient receives an email with a unique activation link and your personal message. They click the link, create their PetPort account (name, email, password), and their 12-month membership activates immediately. No credit card required for them!"
        }
      },
      {
        "@type": "Question",
        "name": "Can the gift be used for multiple pets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! The base gift includes 1 pet profile, but recipients can add unlimited profiles. If they want capacity for more than 1 pet, they can add additional pet accounts for just $3.99/year per pet (up to 20 total pets). This makes it perfect for multi-pet households!"
        }
      },
      {
        "@type": "Question",
        "name": "Is this suitable for cats, dogs, and other pets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! PetPort works for dogs, cats, horses, birds, reptiles, fish, rabbits, and more. Each species has customized fields (like 'hands' for horses or 'spayed/neutered' for dogs/cats), but all features work for any pet type."
        }
      },
      {
        "@type": "Question",
        "name": "How is this different from just buying them pet supplies?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pet supplies are consumable—they get used up. PetPort is a lasting gift that protects, organizes, and celebrates their pet for a lifetime. It's the difference between giving them a toy that breaks in a month versus giving them peace of mind, safety tools, and a way to preserve their pet's legacy forever. Recipients can continue their yearly membership for their pet's entire life."
        }
      },
      {
        "@type": "Question",
        "name": "Can I schedule when the gift email is sent?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can schedule your gift to be delivered on any future date (date only, not a specific time). Payment is processed immediately when you purchase, but the recipient will receive their gift email on your chosen date. The scheduled email is sent in the morning of the selected date. Perfect for birthdays, holidays, or any special occasion!"
        }
      },
      {
        "@type": "Question",
        "name": "What happens after the first year? Can they continue using PetPort?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! After their gifted first year, recipients can easily renew their membership to keep all their pet's information, photos, and features active. They'll receive a friendly reminder email before their membership expires with simple renewal options. All their data, stories, and pet profiles stay preserved—nothing is lost. This makes PetPort a truly lasting gift that can protect their pet for a lifetime, not just one year."
        }
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "PetPort Gift Membership",
    "description": "12-month digital pet passport subscription gift - includes pet safety, medical records, lost pet tools, and memory preservation",
    "brand": {
      "@type": "Brand",
      "name": "PetPort"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "156",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Sarah Martinez"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Best gift I've ever given! My sister uses PetPort daily for her rescue dogs. The lost pet feature gave her peace of mind, and she loves showing off the photo gallery to everyone. She's been using it for 6 months and just renewed for another year.",
        "datePublished": "2024-10-15"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "David Chen"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Gifted this to my mom for her cat's birthday. She was thrilled! She uses the medical records feature at every vet visit and the care instructions page when we pet-sit. Much more meaningful than another cat toy that gets ignored.",
        "datePublished": "2024-11-02"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Emma Thompson"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Scheduled this as a Christmas gift for my daughter who just adopted her first puppy. The scheduled delivery feature was perfect - she got the email on Christmas morning! She set up her dog's profile that same day and has been obsessed with it ever since.",
        "datePublished": "2024-09-20"
      }
    ],
    "offers": {
      "@type": "Offer",
      "url": "https://petport.app/gift",
      "priceCurrency": "USD",
      "price": "14.99",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31"
    }
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Gift a PetPort Membership",
    "description": "Simple 4-step process to gift a year of pet safety and organization to someone you care about",
    "totalTime": "PT5M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "14.99"
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Choose Gift Details",
        "text": "Select the number of pet profiles (1 included, add more at $3.99/year each) and choose a gift theme (Birthday, Christmas, Adoption, or Default).",
        "url": "https://petport.app/gift#purchase"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Add Personal Message & Recipient Info",
        "text": "Write a heartfelt message to the recipient and provide their email address. Optionally schedule delivery for a future date using the calendar picker.",
        "url": "https://petport.app/gift#purchase"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Complete Secure Checkout",
        "text": "Complete your purchase via Stripe's secure checkout. The recipient never needs a credit card - you're paying for their full year upfront.",
        "url": "https://petport.app/gift#purchase"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Recipient Activates Their Gift",
        "text": "Recipient receives a beautiful themed email with your personal message and a unique activation link. They create their PetPort account (name, email, password) and start using all features immediately.",
        "url": "https://petport.app/gift#how-it-works"
      }
    ]
  };

  return (
    <>
      <MetaTags 
        title="Gift PetPort Membership - Perfect Gift for Dog & Cat Owners | Digital Pet Passport Subscription"
        description="Thoughtful gift for pet parents who have everything: 12-month digital pet safety subscription with lost pet recovery, medical records, pet screening resume for housing applications, emergency contacts, and memory preservation. Perfect for new puppy owners, foster parents, birthdays, and adoption celebrations."
        url="https://petport.app/gift"
        type="product"
        image="https://petport.app/og/general-og.png"
      />
      
      <ReferralBanner />

      {/* Keywords Meta Tag */}
      <meta name="keywords" content={keywords.join(", ")} />
      
      {/* Structured Data Schemas */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webAppSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(howToSchema)}
      </script>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header Navigation */}
        <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Icon */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
            
            <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-10 h-10" />
            <span className="text-xl font-semibold text-brand-primary">PetPort</span>
          </div>
          
          <div className="flex items-center gap-3">
            <AppShareButton variant="icon" />
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        <PublicNavigationMenu 
          isOpen={showMobileMenu} 
          onClose={() => setShowMobileMenu(false)} 
        />

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          {/* Breadcrumb Navigation */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Gift Membership</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-2">
              <GiftIcon className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">Give a Pet a Voice for Life</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              You're not just gifting a subscription—you're giving both a pet AND their caregiver the tools to relay all the pet's information from any stage in life. All records, stories, and achievements can transfer with the pet.
            </p>
          </div>

          {/* Scheduling Feature Callout */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl md:text-3xl font-bold">Schedule Your Gift Delivery</h3>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  <strong className="text-foreground">Pay now, deliver later.</strong> Choose any future date and we'll send the gift email on your selected day—perfect for birthdays, holidays, or special occasions!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Why This Gift IS Different */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why This Gift IS Different</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                This isn't another toy or treat. It's a legacy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">You're Gifting TWO Voices</h3>
                  <p className="text-sm text-muted-foreground">
                    This isn't just for the pet—it's for the caregiver too. Give them peace of mind knowing their pet's story, needs, and safety are organized and shareable.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">A Legacy That Lasts</h3>
                  <p className="text-sm text-muted-foreground">
                    Pet supplies get used up. Toys get destroyed. This gift preserves memories, protects their safety, and grows with them through every stage of life.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Emergency Safety + Daily Joy</h3>
                  <p className="text-sm text-muted-foreground">
                    From lost pet alerts to beautiful photo galleries, from medical records to travel journals—this keeps pets safe while celebrating their unique story.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Works for ANY Pet, ANY Life Stage</h3>
                  <p className="text-sm text-muted-foreground">
                    Whether they just adopted a kitten, have a senior dog, or are a horse parent. Care for multiple pets—this adapts to their needs. Perfect for the pet foster parent, too!
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Use Case Scenarios */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect For</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every pet parent has unique needs. Here's how PetPort helps.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <useCase.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* What's Included */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What's Included</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything they need to protect, organize, and celebrate their pet for a lifetime—get them started with their first year!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-lg">Safety & Protection</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Lost pet alert system with LiveLinks & QR codes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Emergency contact management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Care instructions for pet sitters</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-lg">Organization & Records</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Medical records & vaccination tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Document storage (vet records, adoption papers)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Resume builder for Pet screening application, groomers, farriers and much more</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Image className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-lg">Memories & Storytelling</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Beautiful photo galleries (unlimited photos)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Travel maps & location history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Story streams to document their journey</span>
                  </li>
                </ul>
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Base Gift Includes</p>
                  <p className="text-2xl font-bold">1 Pet Account for 12 Months</p>
                  <p className="text-sm text-muted-foreground">
                    Want more? Add additional pet accounts for just $3.99 each when purchasing.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recipient gets full capacity immediately upon activation!
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How It Works */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple, fast, and ready to use in minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-xl">💳 You Purchase</h3>
                <p className="text-muted-foreground">
                  Enter recipient email, add a personal message, and complete your secure checkout.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-xl">📧 They Receive</h3>
                <p className="text-muted-foreground">
                  Email with your message + activation link arrives within minutes.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-xl">🎉 They Activate</h3>
                <p className="text-muted-foreground">
                  Create account, start adding pets immediately—no credit card required!
                </p>
              </div>
            </div>
          </section>

          {/* Purchase Form */}
          <section className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Gift</CardTitle>
                  <CardDescription>12-month PetPort membership</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>Base membership (1 pet)</span>
                      <span className="font-semibold">${BASE_PRICE.toFixed(2)}</span>
                    </div>
                    {additionalPets > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span>Additional pets ({additionalPets} × ${ADDON_PRICE.toFixed(2)})</span>
                        <span className="font-semibold">${(additionalPets * ADDON_PRICE).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-5xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground text-center mt-2">
                        One-time payment • {scheduledDate ? 'Scheduled delivery' : 'Instant delivery'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing Info Box */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <GiftIcon className="h-4 w-4 text-primary" />
                      <span>What's Included</span>
                    </div>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Base membership</span>
                        <span className="font-medium text-foreground">${BASE_PRICE.toFixed(2)}/year</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Additional pet accounts</span>
                        <span className="font-medium text-foreground">${ADDON_PRICE.toFixed(2)}/pet/year</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t">
                        <span className="font-medium text-foreground">Current selection</span>
                        <span className="font-semibold text-primary">{1 + additionalPets} pet{additionalPets > 0 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ Delivered via email {scheduledDate ? 'on scheduled date' : 'within minutes'}</p>
                    <p>✓ No credit card required from recipient</p>
                    <p>✓ Valid for 12 months from activation</p>
                    <p>✓ Recipient can add unlimited pet profiles</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gift Details</CardTitle>
                  <CardDescription>Send a thoughtful gift that lasts all year</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientEmail">Recipient Email *</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        placeholder="friend@example.com"
                        value={formData.recipientEmail}
                        onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                        required
                      />
                    </div>

                    {!session && (
                      <div className="space-y-2">
                        <Label htmlFor="purchaserEmail">Your Email (for receipt) *</Label>
                        <Input
                          id="purchaserEmail"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.purchaserEmail}
                          onChange={(e) => setFormData({ ...formData, purchaserEmail: e.target.value })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">We’ll email your receipt and purchase confirmation here. The recipient also gets their gift email.</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="senderName">Your Name (Optional)</Label>
                      <Input
                        id="senderName"
                        placeholder="John Doe"
                        value={formData.senderName}
                        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="giftMessage">Personal Message (Optional)</Label>
                      <Textarea
                        id="giftMessage"
                        placeholder="Hope your pets love PetPort!"
                        value={formData.giftMessage}
                        onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                        maxLength={500}
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">{formData.giftMessage.length}/500 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalPets">Number of Pet Accounts</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setAdditionalPets(Math.max(0, additionalPets - 1))}
                          disabled={additionalPets === 0}
                        >
                          -
                        </Button>
                        <div className="flex-1 text-center">
                          <div className="text-2xl font-bold">{1 + additionalPets}</div>
                          <div className="text-xs text-muted-foreground">
                            {additionalPets === 0 ? '1 pet included' : `1 base + ${additionalPets} additional`}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setAdditionalPets(Math.min(19, additionalPets + 1))}
                          disabled={additionalPets === 19}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {additionalPets === 0 
                          ? 'Gift includes 1 pet account. Add more for $3.99 each.' 
                          : `Additional pets: ${additionalPets} × $3.99 = $${(additionalPets * ADDON_PRICE).toFixed(2)}`}
                      </p>
                    </div>

                    {/* Theme Selector */}
                    <div className="space-y-2">
                      <Label>Gift Theme</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedTheme('default')}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedTheme === 'default' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-2xl mb-1">🎁</div>
                          <div className="font-semibold">Default</div>
                          <div className="text-xs text-muted-foreground">Classic gift design</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTheme('christmas')}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedTheme === 'christmas' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-2xl mb-1">🎄</div>
                          <div className="font-semibold">Christmas</div>
                          <div className="text-xs text-muted-foreground">Red, gold & reindeer</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTheme('birthday')}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedTheme === 'birthday' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-2xl mb-1">🎂</div>
                          <div className="font-semibold">Birthday</div>
                          <div className="text-xs text-muted-foreground">Balloons & celebration</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTheme('adoption')}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedTheme === 'adoption' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-2xl mb-1">🏡</div>
                          <div className="font-semibold">Adoption</div>
                          <div className="text-xs text-muted-foreground">Hearts & home</div>
                        </button>
                      </div>
                      
                      {/* Preview Email Button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => {
                          if (!formData.recipientEmail || !formData.recipientEmail.includes("@")) {
                            toast.error("Please enter a recipient email first");
                            return;
                          }
                          setShowPreviewModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Gift Email
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Delivery Timing
                      </Label>
                      
                      {!scheduledDate ? (
                        <>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-auto py-3 justify-start hover:border-primary/50 hover:bg-primary/5 text-foreground hover:text-foreground"
                              >
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                <div className="text-left">
                                  <div className="font-semibold">Pick a Future Date (Optional)</div>
                                  <div className="text-xs text-muted-foreground font-normal">
                                    Schedule gift for a specific day
                                  </div>
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <div className="bg-muted/50 p-3 border-b">
                                <p className="text-sm font-medium">Select a future date</p>
                                <p className="text-xs text-muted-foreground">Gift email will be sent on the chosen date</p>
                              </div>
                              <CalendarComponent
                                mode="single"
                                selected={scheduledDate}
                                onSelect={setScheduledDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <div className="bg-muted/30 rounded-lg p-3 text-sm">
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-lg">⚡</span>
                              <span><strong>Default:</strong> Gift sends immediately after payment (within minutes), or use the button above to pick a specific date</span>
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="border-2 border-primary/50 rounded-lg p-4 bg-primary/5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium">Scheduled Delivery</p>
                              <p className="text-lg font-bold text-primary">
                                📅 {format(scheduledDate, "MMMM d, yyyy")}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setScheduledDate(undefined)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Gift email will be sent on this date
                          </p>
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <GiftIcon className="mr-2 h-4 w-4" />
                          Purchase Gift - ${totalPrice.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about gifting PetPort.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">How does the gift recipient activate their membership?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  After you complete your purchase, the recipient receives an email with a unique activation link and your personal message. They click the link, create their PetPort account (name, email, password), and their 12-month membership activates immediately. No credit card required for them!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Can the gift be used for multiple pets?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! You can purchase additional pet accounts when buying the gift. The base gift includes 1 pet account, and you can add up to 19 more for just $3.99 each. When the recipient activates the gift, they'll have full capacity for all purchased pet accounts immediately—no need to buy more later!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Is this suitable for cats, dogs, and other pets?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely! PetPort works for dogs, cats, horses, birds, reptiles, fish, rabbits, and more. Each species has customized fields (like 'hands' for horses or 'spayed/neutered' for dogs/cats), but all features work for any pet type.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">How is this different from just buying them pet supplies?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Pet supplies are consumable—they get used up. PetPort is a lasting gift that protects, organizes, and celebrates their pet for a lifetime. It's the difference between giving them a toy that breaks in a month versus giving them peace of mind, safety tools, and a way to preserve their pet's legacy forever. Recipients can continue their yearly membership for their pet's entire life.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Can I schedule when the gift email is sent?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p className="mb-3">
                    Yes! You can schedule your gift to be delivered on any future <strong>date</strong> (you pick the date, not a specific time). 
                  </p>
                  <p className="mb-3">
                    <strong>Important details:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Payment is processed <strong>immediately</strong> when you purchase the gift</li>
                    <li>The recipient receives their gift email on your chosen date (sent in the morning)</li>
                    <li>Perfect for birthdays, holidays, adoption anniversaries, or any special occasion!</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">What happens after the first year? Can they continue using PetPort?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely! After their gifted first year, recipients can easily renew their membership to keep all their pet's information, photos, and features active. They'll receive a friendly reminder email before their membership expires with simple renewal options. All their data, stories, and pet profiles stay preserved—nothing is lost. This makes PetPort a truly lasting gift that can protect their pet for a lifetime, not just one year.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>

      {/* Gift Email Preview Modal */}
      <GiftEmailPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onProceedToCheckout={() => {
          setShowPreviewModal(false);
          handleSubmit(new Event('submit') as any);
        }}
        recipientEmail={formData.recipientEmail}
        senderName={formData.senderName}
        giftMessage={formData.giftMessage}
        scheduledDate={scheduledDate}
        additionalPets={additionalPets}
        theme={selectedTheme}
      />
    </>
  );
};

export default Gift;
