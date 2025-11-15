import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, Gift, Play, Share2, Calendar, Clock } from 'lucide-react';
import { AzureButton } from '@/components/ui/azure-button';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { PodcastTranscript } from '@/components/PodcastTranscript';
import { PodcastEpisodeCard } from '@/components/PodcastEpisodeCard';
import { podcastEpisodes } from '@/data/podcastEpisodes';
import { MetaTags } from '@/components/MetaTags';
import { PublicNavigationMenu } from '@/components/PublicNavigationMenu';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const PodcastEpisode = () => {
  const { episodeSlug } = useParams<{ episodeSlug: string }>();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  const episode = podcastEpisodes.find((ep) => ep.slug === episodeSlug);

  if (!episode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Episode Not Found</h1>
          <AzureButton onClick={() => navigate('/podcast')}>
            Back to Podcast
          </AzureButton>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Signal to Prerender.io that page is ready after meta tags render
    const timer = setTimeout(() => {
      (window as any).prerenderReady = true;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const relatedEpisodes = podcastEpisodes
    .filter((ep) => ep.slug !== episode.slug)
    .slice(0, 3);

  const formattedDate = new Date(episode.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    const shareData = {
      title: episode.title,
      text: episode.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <>
      <MetaTags
        title={episode.title}
        description={episode.description}
        image={episode.ogImage || episode.coverImage}
        url={window.location.href}
      />

      {/* PodcastEpisode Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PodcastEpisode",
          "url": `https://petport.app/podcast/${episode.slug}`,
          "name": episode.title,
          "description": episode.description,
          "datePublished": episode.publishDate,
          "timeRequired": `PT${episode.duration.split(':')[0]}M${episode.duration.split(':')[1]}S`,
          "image": {
            "@type": "ImageObject",
            "url": episode.ogImage || episode.coverImage,
            "width": 1200,
            "height": 630
          },
          "associatedMedia": {
            "@type": "AudioObject",
            "contentUrl": episode.audioUrl,
            "duration": `PT${episode.duration.split(':')[0]}M${episode.duration.split(':')[1]}S`,
            "encodingFormat": "audio/mpeg"
          },
          "partOfSeries": {
            "@type": "PodcastSeries",
            "@id": "https://petport.app/podcast#series",
            "name": "The PetPort Podcast",
            "url": "https://petport.app/podcast"
          },
          "author": {
            "@type": "Organization",
            "name": "Petport.app",
            "url": "https://petport.app"
          },
          "publisher": {
            "@type": "Organization",
            "@id": "https://petport.app/#organization",
            "name": "PetPort"
          },
          "keywords": episode.keywords?.join(', ') || "pet records, digital pet passport, pet care, pet management",
          "inLanguage": "en-US"
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
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": episode.title,
              "item": `https://petport.app/podcast/${episode.slug}`
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
                onClick={() => navigate('/podcast')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">All Episodes</span>
              </AzureButton>
            </div>
          </div>
        </header>

        <PublicNavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate('/')}
                  className="cursor-pointer"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate('/podcast')}
                  className="cursor-pointer"
                >
                  Podcast
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{episode.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Episode Hero */}
        <section className="py-12 px-4 bg-gradient-to-br from-brand-primary/5 to-transparent">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Cover Image with Play Button */}
              <div className="relative flex-shrink-0">
                <img
                  src={episode.coverImage}
                  alt={episode.title}
                  className="w-full md:w-80 rounded-lg shadow-xl"
                />
                {!playerLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AzureButton
                      size="lg"
                      onClick={() => setPlayerLoaded(true)}
                      className="w-20 h-20 rounded-full shadow-2xl"
                    >
                      <Play className="h-10 w-10 text-white ml-1" />
                    </AzureButton>
                  </div>
                )}
              </div>

              {/* Episode Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {episode.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formattedDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {episode.duration}
                  </div>
                </div>

                <p className="text-lg text-foreground mb-6">
                  {episode.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  <AzureButton
                    onClick={() => setPlayerLoaded(true)}
                    disabled={playerLoaded}
                  >
                    <Play className="h-4 w-4" />
                    {playerLoaded ? 'Player Loaded' : 'Load Player'}
                  </AzureButton>
                  
                  <AzureButton
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </AzureButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-4 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <p className="text-xs text-muted-foreground text-center">
              Technical details discussed are for educational purposes and may not reflect current features. Please verify functionality in the PetPort app.
            </p>
          </div>
        </section>

        {/* Audio Player (Lazy Loaded) */}
        {playerLoaded && (
          <section className="py-8 px-4">
            <div className="container mx-auto max-w-4xl">
              <PodcastPlayer
                audioUrl={episode.audioUrl}
                coverImage={episode.coverImage}
                episodeTitle={episode.title}
              />
            </div>
          </section>
        )}

        {/* Hidden SEO Transcript */}
        <div className="hidden-transcript" style={{ display: 'none' }}>
          {episode.transcript}
        </div>

        {/* Visible Pretty Transcript */}
        {episode.displayTranscript && (
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-4xl">
              <PodcastTranscript transcript={episode.displayTranscript} episodeTitle={episode.title} />
            </div>
          </section>
        )}

        {/* Related Episodes */}
        {relatedEpisodes.length > 0 && (
          <section className="py-12 px-4 bg-gradient-to-br from-brand-primary/5 to-transparent">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-8">More Episodes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedEpisodes.map((ep) => (
                  <PodcastEpisodeCard
                    key={ep.slug}
                    slug={ep.slug}
                    title={ep.title}
                    description={ep.description}
                    coverImage={ep.coverImage}
                    duration={ep.duration}
                    publishDate={ep.publishDate}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 px-4 bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-primary/80">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Try the Tools We Talk About
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start organizing your pet's medical records, care instructions, and more with PetPort.
            </p>
            <AzureButton
              size="lg"
              onClick={() => navigate('/subscribe')}
              className="bg-white text-brand-primary hover:bg-white/90 hover:text-brand-primary shadow-xl"
            >
              Start Free Trial
            </AzureButton>
          </div>
        </section>
      </div>
    </>
  );
};

export default PodcastEpisode;
