"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useMounted } from "./theme-provider"

// Tech stack logos with paths to PNG files - Ensuring Unqork is at the end
const techStackLogos = [
  { name: "React", logo: "/images/tech-stack/react.png" },
  { name: "Next.js", logo: "/images/tech-stack/nextjs.png" },
  { name: "TypeScript", logo: "/images/tech-stack/typescript.png" },
  { name: "JavaScript", logo: "/images/tech-stack/javascript.png" },
  { name: "Node.js", logo: "/images/tech-stack/nodejs.png" },
  { name: "Python", logo: "/images/tech-stack/python.png" },
  { name: "PHP", logo: "/images/tech-stack/php.png" },
  { name: "Azure", logo: "/images/tech-stack/azure.png" },
  { name: "Laravel", logo: "/images/tech-stack/laravel.png" },
  { name: "GraphQL", logo: "/images/tech-stack/graphql.png" },
  { name: "AWS", logo: "/images/tech-stack/aws.png" },
  { name: "Docker", logo: "/images/tech-stack/docker.png" },
  { name: "Kubernetes", logo: "/images/tech-stack/kubernetes.png" },
  { name: "Tailwind", logo: "/images/tech-stack/tailwind.png" },
  { name: "MongoDB", logo: "/images/tech-stack/mongodb.png" },
  { name: "MySQL", logo: "/images/tech-stack/mysql.png" },
  { name: "Drupal", logo: "/images/tech-stack/drupal.png" },
  { name: "Magento", logo: "/images/tech-stack/magento.png" },
  { name: "WordPress", logo: "/images/tech-stack/wordpress.png" },
  { name: "Flask", logo: "/images/tech-stack/flask.png" },
  { name: "Unqork", logo: "/images/tech-stack/unqork1.png" }
]

export function TechStackBanner() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const containerRef = useRef<HTMLDivElement>(null)
  const mounted = useMounted()
  
  // Function to get consistent class names regardless of mounted state
  const getImageClassNames = (techName: string) => {
    // Base classes that are always applied
    const baseClasses = "h-10 w-auto object-contain"
    
    // Only apply theme-dependent classes if mounted
    if (!mounted) return baseClasses
    
    // Apply special styling for specific logos in dark mode
    if (isDark && (
      techName === "Next.js" || 
      techName === "AWS" || 
      techName === "Flask" || 
      techName === "Unqork" || 
      techName === "WordPress"
    )) {
      return cn(baseClasses, "filter brightness-0 invert")
    }
    
    return baseClasses
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full py-10 overflow-hidden bg-gray-50 dark:bg-[#0c0c0c] border-y border-black/5 dark:border-white/5"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1d1d1d_1px,transparent_1px),linear-gradient(to_bottom,#1d1d1d_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-gray-50 dark:from-[#0c0c0c] via-gray-50/90 dark:via-[#0c0c0c]/90 to-transparent backdrop-blur-sm" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-gray-50 dark:from-[#0c0c0c] via-gray-50/90 dark:via-[#0c0c0c]/90 to-transparent backdrop-blur-sm" />
      
      <div className="relative mx-auto max-w-7xl px-4 flex items-center">
        <div className="w-full flex items-center">
          {/* Heading */}
          <div className="mr-12 flex-shrink-0 z-20">
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">
              Tech Stack
            </p>
          </div>
          
          {/* Scrolling logos - Marquee approach */}
          <div className="w-full overflow-hidden">
            <div className="marquee">
              <div className="marquee__content">
                {techStackLogos.map((tech, index) => (
                  <div
                    key={`original-${tech.name}-${index}`}
                    className="flex-shrink-0 mx-8"
                  >
                    <div className="relative h-12 w-12 flex items-center justify-center">
                      <Image
                        src={tech.logo}
                        alt={`${tech.name} logo`}
                        width={48}
                        height={48}
                        className={getImageClassNames(tech.name)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Duplicate for seamless loop */}
              <div className="marquee__content" aria-hidden="true">
                {techStackLogos.map((tech, index) => (
                  <div
                    key={`duplicate-${tech.name}-${index}`}
                    className="flex-shrink-0 mx-8"
                  >
                    <div className="relative h-12 w-12 flex items-center justify-center">
                      <Image
                        src={tech.logo}
                        alt={`${tech.name} logo`}
                        width={48}
                        height={48}
                        className={getImageClassNames(tech.name)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS animation */}
      <style jsx global>{`
        .marquee {
          --duration: 90s;
          --gap: 1rem;
          position: relative;
          display: flex;
          overflow: hidden;
          user-select: none;
          gap: var(--gap);
        }

        .marquee__content {
          flex-shrink: 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          min-width: 100%;
          gap: var(--gap);
          animation: scroll var(--duration) linear infinite;
        }

        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-100% - var(--gap)));
          }
        }
      `}</style>
    </div>
  )
} 