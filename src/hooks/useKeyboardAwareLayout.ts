import { useEffect, useState, useCallback } from 'react';
import { isIOSDevice } from '@/utils/iosDetection';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  bottomOffset: number;
}

/**
 * Hook to handle keyboard visibility and adjust layout accordingly
 * Uses Visual Viewport API on iOS, fallback to resize events on other platforms
 */
export const useKeyboardAwareLayout = () => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    bottomOffset: 0,
  });

  const updateKeyboardState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isIOS = isIOSDevice();
    
    if (isIOS && window.visualViewport) {
      // Use Visual Viewport API for iOS (more reliable)
      const viewport = window.visualViewport;
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const keyboardHeight = windowHeight - viewportHeight - viewport.offsetTop;
      
      setKeyboardState({
        isVisible: keyboardHeight > 100, // Threshold to detect keyboard
        height: Math.max(0, keyboardHeight),
        bottomOffset: Math.max(0, keyboardHeight),
      });
    } else {
      // Fallback for Android and other platforms
      const activeElement = document.activeElement as HTMLElement;
      const isInputFocused = activeElement && 
        (activeElement.tagName === 'INPUT' || 
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.contentEditable === 'true');
      
      setKeyboardState({
        isVisible: isInputFocused || false,
        height: isInputFocused ? 300 : 0, // Approximate keyboard height
        bottomOffset: isInputFocused ? 300 : 0,
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS = isIOSDevice();

    if (isIOS && window.visualViewport) {
      // Listen to visual viewport changes (iOS)
      window.visualViewport.addEventListener('resize', updateKeyboardState);
      window.visualViewport.addEventListener('scroll', updateKeyboardState);
    }

    // Listen to focus events for all platforms
    window.addEventListener('focusin', updateKeyboardState);
    window.addEventListener('focusout', updateKeyboardState);
    
    // Initial check
    updateKeyboardState();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateKeyboardState);
        window.visualViewport.removeEventListener('scroll', updateKeyboardState);
      }
      window.removeEventListener('focusin', updateKeyboardState);
      window.removeEventListener('focusout', updateKeyboardState);
    };
  }, [updateKeyboardState]);

  return keyboardState;
};
