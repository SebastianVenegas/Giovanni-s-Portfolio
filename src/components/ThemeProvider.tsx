"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Create a context to track if we're mounted on the client
const MountedContext = createContext(false)

// Custom hook to check if we're mounted on the client
export const useMounted = () => useContext(MountedContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // After mounting, we can render the theme-dependent parts
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <MountedContext.Provider value={mounted}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </MountedContext.Provider>
  )
} 