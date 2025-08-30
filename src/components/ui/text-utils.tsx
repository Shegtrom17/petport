import React from "react";
import { cn } from "@/lib/utils";

// Responsive text component that prevents overflow
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  ellipsis?: boolean;
  lines?: 1 | 2 | 3;
  wrap?: boolean;
}

export const ResponsiveText = ({ 
  children, 
  size = "base", 
  className,
  ellipsis = false,
  lines,
  wrap = true
}: ResponsiveTextProps) => {
  const baseClasses = {
    xs: "text-responsive-xs",
    sm: "text-responsive-sm", 
    base: "text-responsive-base",
    lg: "text-responsive-lg",
    xl: "text-responsive-xl",
    "2xl": "text-responsive-2xl",
    "3xl": "text-responsive-3xl",
  };

  const ellipsisClasses = {
    1: "truncate",
    2: "text-ellipsis-2", 
    3: "text-ellipsis-3",
  };

  return (
    <span 
      className={cn(
        baseClasses[size],
        wrap && "text-wrap-safe",
        ellipsis && !lines && "truncate",
        lines && ellipsisClasses[lines],
        className
      )}
    >
      {children}
    </span>
  );
};

// Button content wrapper that prevents overflow
interface ResponsiveButtonTextProps {
  children: React.ReactNode;
  className?: string;
  wrap?: boolean;
}

export const ResponsiveButtonText = ({ 
  children, 
  className,
  wrap = false 
}: ResponsiveButtonTextProps) => {
  return (
    <span 
      className={cn(
        wrap ? "btn-text-responsive-wrap" : "btn-text-responsive",
        "flex-safe",
        className
      )}
    >
      {children}
    </span>
  );
};

// Card content wrapper with safe overflow handling
interface SafeCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SafeCardContent = ({ children, className }: SafeCardContentProps) => {
  return (
    <div className={cn("card-content-safe", className)}>
      {children}
    </div>
  );
};

// Container that prevents flex item overflow
interface FlexSafeProps {
  children: React.ReactNode;
  className?: string;
}

export const FlexSafe = ({ children, className }: FlexSafeProps) => {
  return (
    <div className={cn("flex-safe container-safe", className)}>
      {children}
    </div>
  );
};