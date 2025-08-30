import React from "react";
import { cn } from "@/lib/utils";

// Main SafeText component that prevents overflow and adapts to container size
interface SafeTextProps {
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  truncate?: boolean | number; // true for single line, number for multi-line
  wrap?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export const SafeText = ({ 
  children, 
  className,
  size = "base",
  truncate = false,
  wrap = true,
  as: Component = "span"
}: SafeTextProps) => {
  const sizeClasses = {
    xs: "text-responsive-xs",
    sm: "text-responsive-sm", 
    base: "text-responsive-base",
    lg: "text-responsive-lg",
    xl: "text-responsive-xl",
    "2xl": "text-responsive-2xl",
    "3xl": "text-responsive-3xl",
  };

  const truncateClasses = {
    1: "truncate",
    2: "text-ellipsis-2", 
    3: "text-ellipsis-3",
  };

  return (
    <Component 
      className={cn(
        sizeClasses[size],
        wrap && "text-wrap-safe",
        truncate === true && "truncate",
        typeof truncate === "number" && truncateClasses[truncate as keyof typeof truncateClasses],
        "container-safe overflow-hidden",
        className
      )}
    >
      {children}
    </Component>
  );
};

// Specialized component for buttons
interface SafeButtonTextProps {
  children: React.ReactNode;
  className?: string;
  wrap?: boolean;
}

export const SafeButtonText = ({ 
  children, 
  className,
  wrap = false 
}: SafeButtonTextProps) => {
  return (
    <SafeText 
      className={cn(
        "font-medium leading-tight",
        wrap ? "text-wrap-safe" : "truncate",
        "min-w-0 flex-shrink",
        className
      )}
      size="sm"
      wrap={wrap}
      truncate={!wrap}
    >
      {children}
    </SafeText>
  );
};

// Specialized component for badges  
interface SafeBadgeTextProps {
  children: React.ReactNode;
  className?: string;
}

export const SafeBadgeText = ({ children, className }: SafeBadgeTextProps) => {
  return (
    <SafeText 
      className={cn("font-semibold", className)}
      size="xs"
      truncate={true}
    >
      {children}
    </SafeText>
  );
};

// Specialized component for card content
interface SafeCardTextProps {
  children: React.ReactNode;
  className?: string;
  heading?: boolean;
}

export const SafeCardText = ({ 
  children, 
  className, 
  heading = false 
}: SafeCardTextProps) => {
  return (
    <SafeText 
      className={cn(heading && "font-semibold", className)}
      size={heading ? "lg" : "base"}
      wrap={true}
      as={heading ? "h3" : "p"}
    >
      {children}
    </SafeText>
  );
};

// Simple utility function for adding safe text classes
export const createSafeTextClasses = (className: string = "") => {
  return cn("text-wrap-safe container-safe overflow-hidden", className);
};