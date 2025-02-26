"use client"

import { motion, useScroll } from "framer-motion"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, User, Briefcase, FolderGit2, Cpu, Award, Mail, Menu, X } from "lucide-react"
import { ThemeSwitch } from "./theme-switch"
import { useTheme } from "next-themes"
import { useMounted } from "./theme-provider"

const navItems = [
  { id: "hero", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "contact", label: "Contact", icon: Mail },
]

export function FloatingNav() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [prevScrollY, setPrevScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const mounted = useMounted()

  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      // Set isScrolled state
      setIsScrolled(window.scrollY > 10);
      
      // Special case for top of page
      if (window.scrollY < 100) {
        setActiveSection("hero");
        return;
      }
      
      // Simple approach: check each section's position
      // We'll go through sections in order and find the one that's currently at the top of the viewport
      const viewportHeight = window.innerHeight;
      const headerOffset = 100; // Approximate height of any fixed headers
      
      // Check each section in reverse order (bottom to top of page)
      // This ensures we select the section that's currently most visible
      for (const item of [...navItems].reverse()) {
        const element = document.getElementById(item.id);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        
        // If the top of the section is at or above the viewport top (with some offset)
        // and the bottom is still in view, consider it the active section
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          setActiveSection(item.id);
          return;
        }
      }
      
      // If we get here and haven't found a section, check if we're at the bottom of the page
      // If so, set the last section as active
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        setActiveSection(navItems[navItems.length - 1].id);
      }
    };

    // Initial check
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsVisible(false)
  }

  // Default background for server-side rendering
  const defaultBg = "bg-white/50 backdrop-blur-sm shadow-lg shadow-black/5 border border-black/5";
  
  // Determine background based on scroll position and theme, but only on client
  const bgClass = mounted ? (
    isScrolled
      ? isDark
        ? "bg-black/80 backdrop-blur-md shadow-xl border border-white/10"
        : "bg-white/80 backdrop-blur-md shadow-xl border border-black/10"
      : isDark
        ? "bg-black/50 backdrop-blur-sm shadow-lg shadow-black/5 border border-white/5"
        : "bg-white/50 backdrop-blur-sm shadow-lg shadow-black/5 border border-black/5"
  ) : defaultBg;

  return (
    <>
      {/* Desktop Navigation */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[98%] max-w-5xl px-2">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "rounded-xl transition-all duration-300 px-2",
            bgClass
          )}
        >
          <div className="flex h-12 items-center justify-between">
            <nav className="hidden md:block flex-1">
              <ul className="flex items-center gap-1 justify-center">
                {navItems.map((item) => (
                  <motion.li key={item.id} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-xl h-8 px-3 text-sm font-medium transition-all duration-200",
                        mounted && isDark ? "hover:bg-white/5" : "hover:bg-black/5",
                        mounted && activeSection === item.id
                          ? isDark
                            ? "text-white bg-white/10 shadow-sm hover:bg-white/15"
                            : "text-gray-900 bg-black/5 shadow-sm hover:bg-black/10"
                          : isDark
                            ? "text-white/60 hover:text-white"
                            : "text-gray-600 hover:text-gray-900",
                      )}
                      onClick={() => scrollToSection(item.id)}
                    >
                      <item.icon
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          mounted && activeSection === item.id ? "scale-110" : "scale-100",
                        )}
                      />
                      <span
                        className={cn(
                          "ml-1.5 transition-all duration-200",
                          mounted && activeSection === item.id ? "opacity-100" : "opacity-80",
                        )}
                      >
                        {item.label}
                      </span>
                    </Button>
                    {mounted && activeSection === item.id && (
                      <motion.div
                        layoutId="activeSection"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white dark:bg-gray-300"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8 p-0 rounded-xl hover:bg-white/5 text-white/80"
              onClick={() => setIsVisible(!isVisible)}
            >
              <motion.div animate={{ rotate: isVisible ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {isVisible ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </motion.div>
            </Button>

            {/* Theme Switch */}
            <div className="flex items-center">
              <div className={cn("h-4 w-px md:hidden mr-2", mounted && isDark ? "bg-white/10" : "bg-gray-300")} />
              <div className={cn("p-1 rounded-xl", mounted && isDark ? "bg-transparent" : "bg-black/5")}>
                <ThemeSwitch />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      <motion.nav
        initial={false}
        animate={{
          x: isVisible ? 0 : "100%",
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
        }}
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 p-6 flex flex-col md:hidden",
          mounted && isDark
            ? "bg-black/80 backdrop-blur-md border-l border-white/10"
            : "bg-white/80 backdrop-blur-md border-l border-black/10",
        )}
      >
        <div className="flex flex-col space-y-1 mt-16">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "justify-start rounded-xl transition-all duration-200",
                mounted && activeSection === item.id
                  ? isDark 
                    ? "bg-white/10 text-white shadow-sm"
                    : "bg-black/10 text-gray-900 shadow-sm"
                  : isDark
                    ? "text-white/60 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-black/5",
              )}
              onClick={() => scrollToSection(item.id)}
            >
              <item.icon
                className={cn(
                  "mr-2 h-4 w-4 transition-transform duration-200",
                  mounted && activeSection === item.id ? "scale-110" : "scale-100",
                )}
              />
              {item.label}
            </Button>
          ))}
        </div>
      </motion.nav>
    </>
  )
} 