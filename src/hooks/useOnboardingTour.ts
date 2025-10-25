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
  requiredTab?: string; // Tab that must be active for tour to run
  currentTab?: string; // Current active tab
}

export const useOnboardingTour = ({ hasPets, tourType = 'main', requiredTab, currentTab }: UseOnboardingTourProps) => {
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
        const allEssentialExist = essentialTargetIds.every(id => {
          const exists = !!document.getElementById(id);
          if (!exists) {
            console.log(`⏳ [${tourType}] Waiting for target: #${id}`);
          }
          return exists;
        });
        
        if (allEssentialExist) {
          console.log(`✅ [${tourType}] All essential tour targets found`);
          resolve(true);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          console.warn(`⚠️ [${tourType}] Essential tour targets not found after 3 seconds, skipping tour`);
          console.log(`Missing targets:`, essentialTargetIds.filter(id => !document.getElementById(id)));
          resolve(false);
          return;
        }

        setTimeout(checkTargets, 100);
      };

      checkTargets();
    });
  };

  useEffect(() => {
    console.log(`🔍 [${tourType}] Tour state check:`, {
      pathname: location.pathname,
      hasPets,
      user: !!user,
      requiredTab,
      currentTab,
      completed: localStorage.getItem(completedKey),
      skipped: localStorage.getItem(skippedKey),
    });

    // ✅ Route guard: Only run on homepage (/app)
    if (location.pathname !== '/app') {
      console.log(`⏸️ [${tourType}] Tour blocked: not on /app`);
      setRunTour(false);
      return;
    }

    // ✅ No-pet safeguard
    if (!user || !hasPets) {
      console.log(`⏸️ [${tourType}] Tour blocked: no user or no pets`);
      setRunTour(false);
      return;
    }

    // ✅ Tab requirement check
    if (requiredTab && currentTab !== requiredTab) {
      console.log(`⏸️ [${tourType}] Tour blocked: waiting for tab ${requiredTab} (current: ${currentTab})`);
      setRunTour(false);
      return;
    }

    const completed = localStorage.getItem(completedKey);
    const skipped = localStorage.getItem(skippedKey);
    
    // Show tour if never completed or skipped
    if (!completed && !skipped) {
      console.log(`🚀 [${tourType}] Starting tour target detection`);
      // Wait for DOM targets before starting
      waitForTargets().then((ready) => {
        if (ready) {
          console.log(`✅ [${tourType}] Tour ready to start`);
          setTargetsReady(true);
          setRunTour(true);
        }
      });
    } else {
      console.log(`⏸️ [${tourType}] Tour already completed or skipped`);
    }
  }, [user, hasPets, location.pathname, completedKey, skippedKey, requiredTab, currentTab, tourType]);

  const completeTour = () => {
    localStorage.setItem(completedKey, 'true');
    setRunTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(skippedKey, 'true');
    setRunTour(false);
  };

  const restartTour = () => {
    console.log(`🔄 [${tourType}] Restarting tour`);
    localStorage.removeItem(completedKey);
    localStorage.removeItem(skippedKey);
    
    // If tour requires a specific tab, trigger navigation
    if (requiredTab && currentTab !== requiredTab) {
      console.log(`🔄 [${tourType}] Navigating to required tab: ${requiredTab}`);
      window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: requiredTab }));
      
      // Wait a bit for tab change and DOM update
      setTimeout(() => {
        waitForTargets().then((ready) => {
          if (ready) {
            console.log(`✅ [${tourType}] Tour restarted successfully`);
            setTourKey(prev => prev + 1);
            setRunTour(true);
          }
        });
      }, 300);
    } else {
      // No tab change needed, start immediately
      waitForTargets().then((ready) => {
        if (ready) {
          console.log(`✅ [${tourType}] Tour restarted successfully`);
          setTourKey(prev => prev + 1);
          setRunTour(true);
        }
      });
    }
  };

  return {
    runTour: runTour && targetsReady,
    tourKey,
    completeTour,
    skipTour,
    restartTour,
  };
};
