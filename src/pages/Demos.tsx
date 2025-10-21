import { useNavigate } from "react-router-dom";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  FileText, 
  AlertCircle, 
  Heart, 
  ImageIcon, 
  MapPin, 
  Star,
  Shield,
  User,
  ArrowRight
} from "lucide-react";

export default function Demos() {
  const navigate = useNavigate();

  const liveLinks = [
    {
      id: "resume",
      title: "Professional Pet Resume",
      description: "Showcase certifications, training, achievements, and verified reviews. Perfect for groomers, trainers, and pet-friendly hotels.",
      icon: FileText,
      color: "from-[#5691af] to-[#4a7c95]",
      borderColor: "border-[#5691af]/20 hover:border-[#5691af]",
      features: [
        "Professional certifications & credentials",
        "Training history & achievements",
        "Interactive references & verified reviews",
        "Travel experience timeline"
      ],
      demoLink: "/demo/resume",
      hasLiveDemo: true
    },
    {
      id: "missing-pet",
      title: "Missing Pet Emergency Page",
      description: "Instant shareable alert with QR code for flyers. Update in real-time as your search progresses.",
      icon: AlertCircle,
      color: "from-red-600 to-orange-600",
      borderColor: "border-red-200 hover:border-red-500",
      features: [
        "Last seen location & time details",
        "Interactive public sighting board",
        "Shareable QR code for flyers",
        "Photo gallery & distinctive features"
      ],
      demoLink: "/demo/missing-pet",
      hasLiveDemo: true
    },
    {
      id: "care",
      title: "Care & Handling Instructions",
      description: "Complete care guide for sitters, groomers, or emergency caregivers. Include routines, diet, medications, and behavioral notes.",
      icon: Heart,
      color: "from-[#6ba3c1] to-[#5691af]",
      borderColor: "border-[#6ba3c1]/30 hover:border-[#6ba3c1]",
      features: [
        "Interactive live care update board",
        "Daily routines & feeding schedule",
        "Medication & allergy information",
        "Behavioral notes & preferences"
      ],
      demoLink: "/demo/care",
      hasLiveDemo: true
    },
    {
      id: "gallery",
      title: "Photo Gallery",
      description: "Secure your pet's best moments. No more searching for your favorite pet moment. Perfect for social sharing and Lost Pet Identifiers",
      icon: ImageIcon,
      color: "from-[#d4c5b0] to-[#bfb09b]",
      borderColor: "border-[#d4c5b0]/40 hover:border-[#d4c5b0]",
      features: [
        "36 photo upload sleaves",
        "Organized by drag & drop",
        "Social media ready sharing",
        "Caption and title each photo"
      ],
      demoLink: "/demo/gallery",
      hasLiveDemo: true
    },
    {
      id: "travel",
      title: "Travel Map",
      description: "Track your adventures together with interactive pins. Attach photos and notes to each destination.",
      icon: MapPin,
      color: "from-[#7bb3d1] to-[#5a92b0]",
      borderColor: "border-[#7bb3d1]/30 hover:border-[#7bb3d1]",
      features: [
        "Interactive world map",
        "Pin locations with dates",
        "Attach photos & memories",
        "Travel history timeline"
      ],
      demoLink: null,
      hasLiveDemo: false
    },
    {
      id: "reviews",
      title: "Reviews & References",
      description: "Collect and showcase reviews from vets, groomers, trainers, and pet hotels. Build your pet's reputation.",
      icon: Star,
      color: "from-[#c4b5a0] to-[#a89888]",
      borderColor: "border-[#c4b5a0]/40 hover:border-[#c4b5a0]",
      features: [
        "Verified reviews & ratings",
        "Service provider testimonials",
        "Photo proof attachments",
        "Shareable reference page"
      ],
      demoLink: null,
      hasLiveDemo: false
    },
    {
      id: "emergency",
      title: "Emergency Profile",
      description: "Quick-access page with critical medical info, vet contacts, and medications for emergency situations.",
      icon: Shield,
      color: "from-[#9ca3af] to-[#6b7280]",
      borderColor: "border-[#9ca3af]/40 hover:border-[#9ca3af]",
      features: [
        "Critical medical information",
        "Emergency vet contacts",
        "Current medications & allergies",
        "Insurance & microchip details"
      ],
      demoLink: null,
      hasLiveDemo: false
    },
    {
      id: "profile",
      title: "Complete Pet Profile",
      description: "Comprehensive overview with all your pet's information in one place. The hub for all other LiveLinks.",
      icon: User,
      color: "from-[#4a8db8] to-[#3d7599]",
      borderColor: "border-[#4a8db8]/30 hover:border-[#4a8db8]",
      features: [
        "Basic info & characteristics",
        "Medical history overview",
        "Document storage",
        "Links to all LiveLinks"
      ],
      demoLink: null,
      hasLiveDemo: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-cream">
      <MetaTags 
        title="PetPort LiveLinks Demos - See All Features in Action"
        description="Explore interactive demos of all PetPort LiveLinks: Pet Resume, Missing Pet Alerts, Care Instructions, Photo Gallery, Travel Map, Reviews, and more. See how easy it is to give your pet a digital voice."
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/OG%20General.png"
        url={`${window.location.origin}/demos`}
      />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-10 h-10" />
          <span className="text-xl font-semibold text-brand-primary">PetPort</span>
        </div>
        <Button onClick={() => navigate('/')} variant="outline">
          Back to Home
        </Button>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-5 w-5 text-brand-primary" />
            <span className="text-brand-primary font-semibold">Interactive LiveLink Demos</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-brand-primary mb-6">
            Experience PetPort LiveLinks
          </h1>
          <p className="text-xl text-brand-primary-dark max-w-3xl mx-auto leading-relaxed">
            Explore our complete suite of digital tools that give your pet a voice. Each LiveLink is a shareable page that updates in real-time — perfect for emergencies, travel, and everyday care.
          </p>
        </div>

        {/* Live Demos Available Banner */}
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-lg p-6 mb-12 border border-brand-primary/20">
          <div className="flex items-center justify-center gap-3 flex-wrap text-center">
            <Sparkles className="h-6 w-6 text-brand-primary" />
            <p className="text-brand-primary font-semibold text-lg">
              4 Live Demos Available Below • Using Real PetPort Data from Finnegan
            </p>
          </div>
        </div>

        {/* LiveLinks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {liveLinks.map((link) => (
            <article 
              key={link.id}
              className={`bg-white rounded-xl shadow-xl overflow-hidden border-2 ${link.borderColor} transition-all hover:shadow-2xl`}
            >
              <div className={`bg-gradient-to-r ${link.color} p-6 text-white`}>
                <div className="flex items-center gap-3 mb-3">
                  <link.icon className="h-8 w-8" />
                  {link.hasLiveDemo && (
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                      LIVE DEMO
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">{link.title}</h2>
                <p className="text-white/90">{link.description}</p>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-brand-primary mb-3">Key Features:</h3>
                <ul className="space-y-2 mb-6 text-brand-primary-dark">
                  {link.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-brand-primary flex-shrink-0">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {link.hasLiveDemo ? (
                  <Button 
                    onClick={() => navigate(link.demoLink!)}
                    className={`w-full bg-gradient-to-r ${link.color} text-white hover:opacity-90`}
                    size="lg"
                  >
                    View Live Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Available with your PetPort account
                    </p>
                    <Button 
                      onClick={() => navigate('/#pricing')}
                      variant="outline"
                      size="sm"
                      className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                    >
                      Start Free Trial
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* How It Works Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-brand-primary text-center mb-8">
            How PetPort LiveLinks Work
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-primary">1</span>
              </div>
              <h3 className="font-semibold text-brand-primary mb-2">Create Your Profile</h3>
              <p className="text-brand-primary-dark text-sm">
                Add your pet's information once — photos, medical records, certifications, and care instructions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-primary">2</span>
              </div>
              <h3 className="font-semibold text-brand-primary mb-2">Share Your Links</h3>
              <p className="text-brand-primary-dark text-sm">
                Get custom URLs for each LiveLink. Share via text, email, QR code, or social media
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-primary">3</span>
              </div>
              <h3 className="font-semibold text-brand-primary mb-2">Update Anytime</h3>
              <p className="text-brand-primary-dark text-sm">
                Changes sync instantly. Everyone with your link sees the latest information in real-time
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create LiveLinks for Your Pet?
          </h2>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of pet owners who trust PetPort to keep their pets safe, organized, and connected
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button 
              onClick={() => navigate('/#pricing')}
              size="lg"
              className="bg-white text-brand-primary hover:bg-brand-cream text-lg px-8 py-6"
            >
              Start Your 7-Day Free Trial
            </Button>
            <p className="text-white/80 text-sm">
              No charges for 7 days • Cancel anytime
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm pb-8">
          <div className="border-t border-gray-200 mb-6 max-w-md mx-auto" />
          <p>
            Powered by{" "}
            <a 
              href={window.location.origin}
              className="text-brand-primary hover:underline font-medium"
            >
              PetPort.app
            </a>
            {" "}— Be ready for travel, sitters, lost pet, and emergencies
          </p>
        </div>
      </main>
    </div>
  );
}
