import * as React from "react"
import { isTouchDevice } from "./useIsTouchDevice"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(isTouchDevice())
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