import * as React from "react"
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"

/**
 * AzureButton - Ensures consistent azure (#5691af) background with white text
 * Use this instead of Button when you want guaranteed azure styling without hover color changes
 */
export const AzureButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          // Force azure background with white text regardless of variant
          "bg-brand-primary text-white hover:bg-brand-primary-dark hover:text-white",
          // Override any conflicting styles
          "focus-visible:ring-brand-primary",
          // For outline variant, ensure proper border
          variant === "outline" && "border-brand-primary hover:border-brand-primary-dark",
          className
        )}
        {...props}
      />
    )
  }
)
AzureButton.displayName = "AzureButton"

