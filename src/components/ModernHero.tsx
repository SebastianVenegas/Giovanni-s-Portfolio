"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Mail,
  Code,
  Download,
  Github,
  Linkedin,
  Award,
  Briefcase,
  Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useMounted } from "./theme-provider"

const jobTitles = [
  "Cloud Infrastructure Architect",
  "Senior Full Stack Engineer",
  "Solutions Architect",
  "Enterprise Developer",
]

const terminalLines = [
  { type: "log", content: "╔════════════════════════════════════════╗" },
  { type: "log", content: "║  INITIALIZING TALENT SEARCH...         ║" },
  { type: "log", content: "╚════════════════════════════════════════╝" },
  { type: "blank", content: "" },
  { type: "comment", content: "// Search Configuration" },
  { type: "const", content: "const searchConfig = {" },
  { type: "property", content: '  role: ["Senior Full Stack Engineer", "Solutions Architect"],' },
  { type: "property", content: '  experience: "13+ years",' },
  { type: "property", content: '  level: "Elite",' },
  { type: "property", content: '  clearance: "TOP SECRET",' },
  { type: "property", content: '  availability: "Immediate"' },
  { type: "const", content: "};" },
  { type: "blank", content: "" },
  { type: "comment", content: "// Search Parameters" },
  { type: "const", content: "const criteria = {" },
  { type: "property", content: "  skills: {" },
  { type: "property", content: "    required: [" },
  { type: "array", content: '      "Next.js",' },
  { type: "array", content: '      "React",' },
  { type: "array", content: '      "Python",' },
  { type: "array", content: '      "Node.js",' },
  { type: "array", content: '      "Enterprise Architecture",' },
  { type: "array", content: '      "Drupal 11",' },
  { type: "array", content: '      "WordPress",' },
  { type: "array", content: '      "Magento",' },
  { type: "array", content: '      "Flask",' },
  { type: "array", content: '      "Unqork",' },
  { type: "array", content: '      "PHP/Laravel",' },
  { type: "array", content: '      "Enterprise CMS"' },
  { type: "property", content: "    ]," },
  { type: "property", content: "    preferred: [" },
  { type: "array", content: '      "Government Experience",' },
  { type: "array", content: '      "Cloud Architecture",' },
  { type: "array", content: '      "AI/ML Integration",' },
  { type: "array", content: '      "Headless CMS",' },
  { type: "array", content: '      "Enterprise Integration"' },
  { type: "property", content: "    ]" },
  { type: "property", content: "  }," },
  { type: "property", content: "  expertise: {" },
  { type: "property", content: '    engineering: "Senior Full Stack",' },
  { type: "property", content: '    architecture: "Solutions Design",' },
  { type: "property", content: '    leadership: "Technical Lead",' },
  { type: "property", content: "    modern_stack: {" },
  { type: "property", content: '      frontend: ["Next.js 14", "React 18", "TypeScript 5"],' },
  { type: "property", content: '      backend: ["Node.js", "Python", "PHP/Laravel", "Flask"],' },
  { type: "property", content: '      deployment: ["Vercel Edge", "AWS Lambda", "Azure"]' },
  { type: "property", content: "    }," },
  { type: "property", content: "    cms: {" },
  { type: "property", content: '      headless: ["Drupal 11 Headless", "WordPress Headless", "Strapi"],' },
  { type: "property", content: '      enterprise: ["Drupal Enterprise", "Adobe AEM", "Sitecore"],' },
  { type: "property", content: '      commerce: ["Magento", "Shopify Plus", "WooCommerce"]' },
  { type: "property", content: "    }," },
  { type: "property", content: "    nocode: {" },
  { type: "property", content: '      platforms: ["Unqork Enterprise", "Bubble.io", "OutSystems"],' },
  {
    type: "property",
    content: '      expertise: ["Workflow Automation", "Enterprise Integration", "Custom Components"]',
  },
  { type: "property", content: "    }," },
  { type: "property", content: "    cloud: {" },
  { type: "property", content: '      platforms: ["Vercel", "AWS", "Azure"],' },
  { type: "property", content: '      services: ["Serverless", "Containers", "Edge Computing"]' },
  { type: "property", content: "    }" },
  { type: "property", content: "  }" },
  { type: "const", content: "};" },
  { type: "blank", content: "" },
  { type: "comment", content: "// API Response Analysis" },
  { type: "log", content: "> api.executeQuery();" },
  {
    type: "log",
    content: `
┌─────────────────────────────────────┐
│ 🟢 Gateway       CONNECTED        │
│ 🔵 Endpoints     ALL HEALTHY      │
│ 🟡 Auth          VERIFIED         │
│ 🔒 Security      TOP SECRET       │
└─────────────────────────────────────┘
`,
  },
  { type: "blank", content: "" },
  { type: "comment", content: "// Query Results" },
  { type: "log", content: "> searchResults.analyze();" },
  {
    type: "log",
    content: JSON.stringify(
      {
        Candidate: "Giovanni Venegas",
        Role: "Senior Full Stack Engineer & Solutions Architect",
        Location: "Moreno Valley, California",
        "Match Score": "99.9%",
        "Response Time": "42ms",
        "Cache Hit": true,
        "Project Success Rate": "100%",
        "Skills Match": {
          Core: ["Next.js 14", "React 18", "Python", "Node.js", "PHP/Laravel", "Flask"],
          Enterprise: ["Drupal 11 Headless", "WordPress", "Magento", "Unqork Enterprise", "Cloud Architecture", "Fortune 500 APIs"],
          Modern: ["Edge Computing", "Serverless", "Microservices", "JAMstack"],
          Security: ["PCI-DSS", "HIPAA", "Section 508"],
        },
        "Recent Achievements": [
          "Successfully delivered 15+ enterprise projects",
          "100% client satisfaction rate",
          "Zero security incidents",
          "Consistent on-time delivery",
        ],
      },
      null,
      2,
    ),
  },
  { type: "blank", content: "" },
  { type: "comment", content: "// Final Analysis" },
  { type: "log", content: "> candidate.evaluateFit();" },
  {
    type: "log",
    content: `
┌─────────────────────────────────────────────┐
│ 🎯 Perfect Match Analysis                   │
├─────────────────────────────────────────────┤
│ ✓ Elite technical expertise                 │
│ ✓ Proven enterprise delivery track record   │
│ ✓ Immediate availability                    │
│ ✓ Top security clearance                    │
│ ✓ Location: Moreno Valley, CA               │
└─────────────────────────────────────────────┘
`,
  },
  { type: "blank", content: "" },
  { type: "log", content: "[API RESPONSE]: Perfect candidate match found!" },
  { type: "log", content: "[SYSTEM]: Candidate ready for immediate engagement" },
  { type: "blank", content: "" },
  {
    type: "log",
    content: `
╔══════════════════════════════════════════╗
║  🎯 MATCH CONFIRMED - CONNECT NOW        ║
║  📧 Giovanni@vanguardsd.com              ║
║  📱 (310) 872-9781                       ║
║  📍 Moreno Valley, CA                    ║
║  🚀 Available for Immediate Start        ║
╚══════════════════════════════════════════╝
`,
  },
  { type: "blank", content: "" },
  { type: "log", content: "[ACCESS GRANTED]: Classified Document Available" },
  { type: "log", content: "> system.downloadResume();" },
  {
    type: "log",
    content: `
┌─────────────────────────────────────────────┐
│ 🔐 CLASSIFIED DOCUMENT                      │
├─────────────────────────────────────────────┤
│ Type: PDF Resume                            │
│ Status: Ready for Download                  │
│ Security Level: TOP SECRET                  │
│ Clearance: VERIFIED                         │
└─────────────────────────────────────────────┘
`,
  },
  { type: "log", content: "[SYSTEM]: Initiating secure PDF download..." },
  { type: "log", content: "[DOWNLOAD]: <span class='cursor-pointer text-blue-400 hover:text-blue-300 hover:underline' onclick='document.getElementById(\"download-resume-btn\").click()'>Click here to download resume</span>" },
]

export default function ModernHero() {
  const [currentJobTitle, setCurrentJobTitle] = useState(0)
  const [jobTitleText, setJobTitleText] = useState("")
  const [typedLines, setTypedLines] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const { resolvedTheme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMounted = useRef(true)
  const mounted = useMounted()

  // Cleanup function for all animations when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      setIsAnimating(false);
    };
  }, []);

  // Hide scroll indicator when scrolling
  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  useEffect(() => {
    if (!isAnimating) return;
    
    let timer: NodeJS.Timeout | null = null

    const typeJobTitle = (title: string, index: number) => {
      if (!isMounted.current) return;
      
      if (index <= title.length) {
        setJobTitleText(title.slice(0, index))
        timer = setTimeout(() => typeJobTitle(title, index + 1), 50)
      } else {
        timer = setTimeout(() => {
          if (isMounted.current) {
            setCurrentJobTitle((prev) => (prev + 1) % jobTitles.length)
          }
        }, 2000)
      }
    }

    typeJobTitle(jobTitles[currentJobTitle], 0)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [currentJobTitle, isAnimating])

  useEffect(() => {
    if (!isAnimating) return;
    
    let currentLineIndex = 0
    let currentCharIndex = 0
    let timer: NodeJS.Timeout | null = null

    const typeNextCharacter = () => {
      if (!isMounted.current) return;
      
      if (currentLineIndex < terminalLines.length) {
        const currentLine = terminalLines[currentLineIndex]
        if (currentCharIndex < currentLine.content.length) {
          setTypedLines((prev) => {
            const newLines = [...prev]
            if (!newLines[currentLineIndex]) {
              newLines[currentLineIndex] = ""
            }
            newLines[currentLineIndex] = currentLine.content.slice(0, currentCharIndex + 1)
            return newLines
          })
          currentCharIndex++
          // Scroll to bottom after each character
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
          }
          timer = setTimeout(typeNextCharacter, 5)
        } else {
          currentLineIndex++
          currentCharIndex = 0
          // Scroll to bottom after each line
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
          }
          timer = setTimeout(typeNextCharacter, 100)
        }
      } else {
        controls.start({ opacity: 1, transition: { duration: 0.5 } })
      }
    }

    // Wrap in setTimeout to ensure it runs after hydration
    const initTimer = setTimeout(() => {
      if (isMounted.current) {
        typeNextCharacter();
      }
    }, 100);

    return () => {
      if (timer) clearTimeout(timer)
      clearTimeout(initTimer)
    }
  }, [controls, isAnimating])

  // Add a new useEffect to handle scrolling when typedLines changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [typedLines])

  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const drawGrid = () => {
      if (!ctx || !canvas || !isMounted.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const isDark = resolvedTheme === "dark"
      const gridSize = 40
      const lineColor = isDark ? "rgba(255, 255, 255, " : "rgba(0, 0, 0, "

      // Draw vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        const opacity = Math.abs(Math.sin((x + time) * 0.03)) * 0.06 + 0.03
        ctx.strokeStyle = lineColor + opacity + ")"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Draw horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        const opacity = Math.abs(Math.sin((y + time) * 0.03)) * 0.06 + 0.03
        ctx.strokeStyle = lineColor + opacity + ")"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      time += 0.4
    }

    const animate = () => {
      if (!isMounted.current) return;
      drawGrid()
      animationFrameId = requestAnimationFrame(animate)
    }

    // Delay animation start to ensure it runs after hydration
    const startAnimationTimer = setTimeout(() => {
      if (isMounted.current) {
        animate();
      }
    }, 100);

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      clearTimeout(startAnimationTimer)
    }
  }, [resolvedTheme, mounted])

  const handleDownloadResume = () => {
    try {
      // Create a link element
      const link = document.createElement('a');
      
      // Set the download attribute with the desired filename
      link.download = "Giovanni-Venegas-Resume-2025.pdf";
      
      // Set the href to the PDF URL
      link.href = "/resume/Giovanni-Venegas-Resume-2025.pdf";
      
      // Append to the document
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 overflow-hidden bg-gray-100 dark:bg-[#0a0a0a]">
      {mounted && <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-50" />}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 w-full">
          {/* Profile Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 z-10 mt-16 sm:mt-20 lg:mt-0">
            {/* Profile Image */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-48 h-48 group"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary/10 to-transparent dark:from-gray-500/10 blur-xl" />
              <div className="relative rounded-full overflow-hidden border border-primary/10 dark:border-gray-600/20 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20(1)-gSjQPWMFCuOdmDa27oW20ebZBwDev0.png"
                  alt="Giovanni Venegas"
                  width={192}
                  height={192}
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              Giovanni Venegas
            </motion.h1>

            {/* Job Title */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl sm:text-2xl text-gray-600 dark:text-white/60 font-light"
            >
              {jobTitleText}
              <span className="typing-cursor" />
            </motion.p>

            {/* Brief Introduction */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-gray-600 dark:text-white/60 max-w-lg"
            >
              Passionate about crafting robust, scalable solutions for enterprise-level challenges. With over a decade
              of experience, I specialize in full-stack development, cloud architecture, and AI integration.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-6 mt-4"
            >
              <div className="flex items-center text-gray-800 dark:text-white">
                <Briefcase className="w-5 h-5 mr-2 text-primary dark:text-gray-300" />
                <span>13+ Years Experience</span>
              </div>
              <div className="flex items-center text-gray-800 dark:text-white">
                <Award className="w-5 h-5 mr-2 text-primary dark:text-gray-300" />
                <span>Certified</span>
              </div>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/nextjs.png" 
                    alt="Next.js" 
                    fill 
                    className={cn(
                      "object-contain",
                      resolvedTheme === "dark" && "filter brightness-0 invert"
                    )}
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/react.png" 
                    alt="React" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/typescript.png" 
                    alt="TypeScript" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/nodejs.png" 
                    alt="Node.js" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/python.png" 
                    alt="Python" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/aws.png" 
                    alt="AWS" 
                    fill 
                    className={cn(
                      "object-contain",
                      resolvedTheme === "dark" && "filter brightness-0 invert"
                    )}
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/docker.png" 
                    alt="Docker"  
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/graphql.png" 
                    alt="GraphQL" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/javascript.png" 
                    alt="JavaScript" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              {/* New technologies */}
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/drupal.png" 
                    alt="Drupal" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/magento.png" 
                    alt="Magento" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/wordpress.png" 
                    alt="WordPress" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/flask.png" 
                    alt="Flask" 
                    fill 
                    className={cn(
                      "object-contain",
                      resolvedTheme === "dark" && "filter brightness-0 invert"
                    )}
                  />
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/images/tech-stack/unqork1.png" 
                    alt="Unqork" 
                    fill 
                    className={cn(
                      "object-contain",
                      resolvedTheme === "dark" && "filter brightness-0 invert"
                    )}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button
                className={cn(
                  "w-full sm:w-[200px] h-12 rounded-xl text-base font-medium",
                  "bg-neutral-900 hover:bg-neutral-800 text-white",
                  "dark:bg-white dark:hover:bg-neutral-200 dark:text-black",
                )}
                onClick={() => (window.location.href = "mailto:contact@giovanniv.com")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Me
              </Button>
              
              <Button
                className={cn(
                  "w-full sm:w-[200px] h-12 rounded-xl text-base font-medium",
                  "bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200",
                  "dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-white dark:border-neutral-800",
                )}
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Code className="mr-2 h-4 w-4" />
                View My Work
              </Button>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative w-full sm:w-[200px]"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-30 blur-md animate-pulse" />
                
                <Button
                  className={cn(
                    "w-full h-12 rounded-xl text-base font-medium relative z-10",
                    "bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200",
                    "dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-white dark:border-neutral-800",
                  )}
                  onClick={() => {
                    console.log("Opening chat box in sidebar mode");
                    // Try multiple methods to ensure the chat box opens in sidebar mode
                    try {
                      const chatBox = document.querySelector('.chat-box');
                      if (chatBox) {
                        // @ts-ignore
                        chatBox.style.display = 'block';
                        
                        // First, make sure the chat is open
                        const toggleButton = document.querySelector('.chat-toggle-button');
                        if (toggleButton) {
                          // @ts-ignore
                          toggleButton.click();
                        }
                        
                        // Then, find and click the sidebar mode button
                        setTimeout(() => {
                          const sidebarButton = document.querySelector('.sidebar-mode-button');
                          if (sidebarButton) {
                            // @ts-ignore
                            sidebarButton.click();
                          } else {
                            // Try to find the sidebar button by its icon or other attributes
                            const allButtons = document.querySelectorAll('button');
                            for (const btn of allButtons) {
                              if (btn.innerHTML.includes('Layout') || 
                                  btn.getAttribute('aria-label')?.includes('sidebar') ||
                                  btn.classList.contains('sidebar-toggle')) {
                                btn.click();
                                break;
                              }
                            }
                          }
                        }, 300); // Small delay to ensure chat is open first
                      } else {
                        // Alternative: try to find the button by other means
                        const chatButtons = document.querySelectorAll('button');
                        for (const btn of chatButtons) {
                          if (btn.innerHTML.includes('MessageSquare') || 
                              btn.classList.contains('chat-toggle-button') ||
                              btn.getAttribute('aria-label')?.includes('chat')) {
                            btn.click();
                            
                            // Then try to activate sidebar mode
                            setTimeout(() => {
                              const allButtons = document.querySelectorAll('button');
                              for (const sidebarBtn of allButtons) {
                                if (sidebarBtn.innerHTML.includes('Layout') || 
                                    sidebarBtn.getAttribute('aria-label')?.includes('sidebar') ||
                                    sidebarBtn.classList.contains('sidebar-toggle')) {
                                  sidebarBtn.click();
                                  break;
                                }
                              }
                            }, 300);
                            break;
                          }
                        }
                      }
                    } catch (err) {
                      console.error("Error opening chat in sidebar mode:", err);
                    }
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400 animate-pulse" />
                  <span className="relative">
                    AI Assistant
                    <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></span>
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex gap-6"
            >
              <a href="https://github.com/GiovanniV" target="_blank" rel="noopener noreferrer">
                <Github className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" />
              </a>
              <a href="https://www.linkedin.com/in/giovannivenegas" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" />
              </a>
            </motion.div>
          </div>

          {/* Right Side - Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div
              className={cn(
                "rounded-xl overflow-hidden shadow-xl backdrop-blur-sm",
                "dark:border-white/10 dark:bg-black/30",
                "border border-black/10 bg-white/70",
              )}
            >
              {/* Terminal Header */}
              <div className={cn("flex items-center justify-between px-4 py-3", "dark:bg-black/50", "bg-gray-100/80")}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-sm font-mono text-gray-600 dark:text-white/80">
                    giovanni-venegas ~ developer-profile
                  </span>
                </div>
              </div>

              {/* Terminal Content */}
              <div className="relative h-[600px]">
                <div
                  ref={terminalRef}
                  className={cn(
                    "p-6 font-mono text-sm overflow-y-auto h-full transition-colors duration-200 rounded-b-xl",
                    "scrollbar-thin scrollbar-track-transparent",
                    "dark:scrollbar-thumb-white/10 dark:hover:scrollbar-thumb-white/20",
                    "scrollbar-thumb-black/10 hover:scrollbar-thumb-black/20",
                  )}
                  style={mounted ? {
                    backgroundColor: resolvedTheme === "dark" ? "var(--terminal-bg)" : "#f8f9fa",
                    color: resolvedTheme === "dark" ? "var(--terminal-text)" : "#1a1a1a",
                  } : {}}
                >
                  {typedLines.filter(line => line !== undefined).map((line, index) => (
                    <div
                      key={index}
                      className={cn("flex whitespace-pre terminal-line", {
                        "text-green-500/90 dark:text-green-400/90": terminalLines[index]?.type === "log",
                        "text-gray-700/90 dark:text-gray-300/90": terminalLines[index]?.type === "const",
                        "text-yellow-500/90 dark:text-yellow-400/90": terminalLines[index]?.type === "property",
                        "text-purple-500/90 dark:text-gray-400/90": terminalLines[index]?.type === "array",
                        "text-gray-500/90 dark:text-gray-400/90": terminalLines[index]?.type === "comment",
                      })}
                    >
                      {typeof line === 'string' && line.includes('<span') ? (
                        <span 
                          className="flex-1" 
                          dangerouslySetInnerHTML={{ __html: line }}
                        />
                      ) : (
                        <span className="flex-1">{line}</span>
                      )}
                    </div>
                  ))}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={controls}
                    className="inline-block w-2 h-5 align-middle bg-gray-600/50 dark:bg-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Download Resume Button - Outside Terminal */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-6"
            >
              <Button
                variant="outline"
                size="lg"
                id="download-resume-btn"
                className={cn(
                  "w-full h-14 rounded-xl",
                  "bg-black/5 dark:bg-white/5",
                  "hover:bg-black/10 dark:hover:bg-white/10",
                  "text-gray-900 dark:text-white",
                  "border border-gray-200 dark:border-gray-800",
                  "hover:border-gray-700 dark:hover:border-gray-600",
                  "transition-all duration-300",
                )}
                onClick={handleDownloadResume}
              >
                <div className="flex items-center justify-center gap-3">
                  <Download className="h-5 w-5" />
                  <span className="font-medium">Download Resume</span>
                </div>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: showScrollIndicator ? 1 : 0,
          y: showScrollIndicator ? 0 : 20
        }}
        transition={{ 
          duration: 0.5,
          delay: showScrollIndicator ? 1.2 : 0,
        }}
        className="absolute bottom-8 left-0 right-0 mx-auto w-max z-20 pointer-events-auto"
      >
        <motion.div
          animate={{ 
            y: [0, 10, 0],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatType: "loop" 
          }}
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
          className="cursor-pointer flex flex-col items-center"
        >
          <span className={cn(
            "text-sm font-medium mb-2",
            "text-gray-600 dark:text-gray-400"
          )}>
            Scroll Down
          </span>
          <div className={cn(
            "p-3 rounded-full",
            "bg-black/5 dark:bg-white/10",
            "hover:bg-black/10 dark:hover:bg-white/20",
            "transition-colors duration-300",
            "shadow-md"
          )}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-600 dark:text-gray-400"
            >
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}


