"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMounted } from "./theme-provider"

export function ThemeSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const isLight = resolvedTheme === "light"
  const isSystem = theme === "system"
  const mounted = useMounted()

  // Function to cycle through themes
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  // Default styles for server-side rendering
  const defaultStyles = "bg-black/5 text-gray-900";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      className={cn(
        "relative inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
        mounted 
          ? (isDark 
              ? "bg-white/10 text-white hover:bg-white/20" 
              : "bg-black/5 text-gray-900 hover:bg-black/10")
          : defaultStyles,
        "focus-visible:outline-none focus-visible:ring-2",
        mounted && isDark
          ? "focus-visible:ring-white focus-visible:ring-offset-black"
          : "focus-visible:ring-black focus-visible:ring-offset-white",
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-4 w-4">
        {mounted && (
          <>
            {/* Dark theme icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -30 }}
              animate={{
                scale: theme === "dark" ? 1 : 0,
                opacity: theme === "dark" ? 1 : 0,
                rotate: theme === "dark" ? 0 : -30,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="h-4 w-4" />
            </motion.div>
            
            {/* Light theme icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: 30 }}
              animate={{
                scale: theme === "light" ? 1 : 0,
                opacity: theme === "light" ? 1 : 0,
                rotate: theme === "light" ? 0 : 30,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="h-4 w-4" />
            </motion.div>
            
            {/* System theme icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: 30 }}
              animate={{
                scale: theme === "system" ? 1 : 0,
                opacity: theme === "system" ? 1 : 0,
                rotate: theme === "system" ? 0 : 30,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Monitor className="h-4 w-4" />
            </motion.div>
          </>
        )}
        {!mounted && (
          <div className="flex items-center justify-center">
            <Monitor className="h-4 w-4" />
          </div>
        )}
      </div>
    </motion.button>
  )
} 