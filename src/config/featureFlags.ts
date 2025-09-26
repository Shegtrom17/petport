export type FeatureFlags = {
  showBillingTroubleshooting: boolean;
  enableSwipeNavigation: boolean;
  enableSelectPhotos: boolean;
  useHostedCheckout: boolean;
};

export const featureFlags: FeatureFlags = {
  showBillingTroubleshooting: false,
  enableSwipeNavigation: true,
  enableSelectPhotos: true,
  useHostedCheckout: true,
};

// Gallery configuration
export const GALLERY_CONFIG = {
  MAX_PHOTOS: 36, // Increased from 12 to 36
  ENABLE_LAZY_LOADING: true,
  PDF_IMAGE_OPTIMIZATION: true,
  PDF_MAX_IMAGE_WIDTH: 600, // Reduced for memory efficiency
  PDF_MAX_IMAGE_HEIGHT: 400,
  PDF_IMAGE_QUALITY: 0.75, // Reduced for smaller file sizes
};
