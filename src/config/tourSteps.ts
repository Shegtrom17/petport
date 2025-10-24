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
