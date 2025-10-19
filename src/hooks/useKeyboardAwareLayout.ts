import { useEffect, useState, useCallback } from 'react';
import { isIOSDevice, isIOS18Plus } from '@/utils/iosDetection';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  bottomOffset: number;
  useNativePositioning: boolean;
}

/**
 * Hook to handle keyboard visibility and adjust layout accordingly
 * Uses Visual Viewport API on iOS, fallback to resize events on other platforms
 */
export const useKeyboardAwareLayout = () => {
  const isIOS = isIOSDevice();
  const useNativePositioning = isIOS18Plus();
  
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    bottomOffset: 0,
    useNativePositioning,
  });

  const updateKeyboardState = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (isIOS && window.visualViewport) {
      const viewport = window.visualViewport;
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      
      // iOS 18+ uses different keyboard height calculation
      const keyboardHeight = useNativePositioning
        ? Math.max(0, windowHeight - viewportHeight)
        : windowHeight - viewportHeight - viewport.offsetTop;
      
      const isKeyboardVisible = keyboardHeight > 100;
      
      if (useNativePositioning) {
        // iOS 18+: Set CSS variable for native positioning
        const heightValue = isKeyboardVisible ? `${keyboardHeight}px` : '0px';
        document.documentElement.style.setProperty('--keyboard-height', heightValue);
        
        // Add/remove class for iOS 18+ native positioning
        if (isKeyboardVisible) {
          document.body.classList.add('keyboard-open');
        } else {
          document.body.classList.remove('keyboard-open');
        }
        
        setKeyboardState({
          isVisible: isKeyboardVisible,
          height: isKeyboardVisible ? keyboardHeight : 0,
          bottomOffset: 0, // No transform offset for iOS 18+
          useNativePositioning: true,
        });
      } else {
        // iOS 17 and earlier: Use transform offset
        setKeyboardState({
          isVisible: isKeyboardVisible,
          height: isKeyboardVisible ? Math.max(0, keyboardHeight) : 0,
          bottomOffset: isKeyboardVisible ? Math.max(0, keyboardHeight) : 0,
          useNativePositioning: false,
        });
      }
    } else {
      // ANDROID & others - Enhanced viewport handling
      const vv = (window as any).visualViewport;
      if (!vv) {
        // Fallback for browsers without Visual Viewport API
        setKeyboardState({
          isVisible: false,
          height: 0,
          bottomOffset: 0,
          useNativePositioning: false,
        });
        return;
      }
      
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      const isKeyboardVisible = keyboardHeight > 100;

      // Add body class for CSS targeting
      if (isKeyboardVisible) {
        document.body.classList.add('keyboard-open', 'platform-android');
      } else {
        document.body.classList.remove('keyboard-open', 'platform-android');
      }

      // Expose height to CSS for all containers
      const offsetValue = isKeyboardVisible ? `${keyboardHeight}px` : '0px';
      document.documentElement.style.setProperty('--kb-offset', offsetValue);
      document.documentElement.style.setProperty('--keyboard-height', offsetValue);

      setKeyboardState({
        isVisible: isKeyboardVisible,
        height: isKeyboardVisible ? keyboardHeight : 0,
        bottomOffset: 0,
        useNativePositioning: false,
      });
    }
  }, [isIOS, useNativePositioning]);

  // Helper disabled to prevent forced scroll-to-bottom on focus
  const ensureSaveButtonVisible = useCallback(() => {
    /* no-op */
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS = isIOSDevice();

    // Listen to visual viewport changes on all platforms (iOS and Android)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateKeyboardState);
      window.visualViewport.addEventListener('scroll', updateKeyboardState);
    }

    // Create event handlers
    const handleFocusIn = () => {
      updateKeyboardState();
      // Disabled auto-scrolling the Save bar to prevent jump-to-bottom on focus
      // iOS will still lift the bar above keyboard via bottomOffset transform in form
    };

    const handleFocusOut = () => {
      // Add delay to allow iOS viewport to settle after "Done" button
      setTimeout(() => {
        updateKeyboardState();
        
        // Force reset if no active input elements
        const activeElement = document.activeElement;
        const isInputActive = activeElement?.tagName === 'INPUT' || 
                             activeElement?.tagName === 'TEXTAREA';
        
        if (!isInputActive) {
          // Force reset CSS variables
          document.documentElement.style.setProperty('--kb-offset', '0px');
          document.documentElement.style.setProperty('--keyboard-height', '0px');
          setKeyboardState({
            isVisible: false,
            height: 0,
            bottomOffset: 0,
            useNativePositioning,
          });
        }
      }, 150);
    };

    // Listen to focus events for all platforms
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    
    // Initial check
    updateKeyboardState();

    return () => {
      document.documentElement.style.setProperty('--kb-offset', '0px');
      document.documentElement.style.setProperty('--keyboard-height', '0px');
      document.body.classList.remove('keyboard-open');
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateKeyboardState);
        window.visualViewport.removeEventListener('scroll', updateKeyboardState);
      }
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, [updateKeyboardState, ensureSaveButtonVisible]);

  return keyboardState;
};
