import { useState, useEffect } from "react"

/**
 * Custom hook that tracks if an element with the given ID has been viewed.
 * Once the element is viewed, it stays in the "viewed" state.
 * 
 * @param elementId - The ID of the element to observe
 * @param threshold - The visibility threshold (0-1) that triggers the "viewed" state
 * @returns boolean indicating if the element has been viewed
 */
export function useHasBeenViewed(elementId: string, threshold: number = 0.1) {
  const [hasBeenViewed, setHasBeenViewed] = useState(false)
  
  useEffect(() => {
    // If already viewed, no need to observe anymore
    if (hasBeenViewed) return
    
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setHasBeenViewed(true)
        observer.disconnect()
      }
    }, { threshold })
    
    const element = document.getElementById(elementId)
    if (element) observer.observe(element)
    
    return () => {
      if (element) observer.unobserve(element)
    }
  }, [elementId, hasBeenViewed, threshold])
  
  return hasBeenViewed
} 