export type PDFType = 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery' | 'resume';

// Centralized type resolver to avoid silent fallbacks and cross-file drift
export function resolvePdfType(input: string | null | undefined): PDFType {
  const t = (input || '').toString().trim().toLowerCase();

  switch (t) {
    // General/full synonyms
    case 'full':
    case 'complete':
    case 'general':
    case 'general_profile':
    case 'generalprofile':
    case 'full_profile':
    case 'profile':
    case 'complete_profile':
      return 'full';

    // Emergency
    case 'emergency':
    case 'emerg':
    case 'emer':
      return 'emergency';

    // Lost pet synonyms
    case 'lost_pet':
    case 'lost-pet':
    case 'lost':
    case 'missing':
    case 'missing_pet':
      return 'lost_pet';

    // Care
    case 'care':
    case 'care_instructions':
    case 'care-instructions':
      return 'care';

    // Gallery
    case 'gallery':
    case 'photos':
    case 'portrait_gallery':
      return 'gallery';

    // Resume/credentials
    case 'resume':
    case 'credentials':
      return 'resume';
  }

  // If nothing matches, do NOT silently default. Log and use emergency as a safe fallback.
  // Callers should pass valid types; this helps us catch regressions.
  console.warn('[PDF] Unknown type received, defaulting to emergency:', input);
  return 'emergency';
}
