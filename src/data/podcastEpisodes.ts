// ===================================================================
// PODCAST EPISODES - Modular Organization
// ===================================================================
// Each episode is now in its own file under src/data/episodes/
// This prevents cross-contamination and makes updates easier.
//
// Episode numbering is based on chronological publish date.
// ===================================================================

export interface PodcastEpisode {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  ogImage?: string; // Optional 1200x630 image for social sharing
  audioUrl: string;
  duration: string;
  publishDate: string;
  transcript: string;
  displayTranscript?: string; // Pretty HTML version for display
  relatedPages?: string[];
  keywords?: string[];
}

// Import individual episode modules
import episodePilot from './episodes/episode-0-pilot';
import episode1 from './episodes/episode-1-pet-screening-resume-builder';
import episode2 from './episodes/episode-2-beyond-lost-pet-flyer';
import episode3 from './episodes/episode-3-digital-pet-adoption';
import episode4 from './episodes/episode-4-pet-care-handling-digital-voice';
import episode5 from './episodes/episode-5-photo-gallery-life-story';
import episode6 from './episodes/episode-6-digital-pet-records-app';
import episode7 from './episodes/episode-7-livelinks-digital-pet-care';
import episode8 from './episodes/episode-8-real-life-stories';
import episode9 from './episodes/episode-9-give-pets-voice-life';

// Export episodes array in strategic order (by user importance)
export const podcastEpisodes: PodcastEpisode[] = [
  episode9,      // #9 - Nov 7, 2025 - "Give Your Pet a Voice for Life" (LATEST)
  episodePilot,  // #0 - Sept 7, 2025 - "The Digital Pet Profile & Information Platform for a Lifetime" (PILOT)
  episode2,      // #2 - Nov 1, 2025 - "Beyond the Lost Pet Flyer"
  episode3,      // #3 - Nov 1, 2025 - "Digital Pet Adoption & Foster Transfer"
  episode1,      // #1 - Oct 17, 2025 - "Why Your Pet's Resume Actually Matters"
  episode7,      // #7 - Oct 25, 2025 - "LiveLinks in Action — The Heartbeat of PetPort"
  episode6,      // #6 - Oct 20, 2025 - "Digital Pet Records & Document Storage"
  episode4,      // #4 - Nov 1, 2025 - "Pet Care & Handling: Digital Voice and Wellness"
  episode5,      // #5 - Nov 2, 2025 - "The Photo Gallery: The Pet's Digital Life Story For Safety and Sharing"
  episode8       // #8 - Nov 2, 2025 - "Real-Life Stories: How PetPort Changes Everyday Pet Care"
];
