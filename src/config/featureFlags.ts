export type FeatureFlags = {
  testMode: boolean;
  showBillingTroubleshooting: boolean;
  enableSwipeNavigation: boolean;
  enableGuidedTour: boolean;
};

export const featureFlags: FeatureFlags = {
  // Enable during trusted-friends testing. Set to false for production.
  testMode: true,
  showBillingTroubleshooting: false,
  enableSwipeNavigation: true,
  enableGuidedTour: true,
};
