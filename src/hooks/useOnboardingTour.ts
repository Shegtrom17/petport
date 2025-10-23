import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';

const TOUR_COMPLETED_KEY = 'petport_onboarding_completed';
const TOUR_SKIPPED_KEY = 'petport_onboarding_skipped';

interface UseOnboardingTourProps {
  hasPets: boolean; // Safeguard: don't run if no pets
}

export const useOnboardingTour = ({ hasPets }: UseOnboardingTourProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [runTour, setRunTour] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [targetsReady, setTargetsReady] = useState(false);

  // Wait for essential DOM targets (Pet Selector is optional for single-pet users)
  const waitForTargets = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const essentialTargetIds = [
        'profile-management-hub',
        'quick-share-hub',
        'bottom-nav-menu',
        'three-dot-menu',
      ];

      let attempts = 0;
      const maxAttempts = 30; // 3 seconds max (100ms intervals)

      const checkTargets = () => {
        const allEssentialExist = essentialTargetIds.every(id => document.getElementById(id));
        
        if (allEssentialExist) {
          console.log('✅ Essential tour targets found');
          resolve(true);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          console.warn('⚠️ Essential tour targets not found after 3 seconds, skipping tour');
          resolve(false);
          return;
        }

        setTimeout(checkTargets, 100);
      };

      checkTargets();
    });
  };

  useEffect(() => {
    // ✅ Route guard: Only run on homepage (/app)
    if (location.pathname !== '/app') {
      setRunTour(false);
      return;
    }

    // ✅ No-pet safeguard
    if (!user || !hasPets) {
      setRunTour(false);
      return;
    }

    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    const skipped = localStorage.getItem(TOUR_SKIPPED_KEY);
    
    // Show tour if never completed or skipped
    if (!completed && !skipped) {
      // Wait for DOM targets before starting
      waitForTargets().then((ready) => {
        if (ready) {
          setTargetsReady(true);
          setRunTour(true);
        }
      });
    }
  }, [user, hasPets, location.pathname]);

  const completeTour = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    setRunTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(TOUR_SKIPPED_KEY, 'true');
    setRunTour(false);
  };

  const restartTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_SKIPPED_KEY);
    
    // Wait for targets again
    waitForTargets().then((ready) => {
      if (ready) {
        setTourKey(prev => prev + 1);
        setRunTour(true);
      }
    });
  };

  return {
    runTour: runTour && targetsReady,
    tourKey,
    completeTour,
    skipTour,
    restartTour,
  };
};
