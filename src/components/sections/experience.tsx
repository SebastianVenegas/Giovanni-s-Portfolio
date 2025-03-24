"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Calendar, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Award, Briefcase, Code, Download, ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHasBeenViewed } from "@/hooks/useHasBeenViewed"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useMounted } from "@/components/theme-provider"

// Enhanced experience data with more details
const experiences = [
  {
    title: "Senior Full Stack Engineer & Solutions Architect",
    company: "Auxo Solutions",
    logo: "/images/logos/auxo.png",
    website: "https://www.auxosolutions.io/",
    period: "Feb 2024 – Present",
    location: "Remote",
    description: "Enterprise software consultancy specializing in digital transformation and AI integration.",
    achievements: [
      "Architected Next.js and Unqork-based solutions for major financial & insurance clients: UBS, New York Life, Aetna, Prudential, AXIS Capital",
      "Integrated advanced LLM APIs (OpenAI) to power AI-driven workflows, enhancing throughput by 40%",
      "Developed Python (FastAPI) and PHP (Laravel) microservices with Unqork modules for seamless data pipelines",
      "Deployed serverless functions on Vercel's edge runtime with JWT authentication",
      "Led cross-functional developer teams using Agile methodologies via Jira"
    ],
    technologies: ["Next.js", "React", "TypeScript", "Node.js", "Unqork", "OpenAI", "AWS", "Vercel", "Python", "FastAPI", "PHP", "Laravel", "JWT"],
    keyProjects: [
      {
        name: "UBS Enterprise Wealth Management Platform",
        description: "Enterprise wealth management platform with AI-driven portfolio optimization"
      },
      {
        name: "New York Life Policy Management System",
        description: "Policy management system with real-time underwriting capabilities"
      },
      {
        name: "Aetna Claims Processing",
        description: "Claims processing automation with ML-powered fraud detection"
      },
      {
        name: "Prudential Financial Services Platform",
        description: "Financial services platform with integrated advisory tools"
      },
      {
        name: "AXIS Capital Insurance Underwriting",
        description: "Insurance underwriting platform with automated risk assessment"
      }
    ]
  },
  {
    title: "Full Stack Developer",
    company: "Metro Star",
    logo: "/images/logos/MetroStar.png",
    website: "https://www.metrostar.com",
    period: "June 2023 – Present",
    location: "Remote / Washington, D.C.",
    description: "Developing scalable full-stack solutions for USDA Farmers.gov platform, delivering enhanced data visibility and user experiences for American farmers.",
    achievements: [
      "Built front-end features using React, Next.js, and TypeScript, ensuring responsive, accessible, and 508-compliant interfaces for high-impact USDA tools",
      "Engineered robust back-end services using Node.js, Express, and PostgreSQL, integrating seamlessly with legacy USDA data pipelines",
      "Played a key role in the Agile team, contributing to sprint planning, code reviews, and iterative feature development in alignment with USDA's modernization goals",
      "Successfully launched multiple updates and tools across commodity reporting dashboards, disaster assistance applications, and farmer support workflows",
      "Collaborated with designers, product owners, and federal stakeholders to ensure technical feasibility, compliance, and long-term maintainability",
      "Actively contributed to MetroStar's mission to modernize government digital services through secure, efficient, and user-centered applications"
    ],
    technologies: ["React", "Next.js", "TypeScript", "Node.js", "Express", "PostgreSQL", "Agile", "Section 508", "REST API"],
    keyProjects: [
      {
        name: "USDA Farmers.gov Platform",
        description: "Modernized platform providing tools and resources for American farmers with enhanced data visibility"
      },
      {
        name: "Commodity Reporting Dashboard",
        description: "Interactive reporting system for agricultural commodity data with real-time analytics"
      }
    ]
  },
  {
    title: "Senior Software Developer",
    company: "Accenture Federal",
    logo: "/images/logos/accenture.png",
    website: "https://www.accenture.com/us-en/services/us-federal-government",
    period: "June 2019 – Present",
    location: "Washington, D.C. (Hybrid)",
    description: "Developing secure, compliant applications for federal agencies with focus on modernization and AI integration.",
    achievements: [
      "Designed secure Next.js applications for TSA, IRS, DeCA, JAIC, NIC, DOS, USAID, USCIS",
      "Modernized Drupal (v7 → v11) with Next.js headless architecture, improving performance by 65%",
      "Led federal-level AI integration for document processing and fraud detection",
      "Implemented Section 508 compliance across 12+ government platforms",
      "Reduced deployment time by 40% through CI/CD pipeline optimization",
      "Integrated LLM APIs, reducing manual data handling by 35% across multiple agency platforms",
      "Developed Python/Node.js microservices on AWS (Lambda, ECS) with zero downtime",
      "Utilized Unqork to prototype no-code solutions, improving workflow efficiency by 20%"
    ],
    technologies: ["Next.js", "React", "TypeScript", "Drupal", "PHP", "Python", "AWS GovCloud", "Azure Government"],
    keyProjects: [
      {
        name: "TSA Secure Flight Portal",
        description: "Passenger screening system with real-time threat assessment"
      },
      {
        name: "IRS Tax Filing Platform",
        description: "Modernized tax processing system with AI-assisted form validation"
      }
    ]
  },
  {
    title: "Senior Software Developer",
    company: "Mint Ultra Mobile",
    logo: "/images/logos/mint.png",
    website: "https://www.mintmobile.com",
    period: "March 2021 – Jan 2024",
    location: "Los Angeles, CA (Remote)",
    description: "Led the transformation of traditional e-commerce platforms to modern headless architecture with focus on performance and security.",
    achievements: [
      "Transformed WordPress e-commerce sites into headless Next.js platforms, increasing page load speed by 75%",
      "Developed secure payment gateways for PCI-compliant transactions processing $500K+ monthly",
      "Implemented real-time inventory management system across 5 distribution centers",
      "Reduced cart abandonment by 35% through optimized checkout experience",
      "Built custom analytics dashboard tracking user behavior and conversion metrics"
    ],
    technologies: ["Next.js", "React", "WordPress", "WooCommerce", "PHP", "MySQL", "Stripe", "AWS"],
    keyProjects: [
      {
        name: "Ultra Mobile E-commerce Platform",
        description: "Headless commerce solution with 99.9% uptime and 300ms page loads"
      },
      {
        name: "Subscription Management System",
        description: "Automated billing and service provisioning for 50,000+ customers"
      }
    ]
  },
  {
    title: "Lead Drupal Developer",
    company: "HELM",
    logo: "/images/logos/helm.png",
    website: "https://www.helm.com",
    period: "June 2019 – April 2021",
    location: "Plymouth, MI",
    description: "Led development of enterprise-level Drupal solutions with focus on e-commerce and content management systems.",
    achievements: [
      "Architected and developed e-commerce platforms for major retail clients including K&N Filters",
      "Integrated LLM-powered recommendation engines increasing conversion rates by 28%",
      "Optimized SEO and site performance through SSR implementation, improving page load times by 65%",
      "Directed Agile development teams using Jira for robust solution delivery",
      "Implemented CI/CD pipelines reducing deployment time by 40%"
    ],
    technologies: ["Drupal", "PHP", "JavaScript", "MySQL", "Docker", "AWS", "Jenkins", "Jira"],
    keyProjects: [
      {
        name: "K&N Filters E-commerce Platform",
        description: "High-performance automotive parts e-commerce system with real-time inventory"
      },
      {
        name: "Enterprise CMS Migration",
        description: "Large-scale migration from Drupal 7 to Drupal 9 with zero downtime"
      }
    ]
  },
  {
    title: "Senior Software Developer",
    company: "The Born Group",
    logo: "/images/logos/born.png",
    website: "https://www.borngroup.com",
    period: "July 2017 – May 2019",
    location: "New York, NY",
    description: "Developed enterprise websites and e-commerce platforms for major global brands with focus on performance and user experience.",
    achievements: [
      "Built enterprise websites for major brands including Nestlé, Starbucks, and Intel",
      "Integrated secure payment processing systems handling over $1M in daily transactions",
      "Optimized front-end and back-end performance, reducing page load times by 40%",
      "Led Agile development cycles using Jira, ensuring on-time delivery of all projects",
      "Implemented responsive design principles, improving mobile conversion rates by 35%"
    ],
    technologies: ["React", "Node.js", "PHP", "MySQL", "AWS", "Docker", "Kubernetes", "Magento"],
    keyProjects: [
      {
        name: "Nestlé Corporate Website",
        description: "Global corporate website with multi-language support and content management"
      },
      {
        name: "Starbucks E-commerce Platform",
        description: "Custom e-commerce solution for merchandise and subscription coffee service"
      }
    ]
  },
  {
    title: "Senior Software Developer",
    company: "MDX Health",
    logo: "/images/logos/mdx.png",
    website: "https://mdxhealth.com",
    period: "December 2014 – June 2017",
    location: "Irvine, CA",
    description: "Architected and developed HIPAA-compliant healthcare applications with focus on security, compliance, and user experience.",
    achievements: [
      "Built HIPAA-compliant medical data sharing platform used by 50+ healthcare providers",
      "Architected secure patient record management system with end-to-end encryption",
      "Implemented Section 508 accessibility compliance across all patient-facing applications",
      "Coordinated with medical professionals to optimize UX for clinical workflows",
      "Developed real-time analytics dashboard for monitoring patient outcomes"
    ],
    technologies: ["React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "Redis", "ElasticSearch"],
    keyProjects: [
      {
        name: "Patient Data Exchange Platform",
        description: "Secure platform for sharing medical data between healthcare providers"
      },
      {
        name: "Clinical Decision Support System",
        description: "AI-assisted diagnostic tool for oncology specialists"
      }
    ]
  }
]

export function Experience() {
  const hasBeenViewed = useHasBeenViewed("experience")
  const [expandedJob, setExpandedJob] = useState<number | null>(null)
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const [currentPage, setCurrentPage] = useState(0)
  const experiencesPerPage = 3
  const totalPages = Math.ceil(experiences.length / experiencesPerPage)
  
  const toggleExpand = (index: number) => {
    setExpandedJob(expandedJob === index ? null : index)
  }
  
  // Helper function for reliable scrolling across devices
  const scrollToExperienceSection = () => {
    // Small delay to ensure state updates have completed
    setTimeout(() => {
      // Try multiple approaches for maximum compatibility
      const experienceSection = document.getElementById('experience')
      
      if (experienceSection) {
        // Method 1: scrollIntoView (most browsers)
        experienceSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        
        // Method 2: Fallback for iOS Safari and other mobile browsers
        setTimeout(() => {
          const yOffset = experienceSection.getBoundingClientRect().top + window.pageYOffset
          window.scrollTo({
            top: yOffset,
            behavior: 'smooth'
          })
        }, 100)
      }
    }, 50)
  }
  
  const nextPage = () => {
    setExpandedJob(null)
    setCurrentPage((prev) => (prev + 1) % totalPages)
    // Scroll to the top of the experience section
    scrollToExperienceSection()
  }
  
  const prevPage = () => {
    setExpandedJob(null)
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
    // Scroll to the top of the experience section
    scrollToExperienceSection()
  }
  
  const currentExperiences = experiences.slice(
    currentPage * experiencesPerPage,
    (currentPage + 1) * experiencesPerPage
  )
  
  // Function to determine logo filter based on company and theme
  const getLogoFilter = (company: string) => {
    if (!mounted) return {}
    
    // These logos need to be white in dark mode (dark logos that need inversion)
    const needsInversionInDark = [
      "UBS",
      "AXIS Capital", 
      "Nestlé",
      "Chrysler", 
      "Mopar", 
      "K&N Filters",
      "JAIC",
      "Dodge Ram",
      "Unqork",
      "Accenture Federal",
      "The Born Group",
      "HELM",
      "MDX Health",
      "Metro Star"
    ]
    
    if (needsInversionInDark.includes(company)) {
      return {
        filter: resolvedTheme === "dark" 
          ? "brightness(0) invert(1)" // White in dark mode
          : "none" // Original in light mode
      }
    }
    
    // Auxo needs special handling for light mode too
    if (company === "Auxo Solutions") {
      return {
        filter: resolvedTheme === "dark" 
          ? "brightness(0) invert(1)" // White in dark mode
          : "brightness(0)" // Black in light mode
      }
    }
    
    // All other logos should maintain their original colors with slight adjustment in dark mode
    return {
      filter: resolvedTheme === "dark" ? "brightness(1) contrast(1)" : "none"
    }
  }
  
  // Helper function for client image styling
  const getImageStyle = (clientName = "") => {
    // Don't apply any styles if not mounted to ensure server/client match
    if (!mounted) return {}
    
    // List of clients/brands that need white logos in dark mode
    const needsInversionInDark = [
      "UBS",
      "AXIS Capital", 
      "Nestlé",
      "Chrysler", 
      "Mopar", 
      "K&N Filters",
      "JAIC",
      "Dodge Ram",
      "Unqork",
      "Accenture",
      "Born Group",
      "Helm",
      "MDX Health",
      "Metro Star"
    ]
    
    // Apply dark mode filter only when mounted and only for clients that need it
    if (needsInversionInDark.includes(clientName) && resolvedTheme === "dark") {
      return { filter: "brightness(0) invert(1)" }
    }
    
    // Return empty style for other clients or in light mode
    return {}
  }
  
  // Function to determine logo size based on company
  const getLogoSize = (company: string) => {
    if (company === "MDX Health") {
      return {
        scale: "scale-125" // Scale up MDX Health logo by 25%
      }
    }
    
    return {
      scale: ""
    }
  }
  
  return (
    <section id="experience" className="relative min-h-screen flex items-center justify-center py-24 overflow-hidden bg-gray-100 dark:bg-[#0a0a0a]">
      {/* Background with reduced opacity */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1d1d1d_1px,transparent_1px),linear-gradient(to_bottom,#1d1d1d_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      
      <div className="container relative max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-16"
        >
          <div className="text-center space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              Professional Experience
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Over 13 years building enterprise solutions and leading technical teams
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={hasBeenViewed ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-1 mx-auto bg-gray-300 dark:bg-gray-600/50 rounded-full"
            />
          </div>
          
          <div className="space-y-16">
            {currentExperiences.map((exp, index) => {
              const actualIndex = currentPage * experiencesPerPage + index;
              return (
                <motion.div
                  key={actualIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-0 md:pl-8"
                >
                  {/* Timeline Line - Hidden on mobile */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] hidden md:block bg-gradient-to-b from-gray-300 via-gray-200 to-gray-100 dark:from-gray-600/50 dark:via-gray-600/20 dark:to-gray-600/10" />
                  
                  {/* Timeline Dot - Hidden on mobile */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={hasBeenViewed ? { scale: 1 } : {}}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 + (index * 0.1) }}
                    className="absolute -left-[9px] top-0 h-5 w-5 rounded-full bg-white dark:bg-black border-2 border-black/30 dark:border-black/40 hidden md:block"
                  />
                  
                  <div className={cn(
                    "rounded-xl p-8",
                    "bg-white/70 dark:bg-black/30",
                    "border border-black/5 dark:border-white/5",
                    "backdrop-blur-sm shadow-xl",
                    "hover:border-black/15 dark:hover:border-black/30",
                    "transition-all duration-300"
                  )}>
                    <div className="space-y-6">
                      {/* Top section with logo and title - Changed to row layout */}
                      <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                        {/* Company Logo - Left aligned on desktop */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={hasBeenViewed ? { opacity: 1, scale: 1 } : {}}
                          transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "relative w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center",
                            "border border-black/5 dark:border-white/5",
                            "shadow-lg hover:shadow-xl",
                            "transition-all duration-300",
                            "bg-white dark:bg-black p-6",
                            "mx-auto md:mx-0" // Center on mobile, left on desktop
                          )}
                        >
                          <Image
                            src={exp.logo}
                            alt={`${exp.company} logo`}
                            width={160}
                            height={160}
                            className="w-[85%] h-[85%] object-contain"
                            style={getLogoFilter(exp.company)}
                          />
                        </motion.div>
                        
                        {/* Title and Company - Content section */}
                        <div className="flex-1 space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {exp.title}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-xl text-gray-700 dark:text-gray-300">
                              <span className="font-medium">{exp.company}</span>
                              <a 
                                href={exp.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                          
                          {/* Details section */}
                          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <span className="font-medium">{exp.period}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
                                <Briefcase className="h-5 w-5" />
                              </div>
                              <span className="font-medium">{exp.location}</span>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-center md:text-left text-lg text-gray-600 dark:text-gray-300">
                            {exp.description}
                          </p>
                          
                          {/* Technology Tags */}
                          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                            {exp.technologies.map((tech, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={hasBeenViewed ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.3, delay: 0.3 + (i * 0.05) }}
                              >
                                <Badge 
                                  className="bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 px-3 py-1 text-sm"
                                >
                                  <Code className="h-3 w-3 mr-2" />
                                  {tech}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Client Showcase - Always visible for Auxo Solutions */}
                      {exp.company === "Auxo Solutions" && (
                        <div className="space-y-4 mt-6">
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                            <Building2 className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-400" />
                            Client Solutions
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Architected Next.js and Unqork-based solutions for major financial & insurance clients:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {/* UBS */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.ubs.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/ubs.png"
                                    alt="UBS"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("UBS")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">UBS</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Enterprise wealth management platform with AI-driven portfolio optimization
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* New York Life */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.newyorklife.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/nyl.png"
                                    alt="New York Life"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("New York Life")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">New York Life</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Policy management system with real-time underwriting capabilities
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Aetna */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.aetna.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/aetna.png"
                                    alt="Aetna"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Aetna")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Aetna</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Claims processing automation with ML-powered fraud detection
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Prudential */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.prudential.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/prudential.png"
                                    alt="Prudential"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Prudential")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Prudential</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Financial services platform with integrated advisory tools
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* AXIS Capital */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.axiscapital.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/axis.png"
                                    alt="AXIS Capital"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("AXIS Capital")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">AXIS Capital</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Insurance underwriting platform with automated risk assessment
                                </p>
                              </a>
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* Client Showcase - Always visible for Metro Star */}
                      {exp.company === "Metro Star" && (
                        <div className="space-y-4 mt-6">
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                            <Building2 className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-400" />
                            Client Solutions
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Developed scalable full-stack solutions for USDA platform:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            {/* USDA */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.usda.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/usda.png"
                                    alt="USDA"
                                    width={120}
                                    height={60}
                                    className="object-contain h-14"
                                    style={getImageStyle("USDA")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">U.S. Department of Agriculture</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Modernization programs for agricultural data management systems
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Farmers.gov */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.farmers.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/logos/Farmers.png"
                                    alt="Farmers.gov"
                                    width={120}
                                    height={60}
                                    className="object-contain h-14"
                                    style={getImageStyle("Farmers.gov")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Farmers.gov</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Platform providing tools and resources for American farmers with enhanced data visibility
                                </p>
                              </a>
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* Client Showcase - Always visible for Accenture Federal */}
                      {exp.company === "Accenture Federal" && (
                        <div className="space-y-4 mt-6">
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                            <Building2 className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-400" />
                            Client Solutions
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Built secure Next.js/React applications for federal agencies:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {/* TSA */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.tsa.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/tsa.png"
                                    alt="TSA"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("TSA")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Transportation Security Administration</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Personnel management system with security clearance tracking
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* IRS */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.irs.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/irs.png"
                                    alt="IRS"
                                    width={120}
                                    height={60}
                                    className="object-contain h-20 w-auto"
                                    style={getImageStyle("IRS")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Internal Revenue Service</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Tax processing platform with automated compliance checks
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* DeCA */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.commissaries.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/deca.png"
                                    alt="Defense Commissary Agency"
                                    width={120}
                                    height={60}
                                    className="object-contain h-16 w-auto"
                                    style={getImageStyle("DeCA")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Defense Commissary Agency</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Inventory management system with AI-driven demand forecasting
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* JAIC */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.ai.mil" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/jaic.png"
                                    alt="Joint Artificial Intelligence Center"
                                    width={120}
                                    height={60}
                                    className="object-contain h-20 w-auto"
                                    style={getImageStyle("JAIC")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Joint Artificial Intelligence Center</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  AI/ML model deployment platform for defense applications
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* NIC */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://nicic.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/nic.png"
                                    alt="National Institute of Corrections"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("NIC")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">National Institute of Corrections</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Secure training and resource management platform
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* DOS */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.6 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.state.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/dos.png"
                                    alt="Department of State"
                                    width={120}
                                    height={60}
                                    className="object-contain h-16 w-auto"
                                    style={getImageStyle("DOS")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Department of State</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Diplomatic document processing system with ML-based translation
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* USAID */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.7 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.usaid.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/usaid.png"
                                    alt="U.S. Agency for International Development"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("USAID")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">U.S. Agency for International Development</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Global aid management platform with real-time project tracking
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* USCIS */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.8 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.uscis.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/uscis.png"
                                    alt="U.S. Citizenship and Immigration Services"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("USCIS")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">U.S. Citizenship and Immigration Services</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Immigration case management system with automated processing
                                </p>
                              </a>
                            </motion.div>
                          </div>
                        </div>
                      )}
                      
                      {/* Client Showcase - Always visible for HELM */}
                      {exp.company === "HELM" && (
                        <div className="space-y-4 mt-6">
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                            <Building2 className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-400" />
                            Client Solutions
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Led development for enterprise clients in the automotive industry:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {/* Jeep */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.jeep.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/jeep.png"
                                    alt="Jeep"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Jeep")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Jeep</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  E-commerce platform & dealership integration
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Ford */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.ford.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/ford.png"
                                    alt="Ford"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Ford")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Ford</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Vehicle customization platform
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Alfa Romeo */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.alfaromeousa.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/alfa-romeo.png"
                                    alt="Alfa Romeo"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Alfa Romeo")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Alfa Romeo</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Luxury vehicle e-commerce
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Chrysler */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.chrysler.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/chrysler.png"
                                    alt="Chrysler"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Chrysler")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Chrysler</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Digital showroom experience
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Fiat */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.fiatusa.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/fiat.png"
                                    alt="Fiat"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Fiat")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Fiat</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Interactive vehicle catalog
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Dodge Ram */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.6 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.ramtrucks.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/ram.png"
                                    alt="Dodge Ram"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Dodge Ram")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Dodge Ram</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Truck configuration platform
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Mopar */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.7 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.mopar.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/mopar.png"
                                    alt="Mopar"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Mopar")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Mopar</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Parts & accessories e-commerce
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* K&N Filters */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.8 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.knfilters.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/kn.png"
                                    alt="K&N Filters"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("K&N Filters")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">K&N Filters</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  E-commerce platform
                                </p>
                              </a>
                            </motion.div>
                          </div>
                        </div>
                      )}
                      
                      {/* Client Showcase - Always visible for The Born Group */}
                      {exp.company === "The Born Group" && (
                        <div className="space-y-4 mt-6">
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                            <Building2 className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-400" />
                            Client Solutions
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Developed enterprise websites for major brands:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            {/* Nestlé */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.nestle.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/nestle.png"
                                    alt="Nestlé"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Nestlé")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Nestlé</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Corporate website
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Starbucks */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.starbucks.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/starbucks.png"
                                    alt="Starbucks"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Starbucks")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Starbucks</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  E-commerce platform
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Intel */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.intel.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <Image
                                    src="/images/clients/intel.png"
                                    alt="Intel"
                                    width={120}
                                    height={60}
                                    className="object-contain h-12"
                                    style={getImageStyle("Intel")}
                                  />
                                </div>
                                <h5 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Intel</h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
                                  Developer portal
                                </p>
                              </a>
                            </motion.div>
                          </div>
                        </div>
                      )}
                      
                      {/* Expand/Collapse Button */}
                      <div className="flex justify-center md:justify-start pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(actualIndex)}
                          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                          {expandedJob === actualIndex ? (
                            <>
                              <span>Show Less</span>
                              <ChevronUp className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <span>Show More</span>
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Expandable Content */}
                      <AnimatePresence>
                        {expandedJob === actualIndex && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 space-y-8">
                              {/* Key Achievements */}
                              <div className="space-y-4">
                                <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                                  <Award className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-400" />
                                  Key Achievements
                                </h4>
                                <ul className="space-y-4">
                                  {exp.achievements.map((achievement, i) => (
                                    <motion.li
                                      key={i}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3, delay: 0.1 + (i * 0.1) }}
                                      className="flex items-start gap-3 group"
                                    >
                                      <div className="p-1.5 mt-1 rounded-lg bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-400 group-hover:scale-110 transition-transform">
                                        <ArrowRight className="h-4 w-4" />
                                      </div>
                                      <span className="text-gray-600 dark:text-gray-300 text-lg">{achievement}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>

                              {/* Notable Projects - Only show for companies other than Auxo Solutions, Accenture Federal, HELM, and The Born Group */}
                              {exp.company !== "Auxo Solutions" && exp.company !== "Accenture Federal" && exp.company !== "HELM" && exp.company !== "The Born Group" && (
                                <div className="space-y-4">
                                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                                    <Code className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-400" />
                                    Notable Projects
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {exp.keyProjects.map((project, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 + (i * 0.1) }}
                                        className="p-6 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                      >
                                        <h5 className="font-semibold text-lg text-gray-900 dark:text-white">{project.name}</h5>
                                        <p className="text-gray-600 dark:text-gray-300 mt-2">{project.description}</p>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center items-center gap-4 mt-8"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPage}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExpandedJob(null)
                      setCurrentPage(i)
                      // Scroll to the top of the experience section
                      scrollToExperienceSection()
                    }}
                    className={cn(
                      "w-8 h-8 p-0 rounded-full",
                      currentPage === i
                        ? "bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPage}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          
          {/* Resume Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <Button
              onClick={() => window.open("/resume/Giovanni-Venegas-Resume-2025.pdf", "_blank")}
              className="px-6 py-6 rounded-xl text-base font-medium bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-900 dark:text-white transition-colors"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Full Resume
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
} 