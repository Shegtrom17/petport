import React, { useState } from 'react';
import { Headphones, ArrowLeft, Gift, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AzureButton } from '@/components/ui/azure-button';
import { Button } from '@/components/ui/button';
import { PodcastEpisodeCard } from '@/components/PodcastEpisodeCard';
import { podcastEpisodes } from '@/data/podcastEpisodes';
import { MetaTags } from '@/components/MetaTags';
import { PublicNavigationMenu } from '@/components/PublicNavigationMenu';

const Podcast = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const latestEpisode = podcastEpisodes[0];

  return (
    <>
      <MetaTags
        title="PetPort Podcast | Give Your Pet a Digital Voice for Life"
        description="Learn how to create a complete digital voice for your furry companion. Discover expert strategies for pet health records, lost pet recovery, pet housing applications, document and vaccinations storage, pet foster to adopter programs, and care instructions. Petport has LiveLink Resume builder and Photo Galleries —learn how Petport platform can give your furry companion a digital voice for life! Join thousands of pet parents mastering modern portfolios with PetPort."
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og/resume-og-1mb.png"
        url={window.location.origin + "/podcast"}
      />

      {/* PodcastSeries Schema.org for Google SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PodcastSeries",
          "name": "Dog Gone Good Podcast by PetPort",
          "description": "Learn how to create a complete digital voice for your furry companion. Discover expert strategies for pet health records, lost pet recovery, pet housing applications, document and vaccinations storage, pet foster to adopter programs, and care instructions. Petport has LiveLink Resume builder and Photo Galleries —learn how Petport platform can give your furry companion a digital voice for life! Join thousands of pet parents mastering modern portfolios with PetPort.",
          "url": "https://petport.app/podcast",
          "image": "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og/resume-og-1mb.png",
          "publisher": {
            "@type": "Organization",
            "name": "PetPort",
            "logo": {
              "@type": "ImageObject",
              "url": "https://petport.app/lovable-uploads/petport-logo-new.png"
            }
          },
          "webFeed": "https://petport.app/podcast-feed.xml",
          "episode": podcastEpisodes.map(ep => ({
            "@type": "PodcastEpisode",
            "url": `https://petport.app/podcast/${ep.slug}`,
            "name": ep.title,
            "datePublished": ep.publishDate
          }))
        })}
      </script>

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
              "name": "Podcast",
              "item": "https://petport.app/podcast"
            }
          ]
        })}
      </script>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>

            <div className="absolute left-1/2 -translate-x-1/2">
              <img 
                src="/lovable-uploads/petport-logo-new.png" 
                alt="PetPort" 
                className="h-8"
              />
            </div>

            <div className="flex items-center gap-2">
              <AzureButton
                size="sm"
                onClick={() => navigate('/gift')}
                className="hidden sm:flex"
              >
                <Gift className="h-4 w-4" />
                Gift
              </AzureButton>
              <AzureButton
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </AzureButton>
            </div>
          </div>
        </header>

        <PublicNavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-primary/80">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Headphones className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              PetPort Podcast: Give Your Pet a Digital Voice for Life
            </h1>
            
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Learn how to create a complete digital voice for your furry companion. Discover expert strategies for pet health records, lost pet recovery, pet housing applications, document and vaccinations storage, pet foster to adopter programs, and care instructions. Petport has LiveLink Resume builder and Photo Galleries —learn how Petport platform can give your furry companion a digital voice for life! Join thousands of pet parents mastering modern portfolios with PetPort.
            </p>

            <Button
              size="lg"
              onClick={() => navigate(`/podcast/${latestEpisode.slug}`)}
              className="bg-white text-[#5691af] hover:bg-white/90 hover:text-[#5691af] shadow-xl [&_svg]:text-[#5691af]"
            >
              <Headphones className="h-5 w-5" />
              Listen to Latest Episode
            </Button>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-4 px-4">
          <div className="container mx-auto max-w-6xl">
            <p className="text-xs text-muted-foreground text-center">
              Information shared in this podcast is for educational purposes. Features may change over time. For current details, please visit the PetPort app.
            </p>
          </div>
        </section>

        {/* Episodes Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground mb-8">All Episodes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcastEpisodes.map((episode) => (
                <PodcastEpisodeCard
                  key={episode.slug}
                  slug={episode.slug}
                  title={episode.title}
                  description={episode.description}
                  coverImage={episode.coverImage}
                  duration={episode.duration}
                  publishDate={episode.publishDate}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-primary/80">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Organize Your Pet's Life?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your free PetPort profile today and experience the tools we discuss in every episode.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/subscribe')}
              className="bg-white text-[#5691af] hover:bg-white/90 hover:text-[#5691af] shadow-xl"
            >
              Start Free Trial
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Podcast;
