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
        title="PetPort Podcast | Expert Pet Care Insights"
        description="Expert pet care insights, foster tips, and digital pet record management in 10-minute episodes. Subscribe to the PetPort Podcast for actionable advice."
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og/resume-og-1mb.png"
        url={window.location.origin + "/podcast"}
      />

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
                src="/lovable-uploads/d4e1e1f9-612c-48bb-8391-e7bce7658e8c.png" 
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
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              PetPort Podcast
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Expert pet care insights delivered in 10-minute episodes. Learn about digital pet management, foster programs, lost pet recovery, and more.
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
