import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PodcastEpisodeCard } from "@/components/PodcastEpisodeCard";
import { Camera, AlertCircle, Link as LinkIcon, FileText, Heart, MapPin, Star } from "lucide-react";
import { podcastEpisodes } from "@/data/podcastEpisodes";

interface GiftClaimInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: Camera,
    title: "Photo Gallery",
    description: "Store up to 36 photos of your pet",
  },
  {
    icon: AlertCircle,
    title: "Lost Pet Flyer Generator",
    description: "Create instant missing pet flyers with LiveLinks",
  },
  {
    icon: LinkIcon,
    title: "LiveLinks for Caregivers",
    description: "Share real-time access with vets, groomers, and sitters",
  },
  {
    icon: FileText,
    title: "Pet Resume Builder",
    description: "Professional profiles for adoptions and screenings",
  },
  {
    icon: Heart,
    title: "Medical Records Storage",
    description: "Secure storage for vaccinations and health records",
  },
  {
    icon: MapPin,
    title: "Travel Map & Care Instructions",
    description: "Document travels and share detailed care instructions",
  },
];

const testimonials = [
  {
    name: "Taylor Cummings",
    role: "Traveling Pet Parent",
    rating: 5,
    quote: "This app is a game changer. I can update care instructions from anywhere and share them instantly—no stress, no hassle, just total peace of mind.",
  },
  {
    name: "Micah S.",
    role: "Vet",
    location: "Sugar Creek, MO",
    rating: 5,
    quote: "Last week a family came in with a very sick cat. With one tap, I had his full history and vaccines on-screen. In an emergency, that instant access makes all the difference.",
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex justify-center mb-3">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`text-base ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export function GiftClaimInfoModal({ isOpen, onClose }: GiftClaimInfoModalProps) {
  // Get featured episodes (Episode 0 and 2)
  const featuredEpisodes = [
    podcastEpisodes.find(ep => ep.slug === "petport-digital-pet-profile-platform"),
    podcastEpisodes.find(ep => ep.slug === "beyond-lost-pet-flyer"),
  ].filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-[#5691af]">
            Your PetPort Premium Gift Includes:
          </DialogTitle>
          <p className="text-center text-lg font-semibold text-green-600 mt-2">
            $14.99/year value - Yours FREE!
          </p>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Features Grid */}
          <section>
            <h3 className="text-xl font-bold text-[#5691af] mb-4 text-center">
              Premium Features You'll Get
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-[#5691af]/20"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="h-5 w-5 text-[#5691af]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Featured Podcast Episodes */}
          <section>
            <h3 className="text-xl font-bold text-[#5691af] mb-4 text-center">
              Learn More About PetPort
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Listen to our podcast episodes to understand how PetPort can help you and your pet
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredEpisodes.map((episode) => {
                if (!episode) return null;
                return (
                  <a
                    key={episode.slug}
                    href={`/podcast/${episode.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <PodcastEpisodeCard
                      slug={episode.slug}
                      title={episode.title}
                      description={episode.description}
                      coverImage={episode.coverImage}
                      duration={episode.duration}
                      publishDate={episode.publishDate}
                      className="h-full"
                    />
                  </a>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Episodes open in a new tab - this page will stay open
            </p>
          </section>

          {/* Testimonials */}
          <section>
            <h3 className="text-xl font-bold text-[#5691af] mb-4 text-center">
              What Pet Parents Are Saying
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white shadow-md">
                  <CardContent className="p-5 text-center">
                    <StarRating rating={testimonial.rating} />
                    <blockquote className="text-sm text-gray-700 mb-4 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="text-[#5691af] font-semibold text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {testimonial.role}
                      {testimonial.location && `, ${testimonial.location}`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="azure"
              size="lg"
              className="w-full text-lg font-semibold"
            >
              Ready to Claim Your Gift →
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Complete the signup form to activate your premium membership
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
