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

  return (
    <div
      {...(swipeHandlers ?? {})}
      className={className ?? "h-full w-full"}
      style={{
        touchAction: "pan-y",           // vertical scroll wins
        overscrollBehaviorY: "contain", // mitigates iOS PTR bounce
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}