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
    content: 'Share specific pages like emergency contacts, care instructions, or your pet\'s resume with vets, sitters, or adopters.',
    title: '📤 Share Your Pet\'s Info Instantly',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '#bottom-nav-menu',
    content: 'Tap the Menu button to access Care & Handling, Resume, Documents, Travel Map, Gallery, and more.',
    title: '📂 Navigate All Sections',
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
