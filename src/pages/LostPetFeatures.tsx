import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { FreeLostPetFlyerGenerator } from "@/components/FreeLostPetFlyerGenerator";
import { MetaTags } from "@/components/MetaTags";

export default function LostPetFeatures() {
  const scrollToGenerator = () => {
    document.getElementById('free-generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <MetaTags 
        title="Lost Pet Solutions - Quick Flyer Generator & Real-Time Alerts | PetPort"
        description="Generate lost pet flyers in seconds. Get real-time sighting notifications, QR codes, and community support. Every minute counts when your pet goes missing."
        type="website"
        url="https://petport.app/lost-pet-features"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Every Minute Counts When They Go Missing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              With PetPort.app you can generate professional lost pet flyers in seconds, share instantly across all platforms, and receive real-time sighting notifications from your community.
            </p>

            {/* Hero Video Placeholder */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-2xl border border-border">
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/hero-14.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center p-6">
                <p className="text-sm text-muted-foreground">One-tap flyer generation in action</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="bg-brand-primary hover:bg-brand-primary-dark text-white">
                <Link to="/">
                  Explore Full Platform
                </Link>
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
                  image: "/lovable-uploads/report-missing-step.png"
                },
                {
                  step: 2,
                  title: "Generate Flyer",
                  description: "Professional PDF flyer created instantly with photos, details, and QR code.",
                  image: "/lovable-uploads/1af9fe70-ed76-44c5-a1e1-1a058e497a10.png"
                },
                {
                  step: 3,
                  title: "Share Everywhere",
                  description: "One-tap sharing to SMS, email, social media, and printable posters.",
                  image: "/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png"
                },
                {
                  step: 4,
                  title: "Sightings Board",
                  description: "Receive real-time notifications when community members report sightings.",
                  image: "/lovable-uploads/22b5b776-467c-4cee-be36-887346e71205.png"
                }
              ].map((step) => (
                <Card key={step.step} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {step.step}
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
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
                Create a printable lost pet flyer in seconds — It's our way of giving every pet a voice when it matters most.
              </p>
            </div>

            <FreeLostPetFlyerGenerator />

            <div className="text-center mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Upgrade to PetPort</strong> for QR codes, real-time updates, Sightings Board, and automatic notifications
              </p>
              <Button asChild className="text-white">
                <Link to="/#pricing">See Full Features & Pricing</Link>
              </Button>
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
                    src="/lovable-uploads/d4e1e1f9-612c-48bb-8391-e7bce7658e8c.png" 
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
                <Link to="/auth">Start 7-Day Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
