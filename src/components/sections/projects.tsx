"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  ExternalLink,
  Github,
  Code,
  Server,
  Shield,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Cpu,
  BarChart,
  FileText,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useMounted } from "@/components/theme-provider"

// Enhanced projects data with more details
const projects = [
  {
    title: "TSA Enterprise Portal",
    client: "TSA",
    logo: "/images/logos/tsa.png",
    description: "Secure Next.js application with AI-driven document processing for TSA personnel management.",
    fullDescription:
      "Developed a comprehensive enterprise portal for the Transportation Security Administration that streamlines personnel management, document processing, and security clearance workflows. The system leverages advanced AI capabilities to automate document classification and data extraction, significantly reducing manual processing time and improving accuracy.",
    technicalImplementation: [
      "Implemented secure document processing pipeline using AWS Lambda and Python for OCR",
      "Integrated OpenAI's GPT-4 for automated document classification and data extraction",
      "Built responsive Next.js frontend with server-side rendering for optimal performance",
      "Deployed on Vercel with edge functions for enhanced security and speed",
    ],
    tech: ["Next.js", "Python", "AWS Lambda", "OpenAI", "Security"],
    icon: Shield,
  },
  {
    title: "New York Life Insurance Platform",
    client: "New York Life",
    logo: "/images/logos/nyl.png",
    description: "Unqork-based solution for policy management and claims processing with real-time updates.",
    fullDescription:
      "Built a comprehensive insurance platform for New York Life that handles policy management, claims processing, and customer interactions. The solution leverages Unqork's no-code platform combined with custom Node.js microservices to deliver a seamless experience for both customers and insurance agents.",
    technicalImplementation: [
      "Developed custom Unqork components for policy management workflow",
      "Created Node.js microservices for real-time policy updates and notifications",
      "Integrated Stripe payment processing with custom fraud detection",
      "Implemented role-based access control with JWT authentication",
    ],
    tech: ["Unqork", "Node.js", "API Integration", "Stripe"],
    icon: FileText,
  },
  {
    title: "USDA Analytics Dashboard",
    client: "USDA",
    logo: "/images/logos/usda.png",
    description: "HIPAA-compliant analytics platform with real-time data visualization for agricultural data.",
    fullDescription:
      "Designed and implemented a comprehensive analytics dashboard for the USDA that provides real-time insights into agricultural data. The platform adheres to HIPAA compliance standards while offering powerful visualization tools that help decision-makers understand trends, forecast outcomes, and optimize resource allocation.",
    technicalImplementation: [
      "Built real-time data visualization using D3.js and React",
      "Developed FastAPI backend for efficient data processing and analytics",
      "Implemented HIPAA-compliant data storage and transmission",
      "Created automated ETL pipelines for agricultural data processing",
    ],
    tech: ["React", "D3.js", "FastAPI", "AWS"],
    icon: BarChart,
  },
  {
    title: "UBS Wealth Management Platform",
    client: "UBS",
    logo: "/images/logos/ubs.png",
    description: "Enterprise wealth management solution with AI-driven portfolio optimization.",
    fullDescription:
      "Created a sophisticated wealth management platform for UBS that leverages artificial intelligence to optimize investment portfolios. The system analyzes market trends, client risk profiles, and financial goals to provide personalized investment recommendations and automated portfolio rebalancing.",
    technicalImplementation: [
      "Architected AI-driven portfolio optimization using TensorFlow",
      "Built Next.js frontend with TypeScript for type-safe development",
      "Implemented real-time market data integration via WebSocket",
      "Created Python microservices for financial calculations",
    ],
    tech: ["Next.js", "TypeScript", "Python", "TensorFlow"],
    icon: Cpu,
  },
  {
    title: "Aetna Claims Processing System",
    client: "Aetna",
    logo: "/images/logos/aetna.png",
    description: "ML-powered claims processing automation with fraud detection.",
    fullDescription:
      "Developed an advanced claims processing system for Aetna that automates the entire workflow from submission to approval. The platform incorporates machine learning models to detect fraudulent claims, optimize processing routes, and accelerate legitimate claims, resulting in significant cost savings and improved customer satisfaction.",
    technicalImplementation: [
      "Developed ML models for automated claims processing and fraud detection",
      "Built FastAPI backend with async processing for high throughput",
      "Created React dashboard for claims monitoring and management",
      "Implemented secure file handling and audit logging",
    ],
    tech: ["Python", "FastAPI", "ML", "React"],
    icon: Zap,
  },
]

export default function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const toggleExpand = (index: number) => {
    setExpandedProject(expandedProject === index ? null : index)
  }

  // Function to determine logo filter based on company and theme
  const getLogoFilter = (client: string) => {
    if (!mounted) return {}

    return {
      filter: resolvedTheme === "dark" ? "brightness(0) invert(1)" : "none",
      background: "transparent",
    }
  }

  // Grid background animation effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const drawGrid = () => {
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
      drawGrid()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [resolvedTheme])

  return (
    <section
      ref={ref}
      id="projects"
      className="relative min-h-screen flex items-center justify-center py-24 overflow-hidden bg-gray-100 dark:bg-[#0a0a0a]"
    >
      {/* Grid background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-50" />

      <div className="container relative max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-16"
        >
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1 rounded-full bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
            >
              Enterprise Solutions
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
            >
              Featured Projects
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Innovative enterprise solutions with advanced AI integration
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-1 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full"
            />
          </div>

          {/* Project Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "rounded-xl overflow-hidden h-full flex flex-col",
                  "bg-white/80 dark:bg-neutral-900/20",
                  "border border-neutral-200/50 dark:border-neutral-800/20", // Updated border color
                  "backdrop-blur-sm shadow-lg",
                  "hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700", // Updated hover border
                  "transition-all duration-300",
                )}
              >
                {/* Project Header with Logo */}
                <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-transparent">
                    <Image
                      src={project.logo || "/placeholder.svg"}
                      alt={`${project.client} logo`}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                      style={getLogoFilter(project.client)}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.client}</p>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-neutral-700 dark:text-neutral-300 mb-4 flex-1">{project.description}</p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.slice(0, 3).map((tech, i) => (
                      <Badge
                        key={i}
                        className="bg-neutral-100/80 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/50"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {project.tech.length > 3 && (
                      <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        +{project.tech.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(index)}
                    className="w-full justify-between text-neutral-700 dark:text-neutral-300 border-neutral-200/50 dark:border-neutral-800/20 hover:border-neutral-300 dark:hover:border-neutral-700"
                  >
                    <span>View Details</span>
                    {expandedProject === index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                  {expandedProject === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-neutral-200/50 dark:border-neutral-800/20"
                    >
                      <div className="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-900/50">
                        {/* Full Description */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <project.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            Project Overview
                          </h4>
                          <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
                            {project.fullDescription}
                          </p>
                        </div>

                        {/* Technical Implementation */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Code className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            Technical Implementation
                          </h4>
                          <ul className="space-y-2 text-sm">
                            {project.technicalImplementation.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                                <ArrowRight className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* All Technologies */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Server className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            Technologies Used
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((tech, i) => (
                              <Badge
                                key={i}
                                className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Bottom row with centered projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {projects.slice(3).map((project, index) => (
              <motion.div
                key={index + 3}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
                className={cn(
                  "rounded-xl overflow-hidden h-full flex flex-col",
                  "bg-white/80 dark:bg-neutral-900/20",
                  "border border-neutral-200/50 dark:border-neutral-800/20", // Updated border color
                  "backdrop-blur-sm shadow-lg",
                  "hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700", // Updated hover border
                  "transition-all duration-300",
                )}
              >
                {/* Project Header with Logo */}
                <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-transparent">
                    <Image
                      src={project.logo || "/placeholder.svg"}
                      alt={`${project.client} logo`}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                      style={getLogoFilter(project.client)}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.client}</p>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-neutral-700 dark:text-neutral-300 mb-4 flex-1">{project.description}</p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.slice(0, 3).map((tech, i) => (
                      <Badge
                        key={i}
                        className="bg-neutral-100/80 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/50"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {project.tech.length > 3 && (
                      <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        +{project.tech.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(index + 3)}
                    className="w-full justify-between text-neutral-700 dark:text-neutral-300 border-neutral-200/50 dark:border-neutral-800/20 hover:border-neutral-300 dark:hover:border-neutral-700"
                  >
                    <span>View Details</span>
                    {expandedProject === index + 3 ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                  {expandedProject === index + 3 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-neutral-200/50 dark:border-neutral-800/20"
                    >
                      <div className="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-900/50">
                        {/* Full Description */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <project.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            Project Overview
                          </h4>
                          <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
                            {project.fullDescription}
                          </p>
                        </div>

                        {/* Technical Implementation */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Code className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            Technical Implementation
                          </h4>
                          <ul className="space-y-2 text-sm">
                            {project.technicalImplementation.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                                <ArrowRight className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* All Technologies */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Server className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            Technologies Used
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((tech, i) => (
                              <Badge
                                key={i}
                                className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* GitHub Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center"
          >
            <a
              href="https://github.com/GiovanniV"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center h-12 px-6 rounded-lg gap-2",
                "bg-white/80 dark:bg-neutral-900/60",
                "border border-neutral-200/50 dark:border-neutral-800/20",
                "text-neutral-900 dark:text-white",
                "hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
                "hover:border-neutral-300 dark:hover:border-neutral-700",
                "transition-all duration-300",
              )}
            >
              <Github className="h-5 w-5" />
              <span className="font-medium">View More Projects</span>
              <ExternalLink className="h-4 w-4 opacity-70" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

