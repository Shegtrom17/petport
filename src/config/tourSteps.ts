import type { Step } from 'react-joyride';

export const ONBOARDING_STEPS: Step[] = [
  {
    target: '#pet-selector-cards',
    content: 'Tap any card to view that pet\'s profile. Swipe or drag to reorder them. These cards always appear when you have multiple pets.',
    title: '🐾 Switch Between Your Pets',
    placement: 'bottom',
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '#profile-management-hub',
    content: 'This is your control center area on each page. Tap Edit to Keep your pet\'s details current for that page\'s featured Information. This page it\'s Profile Photo, Pet Info, Med and Foster/Adopter.',
    title: '✏️ Update Pet Information',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '#quick-share-hub',
    content: 'Share specific LiveLinks and PDF\'s for Care Instructions, Lost Pet, Pet\'s Resume with - vets, sitters, or adopters. This HUB is found on every page.',
    title: '📤 Share Your Pet\'s Info Instantly',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '#bottom-nav-menu',
    content: 'Tap the Menu button to access and edit information for Care & Handling, Resume, Documents, Travel Map, Gallery, and more.',
    title: '📂 Navigate All Pages',
    placement: 'top',
    spotlightPadding: 10,
  },
  {
    target: '#three-dot-menu',
    content: 'Access your account settings, billing, help resources, and report issues here. You can also restart this tour from Settings anytime!',
    title: '⚙️ Settings & Help',
    placement: 'bottom-end',
    spotlightPadding: 8,
  },
];

export const LOST_PET_TOUR_STEPS: Step[] = [
  {
    target: '#report-missing-button',
    content: 'Start by tapping "Report Missing" to mark your pet as lost. This activates all lost pet features and alerts.',
    title: '🚨 Step 1: Mark Pet as Lost',
    placement: 'top',
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '#privacy-toggle-lost-pet',
    content: 'Make your pet\'s profile PUBLIC to enable sharing features. This allows others to view the lost pet alert and help find your pet.',
    title: '🔓 Step 2: Make Profile Public',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '#lost-pet-details-form',
    content: 'Add critical details: last seen location, date/time, distinctive features, and reward amount. The more information you provide, the better the chances of finding your pet!',
    title: '📝 Step 3: Add Lost Pet Details',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '#sightings-moderation-board',
    content: 'Monitor community sighting reports here. You can review, edit, or delete any reported sightings to keep the information accurate and helpful.',
    title: '👁️ Step 4: Manage Sighting Reports',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '#quick-share-hub',
    content: 'Share your pet\'s alert via LiveLink, QR code, or PDF flyer. The public can view, share, and print PDFs from any shared link or scanned QR code!',
    title: '📤 Step 5: Share the Alert',
    placement: 'top',
    spotlightPadding: 8,
  },
];
