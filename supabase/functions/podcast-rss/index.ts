import { corsHeaders } from '../_shared/cors.ts';

// Episode data structure matching your frontend
interface PodcastEpisode {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  ogImage?: string;
  audioUrl: string;
  duration: string;
  publishDate: string;
  keywords?: string[];
}

// All episodes data (imported from your frontend structure)
const podcastEpisodes: PodcastEpisode[] = [
  {
    slug: "petport-digital-pet-profile-platform",
    title: "The Digital Pet Profile & Information Platform for a Lifetime",
    description: "PetPort is the all-in-one app that gives every pet a voice for life. From LiveLinks and real-time pet care updates to lost-pet flyers, résumé builders, storyboards, and instant photo-to-PDF records, it keeps every detail organized, shareable, and ready when your pet needs you most.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-pet-profile-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-pet-profile-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-pet-profile-platform.mp3",
    duration: "10:11",
    publishDate: "2025-09-07",
    keywords: ["pet profile", "digital pet", "pet care platform", "pet records"]
  },
  {
    slug: "beyond-lost-pet-flyer",
    title: "Beyond the Lost Pet Flyer",
    description: "When a pet goes missing, every second counts. Discover how modern digital tools transform lost pet recovery from paper flyers to real-time community alerts, GPS tracking, and verified sighting boards.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-lost-pet-flyer-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-lost-pet-flyer-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/beyond-lost-pet-flyer.mp3",
    duration: "12:30",
    publishDate: "2025-11-01",
    keywords: ["lost pet", "pet recovery", "pet flyer", "missing pet"]
  },
  {
    slug: "digital-pet-adoption-foster-transfer",
    title: "Digital Pet Adoption & Foster Transfer",
    description: "Streamline the adoption process with complete digital records transfer. Learn how foster families and rescues use digital pet profiles to ensure smooth transitions and better outcomes.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-adoption-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-adoption-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/digital-pet-adoption-foster-transfer.mp3",
    duration: "11:45",
    publishDate: "2025-11-01",
    keywords: ["pet adoption", "foster care", "rescue", "pet transfer"]
  },
  {
    slug: "petport-pet-screening-resume-builder",
    title: "Pet Screening & Resume Builder",
    description: "From adoption applications to apartment hunting, discover why a professional pet resume opens doors and how to create one that showcases your pet's best qualities.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-pet-screening-resume-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-pet-screening-resume-builder-podcast.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/pet-screening-resume-builder.mp3",
    duration: "11:15",
    publishDate: "2025-09-17",
    keywords: ["pet resume", "pet screening", "apartment hunting", "pet housing"]
  },
  {
    slug: "livelinks-digital-pet-care",
    title: "LiveLinks in Action — The Heartbeat of PetPort",
    description: "Real-time updates from caregivers, sitters, and trainers. Learn how LiveLinks create a living record of your pet's daily life and build trust through transparency.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-livelinks-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-livelinks-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/livelinks-digital-pet-care.mp3",
    duration: "10:30",
    publishDate: "2025-10-25",
    keywords: ["livelinks", "pet care", "real-time updates", "pet sitting"]
  },
  {
    slug: "digital-pet-records-document-storage",
    title: "Digital Pet Records & Document Storage",
    description: "Never lose another vaccine card or medical record. Discover how to organize, store, and instantly share your pet's important documents from anywhere.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-records-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-records-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/digital-pet-records-document-storage.mp3",
    duration: "9:45",
    publishDate: "2025-10-20",
    keywords: ["pet records", "document storage", "vaccination records", "medical history"]
  },
  {
    slug: "pet-care-handling-digital-voice",
    title: "Pet Care & Handling: Digital Voice and Wellness",
    description: "Share feeding schedules, medication reminders, behavioral notes, and daily routines. Give caregivers everything they need to provide the best care.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-pet-care-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-pet-care-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/pet-care-handling-digital-voice.mp3",
    duration: "10:50",
    publishDate: "2025-11-01",
    keywords: ["pet care", "care instructions", "pet wellness", "behavioral notes"]
  },
  {
    slug: "photo-gallery-life-story",
    title: "The Photo Gallery: The Pet's Digital Life Story For Safety and Sharing",
    description: "Create a visual timeline of your pet's life. From adoption day to current adventures, preserve memories while providing crucial identification photos for emergencies.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-photo-gallery-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-photo-gallery-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/photo-gallery-life-story.mp3",
    duration: "8:55",
    publishDate: "2025-11-02",
    keywords: ["pet photos", "photo gallery", "pet memories", "pet identification"]
  },
  {
    slug: "real-life-stories-petport",
    title: "Real-Life Stories: How PetPort Changes Everyday Pet Care",
    description: "Hear from pet parents, foster families, and rescues about how digital pet profiles transformed their care routines, saved time, and even saved lives.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-real-stories-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-real-stories-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/real-life-stories-petport.mp3",
    duration: "13:20",
    publishDate: "2025-11-02",
    keywords: ["pet stories", "real stories", "pet care success", "testimonials"]
  },
  {
    slug: "give-pets-voice-life",
    title: "Give Your Pet a Voice for Life",
    description: "A comprehensive look at why every pet deserves a lasting digital voice. Explore how complete digital profiles create better outcomes for pets and peace of mind for their families.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-voice-life-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-voice-life-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/give-pets-voice-life.mp3",
    duration: "14:05",
    publishDate: "2025-11-07",
    keywords: ["pet voice", "digital pet profile", "pet legacy", "pet care"]
  },
  {
    slug: "petport-ultimate-pet-gift",
    title: "PetPort: The Ultimate Pet Gift Solution for Fosters, Adopters, & Pet Parents",
    description: "Discover why PetPort is the perfect thoughtful gift for any pet milestone. This episode explores how digital pet profiles transform chaos into structure, solve daily stressors with real-time Care LiveLinks, empower fosters with one-tap transfers, and provide ultimate insurance for lost pet emergencies with instant flyer generation and sighting boards.",
    coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-ultimate-pet-gift-1000x1000.jpg",
    ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-ultimate-pet-gift-1200x630.jpg",
    audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-ultimate-pet-gift.m4a",
    duration: "10:34",
    publishDate: "2025-11-18",
    keywords: ["pet gift ideas", "thoughtful pet gifts", "digital pet profile", "pet organization app", "foster pet solutions", "lost pet insurance", "pet housing resume"]
  }
];

// Convert duration "MM:SS" to seconds for iTunes
function durationToSeconds(duration: string): number {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
}

// Escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate RFC 822 date format for RSS
function toRFC822(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PODCAST-RSS] Generating RSS feed');

    // Sort episodes by publish date (newest first)
    const sortedEpisodes = [...podcastEpisodes].sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    // Build RSS XML
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The PetPort Podcast: Giving Your Pet a Voice for Life</title>
    <link>https://petport.app/podcast</link>
    <atom:link href="https://petport.app/podcast/rss" rel="self" type="application/rss+xml"/>
    <description>Expert strategies and real-world advice for modern pet parents. Learn how to manage pet health records, create professional pet resumes, implement lost pet recovery systems, organize medical documents, handle foster-to-adopter transitions, and give your companion animal a complete digital voice that lasts a lifetime.</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} PetPort. All rights reserved.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    
    <!-- iTunes Podcast Metadata -->
    <itunes:author>Petport.app</itunes:author>
    <itunes:summary>Give Your Pet a Digital Voice for Life. Expert strategies for pet health records, lost pet recovery, pet housing applications, document storage, foster care programs, and comprehensive care instructions.</itunes:summary>
    <itunes:owner>
      <itunes:name>PetPort</itunes:name>
      <itunes:email>support@petport.app</itunes:email>
    </itunes:owner>
    <itunes:image href="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og/resume-og-1mb.png"/>
    <itunes:category text="Education">
      <itunes:category text="How To"/>
    </itunes:category>
    <itunes:category text="Society &amp; Culture">
      <itunes:category text="Documentary"/>
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>

${sortedEpisodes.map(episode => `    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description)}</description>
      <link>https://petport.app/podcast/${episode.slug}</link>
      <guid isPermaLink="true">https://petport.app/podcast/${episode.slug}</guid>
      <pubDate>${toRFC822(episode.publishDate)}</pubDate>
      <enclosure url="${episode.audioUrl}" type="audio/mpeg" length="0"/>
      
      <!-- iTunes Episode Metadata -->
      <itunes:title>${escapeXml(episode.title)}</itunes:title>
      <itunes:summary>${escapeXml(episode.description)}</itunes:summary>
      <itunes:image href="${episode.ogImage || episode.coverImage}"/>
      <itunes:duration>${durationToSeconds(episode.duration)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      ${episode.keywords ? `<itunes:keywords>${escapeXml(episode.keywords.join(', '))}</itunes:keywords>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;

    console.log('[PODCAST-RSS] RSS feed generated successfully with', sortedEpisodes.length, 'episodes');

    return new Response(rssXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('[PODCAST-RSS] Error generating RSS feed:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate RSS feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
