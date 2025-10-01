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
          "bg-[#5691af] !text-white hover:bg-[#4a7d99] hover:!text-white",
          // Override any conflicting styles
          "focus-visible:ring-[#5691af]",
          // For outline variant, ensure proper border
          variant === "outline" && "border-[#5691af] hover:border-[#4a7d99]",
          className
        )}
        {...props}
      />
    )
  }
)
AzureButton.displayName = "AzureButton"

