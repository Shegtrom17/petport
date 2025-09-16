import { useCallback, useRef } from 'react';

interface LongPressOptions {
  onLongPress: () => void;
  delay?: number;
  shouldPreventDefault?: boolean;
}

export const useLongPress = ({ 
  onLongPress, 
  delay = 400, 
  shouldPreventDefault = true 
}: LongPressOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const clear = useCallback((event?: React.TouchEvent | React.MouseEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cancel = useCallback((event?: React.TouchEvent | React.MouseEvent) => {
    clear();
    isLongPressRef.current = false;
  }, [clear]);

  const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    // Only start long press for single touch
    if ('touches' in event && event.touches.length > 1) {
      clear();
      isLongPressRef.current = false;
      return;
    }

    if (shouldPreventDefault) {
      event.preventDefault();
    }

    isLongPressRef.current = false;
    
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay, shouldPreventDefault, clear]);


  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: cancel,
    isLongPress: () => isLongPressRef.current,
  };
};