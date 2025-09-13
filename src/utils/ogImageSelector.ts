import ogAppMain from '@/assets/og-app-main.png';
import ogEmergency from '@/assets/og-emergency.png';
import ogTravel from '@/assets/og-travel.png';
import ogCare from '@/assets/og-care.png';
import ogLostPet from '@/assets/og-lost-pet.png';

export type OGContext = 
  | 'app'
  | 'profile' 
  | 'emergency'
  | 'care'
  | 'travel'
  | 'resume'
  | 'reviews'
  | 'gallery'
  | 'lost-pet';

export const getOGImage = (context: OGContext, isLost: boolean = false): string => {
  // If pet is lost, always use lost pet image regardless of context
  if (isLost) {
    return ogLostPet;
  }

  switch (context) {
    case 'app':
      return ogAppMain;
    case 'emergency':
    case 'profile': // Emergency contact info is primary use case for profiles
      return ogEmergency;
    case 'care':
      return ogCare;
    case 'travel':
      return ogTravel;
    case 'resume':
      return ogTravel; // Resume often includes travel/credentials
    case 'reviews':
      return ogCare; // Reviews are about care quality
    case 'gallery':
      return ogAppMain; // General app showcase
    case 'lost-pet':
      return ogLostPet;
    default:
      return ogAppMain;
  }
};

export const getOGImageUrl = (context: OGContext, isLost: boolean = false): string => {
  const imagePath = getOGImage(context, isLost);
  // Convert local import to full URL
  return `${window.location.origin}${imagePath}`;
};

// Fallback for edge functions (use full URLs)
export const getOGImageUrlForEdgeFunction = (context: OGContext, isLost: boolean = false): string => {
  const baseUrl = 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/og-images';
  
  if (isLost) {
    return `${baseUrl}/og-lost-pet.png`;
  }

  switch (context) {
    case 'app':
      return `${baseUrl}/og-app-main.png`;
    case 'emergency':
    case 'profile':
      return `${baseUrl}/og-emergency.png`;
    case 'care':
      return `${baseUrl}/og-care.png`;
    case 'travel':
    case 'resume':
      return `${baseUrl}/og-travel.png`;
    case 'reviews':
      return `${baseUrl}/og-care.png`;
    case 'gallery':
      return `${baseUrl}/og-app-main.png`;
    case 'lost-pet':
      return `${baseUrl}/og-lost-pet.png`;
    default:
      return `${baseUrl}/og-app-main.png`;
  }
};