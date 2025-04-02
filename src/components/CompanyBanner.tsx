"use client"

import { useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useMounted } from "./theme-provider"

// Client logos with paths to PNG files
const clientLogos = [
  { name: "UBS", logo: "/images/clients/ubs.png", invertInDark: true },
  { name: "Accenture", logo: "/images/logos/accenture.png", invertInDark: true },
  { name: "Jeep", logo: "/images/clients/jeep.png" },
  { name: "TSA", logo: "/images/clients/tsa.png" },
  { name: "New York Life", logo: "/images/clients/nyl.png" },
  { name: "Ford", logo: "/images/clients/ford.png" },
  { name: "USDA", logo: "/images/clients/usda.png" },
  { name: "Aetna", logo: "/images/clients/aetna.png" },
  { name: "Starbucks", logo: "/images/clients/starbucks.png" },
  { name: "USCIS", logo: "/images/clients/uscis.png" },
  { name: "Alfa Romeo", logo: "/images/clients/alfa-romeo.png" },
  { name: "Prudential", logo: "/images/clients/prudential.png" },
  { name: "IRS", logo: "/images/clients/irs.png", scale: "h-20" },
  { name: "Chrysler", logo: "/images/clients/chrysler.png", invertInDark: true },
  { name: "AXIS Capital", logo: "/images/clients/axis.png", invertInDark: true },
  { name: "Intel", logo: "/images/clients/intel.png" },
  { name: "DeCA", logo: "/images/clients/deca.png" },
  { name: "Fiat", logo: "/images/clients/Fiat.png" },
  { name: "JAIC", logo: "/images/clients/jaic.png", scale: "h-20", invertInDark: true },
  { name: "Nestlé", logo: "/images/clients/nestle.png", invertInDark: true },
  { name: "NIC", logo: "/images/clients/nic.png" },
  { name: "Dodge Ram", logo: "/images/clients/ram.png", invertInDark: true },
  { name: "DOS", logo: "/images/clients/dos.png" },
  { name: "Mopar", logo: "/images/clients/mopar.png", invertInDark: true },
  { name: "USAID", logo: "/images/clients/usaid.png" },
  { name: "K&N Filters", logo: "/images/clients/K&n.png", invertInDark: true },
  { name: "Mint", logo: "/images/logos/mint.png" },
  { name: "Unqork", logo: "/images/tech-stack/unqork1.png", invertInDark: true },
  { name: "Born Group", logo: "/images/logos/born.png", invertInDark: true },
  { name: "Helm", logo: "/images/logos/helm.png", invertInDark: true },
  { name: "MDX Health", logo: "/images/logos/mdx.png", invertInDark: true, scale: "h-40" },
]

export function CompanyBanner() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const containerRef = useRef<HTMLDivElement>(null)
  const mounted = useMounted()
  
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
              Trusted By
            </p>
          </div>
          
          {/* Scrolling logos - Marquee approach */}
          <div className="w-full overflow-hidden">
            <div className="marquee">
              <div className="marquee__content">
                {clientLogos.map((client, index) => (
                  <div
                    key={`original-${client.name}-${index}`}
                    className="flex-shrink-0 mx-8"
                  >
                    <div className="relative h-16 w-32 flex items-center justify-center">
                      <Image
                        src={client.logo}
                        alt={`${client.name} logo`}
                        width={120}
                        height={60}
                        className={cn(
                          client.scale || "h-12",
                          "w-auto object-contain",
                          mounted && isDark && client.invertInDark ? "brightness-0 invert" : mounted && isDark && "brightness-[0.9] contrast-[1.1]"
                        )}
                        onError={(e) => {
                          // Prevent broken image icons by setting a fallback
                          const target = e.target as HTMLImageElement;
                          console.warn(`Failed to load logo for ${client.name}`);
                          // Hide the broken image
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Duplicate for seamless loop */}
              <div className="marquee__content" aria-hidden="true">
                {clientLogos.map((client, index) => (
                  <div
                    key={`duplicate-${client.name}-${index}`}
                    className="flex-shrink-0 mx-8"
                  >
                    <div className="relative h-16 w-32 flex items-center justify-center">
                      <Image
                        src={client.logo}
                        alt={`${client.name} logo`}
                        width={120}
                        height={60}
                        className={cn(
                          client.scale || "h-12",
                          "w-auto object-contain",
                          mounted && isDark && client.invertInDark ? "brightness-0 invert" : mounted && isDark && "brightness-[0.9] contrast-[1.1]"
                        )}
                        onError={(e) => {
                          // Prevent broken image icons by setting a fallback
                          const target = e.target as HTMLImageElement;
                          console.warn(`Failed to load logo for ${client.name}`);
                          // Hide the broken image
                          target.style.display = 'none';
                        }}
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