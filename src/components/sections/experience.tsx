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
    title: "Senior Software Developer",
    company: "Accenture Federal",
    logo: "/images/logos/accenture.png",
    website: "https://www.accenture.com/us-en/services/us-federal-government",
    period: "June 2019 – Present",
    location: "Washington, D.C. (Hybrid)",
    description: "Developing secure, compliant applications for federal agencies with focus on modernization and AI integration.",
    achievements: [
      "Designed secure Next.js applications for TSA, IRS, USDA, DeCA, JAIC, NIC, DOS, USAID, USCIS",
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
  
  const nextPage = () => {
    setExpandedJob(null)
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }
  
  const prevPage = () => {
    setExpandedJob(null)
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }
  
  const currentExperiences = experiences.slice(
    currentPage * experiencesPerPage,
    (currentPage + 1) * experiencesPerPage
  )
  
  // Function to determine logo filter based on company and theme
  const getLogoFilter = (company: string) => {
    if (!mounted) return {}
    
    if (company === "Auxo Solutions") {
      return {
        filter: resolvedTheme === "dark" 
          ? "brightness(0) invert(1)" // White in dark mode
          : "brightness(0)" // Black in light mode
      }
    } else if (company === "Accenture Federal") {
      return {
        filter: resolvedTheme === "dark"
          ? "brightness(0) invert(1)" // White in dark mode
          : "none" // Original in light mode
      }
    }
    
    // Default filter for other logos
    return {
      filter: resolvedTheme === "dark" ? "brightness(0.9) contrast(1.1)" : "none"
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
                  className="relative pl-6 sm:pl-8"
                >
                  {/* Timeline Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] sm:w-[2px] bg-gradient-to-b from-gray-300 via-gray-200 to-gray-100 dark:from-gray-600/50 dark:via-gray-600/20 dark:to-gray-600/10" />
                  
                  {/* Timeline Dot */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={hasBeenViewed ? { scale: 1 } : {}}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 + (index * 0.1) }}
                    className="absolute -left-[7px] sm:-left-[9px] top-0 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white dark:bg-black border-2 border-black/30 dark:border-black/40"
                  />
                  
                  <div className={cn(
                    "rounded-xl p-4 sm:p-6 md:p-8",
                    "bg-white/70 dark:bg-black/30",
                    "border border-black/5 dark:border-white/5",
                    "backdrop-blur-sm shadow-xl",
                    "hover:border-black/15 dark:hover:border-black/30",
                    "transition-all duration-300"
                  )}>
                    <div className="space-y-4 sm:space-y-6">
                      {/* Top section with logo and title - Changed to row layout */}
                      <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 sm:gap-8">
                        {/* Company Logo - Left aligned on desktop */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={hasBeenViewed ? { opacity: 1, scale: 1 } : {}}
                          transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center",
                            "border border-black/5 dark:border-white/5",
                            "shadow-lg hover:shadow-xl",
                            "transition-all duration-300",
                            "bg-white dark:bg-black p-4 sm:p-6",
                            "mx-auto md:mx-0"
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
                        <div className="flex-1 space-y-3 sm:space-y-6">
                          <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                              {exp.title}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-lg sm:text-xl text-gray-700 dark:text-gray-300">
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
                          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-6 text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-black/5 dark:bg-white/5">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                              <span className="font-medium text-sm sm:text-base">{exp.period}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-black/5 dark:bg-white/5">
                                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                              <span className="font-medium text-sm sm:text-base">{exp.location}</span>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-center md:text-left text-base sm:text-lg text-gray-600 dark:text-gray-300">
                            {exp.description}
                          </p>
                          
                          {/* Technology Tags */}
                          <div className="flex flex-wrap justify-center md:justify-start gap-1.5 sm:gap-2 mt-2">
                            {exp.technologies.map((tech, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={hasBeenViewed ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.3, delay: 0.3 + (i * 0.05) }}
                              >
                                <Badge 
                                  className="bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm"
                                >
                                  <Code className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-2" />
                                  {tech}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Client Showcase - Always visible for Auxo Solutions */}
                      {exp.company === "Auxo Solutions" && (
                        <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-gray-500 dark:text-gray-400" />
                            Client Solutions
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                            Architected Next.js and Unqork-based solutions for major financial & insurance clients:
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-3 sm:mt-4">
                            {/* UBS */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.ubs.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-12 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                                  <Image
                                    src="/images/clients/ubs.png"
                                    alt="UBS"
                                    width={120}
                                    height={60}
                                    className="object-contain h-10 sm:h-12"
                                    style={resolvedTheme === "dark" ? { filter: "brightness(0) invert(1)" } : {}}
                                  />
                                </div>
                                <h5 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white text-center">
                                  UBS
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center text-sm sm:text-base">
                                  Enterprise wealth management platform with AI-driven portfolio optimization
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* New York Life */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.newyorklife.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-12 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                                  <Image
                                    src="/images/clients/nyl.png"
                                    alt="New York Life"
                                    width={120}
                                    height={60}
                                    className="object-contain h-10 sm:h-12"
                                  />
                                </div>
                                <h5 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white text-center">
                                  New York Life
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center text-sm sm:text-base">
                                  Policy management system with real-time underwriting capabilities
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Aetna */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.aetna.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-12 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                                  <Image
                                    src="/images/clients/aetna.png"
                                    alt="Aetna"
                                    width={120}
                                    height={60}
                                    className="object-contain h-10 sm:h-12"
                                  />
                                </div>
                                <h5 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white text-center">
                                  Aetna
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center text-sm sm:text-base">
                                  Claims processing automation with ML-powered fraud detection
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* Prudential */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.prudential.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-12 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                                  <Image
                                    src="/images/clients/prudential.png"
                                    alt="Prudential"
                                    width={120}
                                    height={60}
                                    className="object-contain h-10 sm:h-12"
                                  />
                                </div>
                                <h5 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white text-center">
                                  Prudential
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center text-sm sm:text-base">
                                  Financial services platform with integrated advisory tools
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* AXIS Capital */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.axiscapital.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-12 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                                  <Image
                                    src="/images/clients/axis.png"
                                    alt="AXIS Capital"
                                    width={120}
                                    height={60}
                                    className="object-contain h-10 sm:h-12"
                                    style={resolvedTheme === "dark" ? { filter: "brightness(0) invert(1)" } : {}}
                                  />
                                </div>
                                <h5 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white text-center">
                                  AXIS Capital
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center text-sm sm:text-base">
                                  Insurance underwriting platform with automated risk assessment
                                </p>
                              </a>
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* Client Showcase - Always visible for Accenture Federal */}
                      {exp.company === "Accenture Federal" && (
                        <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-gray-500 dark:text-gray-400" />
                            Government Clients
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                            Developed secure, compliant applications for federal agencies:
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-3 sm:mt-4">
                            {/* TSA */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.tsa.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-12 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                                  <Image
                                    src="/images/clients/tsa.png"
                                    alt="TSA"
                                    width={120}
                                    height={60}
                                    className="object-contain h-10 sm:h-12"
                                    style={resolvedTheme === "dark" ? { filter: "brightness(0) invert(1)" } : {}}
                                  />
                                </div>
                                <h5 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white text-center">
                                  TSA
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center text-sm sm:text-base">
                                  Passenger screening system with real-time threat assessment
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* IRS */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.irs.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-12 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                                  <Image
                                    src="/images/clients/irs.png"
                                    alt="IRS"
                                    width={120}
                                    height={60}
                                    className="object-contain h-10 sm:h-12"
                                    style={resolvedTheme === "dark" ? { filter: "brightness(0) invert(1)" } : {}}
                                  />
                                </div>
                                <h5 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white text-center">
                                  IRS
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center text-sm sm:text-base">
                                  Modernized tax processing system with AI-assisted form validation
                                </p>
                              </a>
                            </motion.div>
                            
                            {/* USDA */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-black/20 transition-colors"
                            >
                              <a 
                                href="https://www.usda.gov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block h-full hover:opacity-90 transition-opacity"
                              >
                                <div className="h-12 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                                  <Image
                                    src="/images/clients/usda.png"
                                    alt="USDA"
                                    width={120}
                                    height={60}
                                    className="object-contain h-10 sm:h-12"
                                    style={resolvedTheme === "dark" ? { filter: "brightness(0) invert(1)" } : {}}
                                  />
                                </div>
                                <h5 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white text-center">
                                  USDA
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center text-sm sm:text-base">
                                  Agricultural data management system with real-time analytics
                                </p>
                              </a>
                            </motion.div>
                          </div>
                        </div>
                      )}
                      
                      {/* Achievements Section */}
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center md:justify-start justify-center">
                          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-gray-500 dark:text-gray-400" />
                          Key Achievements
                        </h4>
                        
                        <ul className="space-y-2 sm:space-y-3 text-gray-600 dark:text-gray-300">
                          {exp.achievements.map((achievement, i) => (
                            <motion.li 
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={hasBeenViewed ? { opacity: 1, x: 0 } : {}}
                              transition={{ duration: 0.3, delay: 0.2 + (i * 0.1) }}
                              className="flex items-start"
                            >
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40" />
                              </div>
                              <span className="ml-3 text-sm sm:text-base">{achievement}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* View More Button */}
                      <div className="flex justify-center md:justify-start mt-2 sm:mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                          onClick={() => toggleExpand(actualIndex)}
                        >
                          {expandedJob === actualIndex ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span>Show More</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-center mt-12 space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="h-8 sm:h-10 px-2 sm:px-4 rounded-lg text-xs sm:text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Previous</span>
            </Button>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "h-8 w-8 sm:h-10 sm:w-10 rounded-lg p-0 flex items-center justify-center text-xs sm:text-sm",
                    currentPage === i
                      ? "bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white border-black/20 dark:border-white/20"
                      : "bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10"
                  )}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="h-8 sm:h-10 px-2 sm:px-4 rounded-lg text-xs sm:text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          </div>
          
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