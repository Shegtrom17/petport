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
import { Loader2, Gift as GiftIcon, Check, X, Heart, Shield, Image, Users, MapPin, FileText, Calendar as CalendarIcon, Home, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { MetaTags } from "@/components/MetaTags";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Gift = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: "",
    senderName: "",
    giftMessage: ""
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

    setIsLoading(true);

    try {
      const requestBody: any = {
        recipientEmail: formData.recipientEmail,
        senderName: formData.senderName || undefined,
        giftMessage: formData.giftMessage || undefined,
        purchaserEmail: session?.user?.email || undefined,
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
    }
  ];

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
          "text": "Pet supplies are consumable—they get used up. PetPort is a lasting gift that protects, organizes, and celebrates their pet for an entire year. It's the difference between giving them a toy that breaks in a month versus giving them peace of mind, safety tools, and a way to preserve their pet's legacy forever."
        }
      },
      {
        "@type": "Question",
        "name": "Can I schedule when the gift email is sent?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently, the gift email is sent immediately after your purchase is complete (usually within minutes). If you'd like to give the gift on a specific date, we recommend purchasing on that day, or forwarding the activation email at your preferred time."
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
    "offers": {
      "@type": "Offer",
      "url": "https://petport.app/gift",
      "priceCurrency": "USD",
      "price": "14.99",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31"
    }
  };

  return (
    <>
      <MetaTags 
        title="Gift PetPort - Give a Pet a Voice for Life"
        description="Thoughtful gift for pet parents. 12 months of pet safety, medical records, lost pet tools, and memory preservation. Perfect for new pets, birthdays, or any occasion."
        url="https://petport.app/gift"
        type="product"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 z-10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-2">
              <GiftIcon className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">Give a Pet a Voice for Life</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              You're not just gifting a subscription—you're giving both a pet AND their caregiver the tools to speak up, stay safe, and be remembered.
            </p>
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
                    Whether they just adopted a kitten, have a senior dog, or care for multiple pets—this adapts to their needs.
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
                Everything they need to protect, organize, and celebrate their pet for a full year.
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
                    <span className="text-sm">Pet Screening Resume for housing applications</span>
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
                  Pet supplies are consumable—they get used up. PetPort is a lasting gift that protects, organizes, and celebrates their pet for an entire year. It's the difference between giving them a toy that breaks in a month versus giving them peace of mind, safety tools, and a way to preserve their pet's legacy forever.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Can I schedule when the gift email is sent?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! You can now schedule your gift to be delivered on any future date. Simply select a delivery date when purchasing. Payment is processed immediately, but the recipient will receive their gift email on your chosen date. Perfect for birthdays, holidays, or any special occasion!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </>
  );
};

export default Gift;
