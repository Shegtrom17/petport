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
import episode1 from './episodes/episode-1-pet-resume-matters';
import episode2 from './episodes/episode-2-beyond-lost-pet-flyer';
import episode3 from './episodes/episode-3-digital-pet-adoption';

// Export episodes array in chronological order
export const podcastEpisodes: PodcastEpisode[] = [
  episode1,  // Oct 17, 2025 - "Why Your Pet's Resume Actually Matters"
  episode2,  // Nov 1, 2025 - "Beyond the Lost Pet Flyer"
  episode3   // Nov 1, 2025 - "Digital Pet Adoption & Foster Transfer"
];
