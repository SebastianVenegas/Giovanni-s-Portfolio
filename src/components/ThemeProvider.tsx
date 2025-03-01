"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Create a context to track if we're mounted on the client
const MountedContext = createContext({
  mounted: false,
  skipMountedCheck: false,
})

// Custom hook to check if we're mounted on the client
export const useMounted = () => {
  const context = useContext(MountedContext)
  return context.mounted || context.skipMountedCheck
}

export function ThemeProvider({ 
  children,
  skipMountedCheck = false
}: { 
  children: React.ReactNode;
  skipMountedCheck?: boolean;
}) {
  const [mounted, setMounted] = useState(false)

  // After mounting, we can render the theme-dependent parts
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <MountedContext.Provider value={{ mounted, skipMountedCheck }}>
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