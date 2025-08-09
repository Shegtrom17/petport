import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  showPrompt: boolean;
  hasEngaged: boolean;
  lastDismissed: number | null;
}

const STORAGE_KEY = 'pwa-install-state';
const ENGAGEMENT_DELAY = 5000; // 5 seconds
const DISMISS_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days

export const usePWAInstall = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isStandalone: false,
    showPrompt: false,
    hasEngaged: false,
    lastDismissed: null,
  });

  // Check if device is iOS
  const isIOS = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  // Check if app is running in standalone mode
  const isStandalone = useCallback(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedState = saved ? JSON.parse(saved) : {};
      
      setState(prev => ({
        ...prev,
        isIOS: isIOS(),
        isStandalone: isStandalone(),
        isInstalled: isStandalone(),
        lastDismissed: savedState.lastDismissed || null,
      }));
    } catch (error) {
      console.error('Error loading PWA install state:', error);
    }
  }, [isIOS, isStandalone]);

  // Save state to localStorage
  const saveState = useCallback((updates: Partial<PWAInstallState>) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedState = saved ? JSON.parse(saved) : {};
      const newState = { ...savedState, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving PWA install state:', error);
    }
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setInstallEvent(installEvent);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Track appinstalled event
  useEffect(() => {
    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, showPrompt: false }));
      saveState({ isInstalled: true });
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, [saveState]);

  // Track user engagement
  useEffect(() => {
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, hasEngaged: true }));
    }, ENGAGEMENT_DELAY);

    return () => clearTimeout(timer);
  }, []);

  // Show prompt logic
  useEffect(() => {
    const shouldShow = 
      !state.isInstalled &&
      state.hasEngaged &&
      (state.isInstallable || state.isIOS) &&
      (!state.lastDismissed || Date.now() - state.lastDismissed > DISMISS_COOLDOWN);

    setState(prev => ({ ...prev, showPrompt: shouldShow }));
  }, [state.isInstalled, state.hasEngaged, state.isInstallable, state.isIOS, state.lastDismissed]);

  // Install app (Android Chrome)
  const installApp = useCallback(async () => {
    if (!installEvent) return false;

    try {
      await installEvent.prompt();
      const choiceResult = await installEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstalled: true, showPrompt: false }));
        saveState({ isInstalled: true });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [installEvent, saveState]);

  // Dismiss prompt
  const dismissPrompt = useCallback(() => {
    const now = Date.now();
    setState(prev => ({ ...prev, showPrompt: false, lastDismissed: now }));
    saveState({ lastDismissed: now });
  }, [saveState]);

  // Never show again
  const neverShowAgain = useCallback(() => {
    setState(prev => ({ ...prev, showPrompt: false, lastDismissed: Date.now() }));
    saveState({ lastDismissed: Date.now() + (365 * 24 * 60 * 60 * 1000) }); // 1 year
  }, [saveState]);

  // Force show instructions (for manual trigger)
  const forceShowInstructions = useCallback(() => {
    return {
      isIOS: isIOS(),
      isInstallable: !!installEvent,
      canInstall: !!installEvent || isIOS(),
    };
  }, [installEvent, isIOS]);

  // Reset install state (for testing)
  const resetInstallState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(prev => ({ ...prev, lastDismissed: null, showPrompt: false }));
  }, []);

  return {
    ...state,
    installApp,
    dismissPrompt,
    neverShowAgain,
    forceShowInstructions,
    resetInstallState,
  };
};