"use client"

import { useEffect } from 'react'
import { useMounted } from './theme-provider'

export function ScrollToTop() {
  const mounted = useMounted()

  useEffect(() => {
    if (!mounted) return;
    
    // Use requestAnimationFrame to ensure this runs after the browser has had a chance to paint
    const frame = requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      })
    })
    
    return () => cancelAnimationFrame(frame)
  }, [mounted])

  // This component doesn't render anything visible
  return null
} 