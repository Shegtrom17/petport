import * as React from "react"
import { isTouchDevice } from "./useIsTouchDevice"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return isTouchDevice()
  })

  React.useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(isTouchDevice())
    }

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