export type FeatureFlags = {
  testMode: boolean;
};

export const featureFlags: FeatureFlags = {
  // Enable during trusted-friends testing. Set to false for production.
  testMode: false,
};
