import * as React from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkTouchCapability = () => {
      // Check for touch support using multiple methods
      const hasTouchStart = 'ontouchstart' in window
      const hasMaxTouchPoints = navigator.maxTouchPoints > 0
      const hasTouchSupport = window.matchMedia('(hover: none) and (pointer: coarse)').matches
      
      // Combine all checks for reliable touch detection
      return hasTouchStart || hasMaxTouchPoints || hasTouchSupport
    }

    const updateIsMobile = () => {
      setIsMobile(checkTouchCapability())
    }

    // Initial check
    updateIsMobile()

    // Listen for orientation changes on mobile devices
    const handleOrientationChange = () => {
      setTimeout(updateIsMobile, 100) // Small delay to ensure accurate detection
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', updateIsMobile)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', updateIsMobile)
    }
  }, [])

  return !!isMobile
}
