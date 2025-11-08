import * as React from "react"
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"

/**
 * AzureButton - Ensures consistent azure (#5691af) background with white text
 * Use this instead of Button when you want guaranteed azure styling without hover color changes
 */
export const AzureButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="azure"
        className={className}
        {...props}
      />
    )
  }
)
AzureButton.displayName = "AzureButton"

