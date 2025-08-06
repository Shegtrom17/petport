import { Button, ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";

interface HapticButtonProps extends ButtonProps {
  hapticType?: 'light' | 'medium' | 'heavy';
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticType = 'light', onClick, className, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        const vibrationPattern = {
          light: [10],
          medium: [20],
          heavy: [30]
        };
        navigator.vibrate(vibrationPattern[hapticType]);
      }

      // Call the original onClick handler
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        className={`touch-feedback ${className}`}
        {...props}
      />
    );
  }
);

HapticButton.displayName = "HapticButton";