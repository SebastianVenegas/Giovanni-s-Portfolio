"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

// Create a context to track if we're mounted on the client
const MountedContext = createContext(false)

// Custom hook to check if we're mounted on the client
export const useMounted = () => useContext(MountedContext)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // After mounting, we can render the theme-dependent parts
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <MountedContext.Provider value={mounted}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </MountedContext.Provider>
  )
}

