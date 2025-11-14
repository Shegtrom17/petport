import type { Step } from 'react-joyride';

export const ONBOARDING_STEPS: Step[] = [
  {
    target: '.care-management-hub',
    content: 'This is the Care Board where you can manage all your pet\'s care instructions including feeding schedules, daily routines, and medications.',
    title: '🏠 Care Management Hub',
    placement: 'bottom',
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '.preview-care-link-button',
    content: 'Click here to preview the public Care & Handling LiveLink that you can share with vets, sitters, or caretakers.',
    title: '👁️ Preview Care LiveLink',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '.edit-care-button',
    content: 'Tap Edit to update feeding schedules, routines, medications, and important care notes for your pet.',
    title: '✏️ Edit Care Fields',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '.service-provider-board',
    content: 'The Service Provider Board shows notes from vets, groomers, and other professionals who care for your pet.',
    title: '📋 Service Provider Board',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '#quick-share-hub',
    content: 'Share specific LiveLinks and PDFs for Care Instructions, Lost Pet, Pet\'s Resume with vets, sitters, or adopters. This HUB is found on every page.',
    title: '📤 Share Your Pet\'s Info',
    placement: 'top',
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
