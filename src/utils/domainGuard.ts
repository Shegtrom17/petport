import { getBaseURL } from './domainUtils';

/**
 * Domain guard to redirect from lovableproject.com to production domain
 * This prevents URL bleeding between development and production environments
 */
export const initializeDomainGuard = (): void => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  const currentHost = window.location.hostname;
  const isLovablePreview = currentHost.includes('lovableproject.com') || currentHost.includes('lovable.app');
  const productionURL = getBaseURL();
  
  // If we're on ANY Lovable preview domain, redirect to production immediately
  if (isLovablePreview) {
    console.log('Domain guard: Redirecting from preview to production');
    window.location.replace(productionURL + window.location.pathname + window.location.search);
    return;
  }
  
  // Add robots noindex for preview domain
  if (isLovablePreview) {
    const existingRobots = document.querySelector('meta[name="robots"]');
    if (existingRobots) {
      existingRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      const robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      robotsMeta.content = 'noindex, nofollow';
      document.head.appendChild(robotsMeta);
    }
  }
};

/**
 * Get the safe base URL for the current environment
 * Always returns the production URL to prevent cross-domain issues
 */
export const getSafeBaseURL = (): string => {
  return getBaseURL();
};