import * as React from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ScrollControlsProps {
  targetRef: React.RefObject<HTMLElement>;
  className?: string;
  showVertical?: boolean;
  showHorizontal?: boolean;
}

export const ScrollControls = ({ 
  targetRef, 
  className, 
  showVertical = true, 
  showHorizontal = true 
}: ScrollControlsProps) => {
  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScrollability = React.useCallback(() => {
    if (!targetRef.current) return;

    const element = targetRef.current;
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = element;

    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  }, [targetRef]);

  React.useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    checkScrollability();
    element.addEventListener('scroll', checkScrollability);
    
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', checkScrollability);
      resizeObserver.disconnect();
    };
  }, [checkScrollability, targetRef]);

  const scroll = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!targetRef.current) return;

    const scrollAmount = 100;
    const element = targetRef.current;

    switch (direction) {
      case 'up':
        element.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        break;
      case 'down':
        element.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        break;
      case 'left':
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        break;
      case 'right':
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        break;
    }
  };

  return (
    <div className={cn("fixed z-50", className)}>
      {/* Vertical Controls */}
      {showVertical && (
        <div className="flex flex-col gap-1 absolute right-2 top-1/2 -translate-y-1/2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => scroll('up')}
            disabled={!canScrollUp}
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => scroll('down')}
            disabled={!canScrollDown}
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Horizontal Controls */}
      {showHorizontal && (
        <div className="flex gap-1 absolute bottom-2 left-1/2 -translate-x-1/2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};