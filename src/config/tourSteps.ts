import type { Step } from 'react-joyride';

export const ONBOARDING_STEPS: Step[] = [
  {
    target: '.pet-info-card',
    content: 'Welcome to your pet\'s Home page! Fill in essential information like name, species, breed, age, weight, and more to create a complete profile.',
    title: '🏠 Create Your Pet\'s Profile',
    placement: 'bottom',
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '.pet-header',
    content: 'Upload a photo of your pet to personalize their profile. This photo will appear on shared LiveLinks and PDFs.',
    title: '📷 Add Profile Photo',
    placement: 'bottom',
    spotlightPadding: 8,
  },
  {
    target: '#privacy-toggle-lost-pet',
    content: 'Control your pet\'s profile visibility. Toggle between Private (only you can view) and Public (shareable with others via links).',
    title: '🔓 Privacy Toggle',
    placement: 'bottom',
    spotlightPadding: 8,
  },
  {
    target: '#quick-share-hub',
    content: 'The Quick Share Hub lets you share LiveLinks and PDFs for Profile, Care Instructions, Lost Pet alerts, and Pet Resume. Found on every page for easy access!',
    title: '📤 Quick Share Hub',
    placement: 'top',
    spotlightPadding: 8,
  },
  {
    target: '.edit-profile-button',
    content: 'Edit your pet\'s profile information anytime by clicking the Edit Profile button. Update details, add contacts, or modify settings.',
    title: '✏️ Edit Profile',
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
