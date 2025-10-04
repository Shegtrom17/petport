// src/components/layout/SwipeContainer.tsx
import React from "react";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

type Props = React.PropsWithChildren<{
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  isOverlayOpen: boolean;
  isPtrActive: boolean;
  debug?: boolean;
  className?: string;
  style?: React.CSSProperties;
}>;

export function SwipeContainer({
  enabled,
  onPrev,
  onNext,
  isOverlayOpen,
  isPtrActive,
  debug = false,
  className,
  style,
  children,
}: Props) {
  const swipeHandlers = useSwipeNavigation({
    enabled,
    onPrev,
    onNext,
    isOverlayOpen,
    isPtrActive,
    debug,
  });

  // Detect iOS for optimized touch handling
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Disable pinch-zoom on iOS when overlays are open to prevent conflicts
  const touchAction = isIOS && (isOverlayOpen || isPtrActive) 
    ? "pan-y" 
    : "pan-y pinch-zoom";

  return (
    <div
      {...(swipeHandlers ?? {})}
      className={className ?? "h-full w-full"}
      data-swipe-container="true"
      style={{
        touchAction,
        overscrollBehaviorY: "contain",  // mitigates iOS PTR bounce
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}