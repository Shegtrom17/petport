import { useCallback, useEffect, useState } from "react";
import { useUserSettings } from "./useUserSettings";
import { useAuth } from "@/context/AuthContext";
import { featureFlags } from "@/config/featureFlags";
import { useOverlayStore } from "@/stores/overlayStore";

const TOUR_VERSION = "v1.0";

export interface CoachStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
}

const COACH_STEPS: CoachStep[] = [
  {
    id: "share",
    targetSelector: "[data-coach-id='share-button']",
    title: "Share Your Pet's Profile",
    description: "Send your pet's profile in seconds with this share button."
  },
  {
    id: "privacy",
    targetSelector: "[data-coach-id='privacy-toggle']",
    title: "Privacy Control",
    description: "Toggle what others can see when you share your pet's profile."
  },
  {
    id: "quick-id",
    targetSelector: "[data-coach-id='quick-id']",
    title: "Quick ID",
    description: "Grab essential info fast in emergencies with Quick ID."
  }
];

export function useCoachTour() {
  const { user } = useAuth();
  const { settings, updateSettings } = useUserSettings(user?.id);
  const { open: openOverlay, close: closeOverlay } = useOverlayStore();
  
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const shouldShowTour = useCallback(() => {
    if (!featureFlags.enableGuidedTour) return false;
    if (!user) return false; // Only for authenticated users
    return settings.tourVersionSeen !== TOUR_VERSION;
  }, [user, settings.tourVersionSeen]);

  const waitForTarget = useCallback((selector: string, timeout = 3000): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        resolve(element);
        return;
      }

      let timeoutId: NodeJS.Timeout;
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      timeoutId = setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }, []);

  const startTour = useCallback(async () => {
    if (!shouldShowTour()) return;
    
    setIsActive(true);
    setCurrentStep(0);
    openOverlay();
    
    // Wait for first target
    const target = await waitForTarget(COACH_STEPS[0].targetSelector);
    setTargetElement(target);
  }, [shouldShowTour, openOverlay, waitForTarget]);

  const nextStep = useCallback(async () => {
    const next = currentStep + 1;
    
    if (next >= COACH_STEPS.length) {
      // Tour complete
      setIsActive(false);
      setTargetElement(null);
      closeOverlay();
      updateSettings({ tourVersionSeen: TOUR_VERSION });
      return;
    }

    setCurrentStep(next);
    const target = await waitForTarget(COACH_STEPS[next].targetSelector);
    setTargetElement(target);
  }, [currentStep, updateSettings, closeOverlay, waitForTarget]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setTargetElement(null);
    closeOverlay();
    updateSettings({ tourVersionSeen: TOUR_VERSION });
  }, [updateSettings, closeOverlay]);

  const replayTour = useCallback(() => {
    updateSettings({ tourVersionSeen: "" });
    // Tour will auto-start on next render
  }, [updateSettings]);

  // Auto-start tour when conditions are met
  useEffect(() => {
    if (shouldShowTour() && !isActive) {
      // Small delay to let page settle
      const timer = setTimeout(startTour, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTour, isActive, startTour]);

  return {
    isActive,
    currentStep: isActive ? COACH_STEPS[currentStep] : null,
    stepNumber: currentStep + 1,
    totalSteps: COACH_STEPS.length,
    targetElement,
    nextStep,
    skipTour,
    replayTour,
    canReplay: settings.tourVersionSeen === TOUR_VERSION
  };
}