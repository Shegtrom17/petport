import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';

const TOUR_COMPLETED_KEY = 'petport_onboarding_completed';
const TOUR_SKIPPED_KEY = 'petport_onboarding_skipped';
const LOST_PET_TOUR_COMPLETED_KEY = 'petport_lost_pet_tour_completed';
const LOST_PET_TOUR_SKIPPED_KEY = 'petport_lost_pet_tour_skipped';

interface UseOnboardingTourProps {
  hasPets: boolean; // Safeguard: don't run if no pets
  tourType?: 'main' | 'lostPet'; // Which tour to run
}

export const useOnboardingTour = ({ hasPets, tourType = 'main' }: UseOnboardingTourProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [runTour, setRunTour] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [targetsReady, setTargetsReady] = useState(false);

  // Tour keys based on type
  const completedKey = tourType === 'lostPet' ? LOST_PET_TOUR_COMPLETED_KEY : TOUR_COMPLETED_KEY;
  const skippedKey = tourType === 'lostPet' ? LOST_PET_TOUR_SKIPPED_KEY : TOUR_SKIPPED_KEY;

  // Wait for essential DOM targets (Pet Selector is optional for single-pet users)
  const waitForTargets = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const essentialTargetIds = tourType === 'lostPet' 
        ? [
            'report-missing-button',
            'privacy-toggle-lost-pet',
            'lost-pet-details-form',
            'quick-share-hub',
          ]
        : [
            'profile-management-hub',
            'quick-share-hub',
            'bottom-nav-menu',
            'three-dot-menu',
          ];
      
      // Note: sightings-moderation-board is optional for Lost Pet tour (only shows when pet is marked missing)

      let attempts = 0;
      const maxAttempts = 30; // 3 seconds max (100ms intervals)

      const checkTargets = () => {
        const allEssentialExist = essentialTargetIds.every(id => document.getElementById(id));
        
        if (allEssentialExist) {
          console.log(`✅ Essential ${tourType} tour targets found`);
          resolve(true);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          console.warn(`⚠️ Essential ${tourType} tour targets not found after 3 seconds, skipping tour`);
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

    const completed = localStorage.getItem(completedKey);
    const skipped = localStorage.getItem(skippedKey);
    
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
  }, [user, hasPets, location.pathname, completedKey, skippedKey]);

  const completeTour = () => {
    localStorage.setItem(completedKey, 'true');
    setRunTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(skippedKey, 'true');
    setRunTour(false);
  };

  const restartTour = () => {
    localStorage.removeItem(completedKey);
    localStorage.removeItem(skippedKey);
    
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
