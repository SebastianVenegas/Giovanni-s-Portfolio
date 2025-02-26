"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, Calendar, ExternalLink, ChevronDown, ChevronUp, Code, Download, Badge as BadgeIcon, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHasBeenViewed } from "@/hooks/useHasBeenViewed"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useMounted } from "@/components/theme-provider"

// Enhanced certifications data with more details
const certifications = [
  {
    title: "Verified Harvard CS50",
    issuer: "Harvard University",
    logo: "/images/certifications/harvard.png",
    website: "https://cs50.harvard.edu/",
    issueDate: "Jan 2024",
    expiryDate: "Dec 2030",
    credentialId: "b16e804cfc2b4c92ad6d0d9a918ab3af",
    credentialUrl: "https://certificates.cs50.io/c377fa1b-1007-495b-8692-e9d71f3569ef",
    description: "Harvard University's introduction to the intellectual enterprises of computer science and the art of programming, covering algorithms, data structures, resource management, software engineering, and web development.",
    skills: ["C", "Python", "SQL", "JavaScript", "HTML", "CSS", "Flask", "Algorithms", "Data Structures"],
    projects: [
      {
        name: "Final Project: Web Application",
        description: "Developed a full-stack web application with Flask backend and JavaScript frontend"
      }
    ]
  },
  {
    title: "Novice Configurator",
    issuer: "Unqork",
    logo: "/images/certifications/unqork.png",
    website: "https://www.unqork.com/",
    issueDate: "Mar 2024",
    expiryDate: "Mar 2025",
    credentialId: "UC-NOVICE-2024-03",
    credentialUrl: "https://www.unqork.com/certifications/verify",
    description: "Certification in Unqork's no-code platform for building enterprise applications, focusing on component configuration and workflow design.",
    skills: ["Unqork", "No-Code Development", "Enterprise Applications", "Workflow Design"],
    projects: [
      {
        name: "Insurance Application Workflow",
        description: "Designed and implemented an insurance application processing workflow"
      }
    ]
  },
  {
    title: "Stripe Certified Professional Developer",
    issuer: "Stripe",
    logo: "/images/certifications/Stripe.png",
    website: "https://stripe.com/",
    issueDate: "Sep 2022",
    expiryDate: "Sep 2024",
    credentialId: "58079117",
    credentialUrl: "https://www.stripe.com/certifications/verify",
    description: "Expert-level certification in implementing and optimizing Stripe payment solutions, covering payment processing, security, and compliance.",
    skills: ["Payment Processing", "API Integration", "Security", "PCI Compliance", "Webhooks"],
    projects: [
      {
        name: "Subscription Management System",
        description: "Implemented a complex subscription billing system with Stripe"
      }
    ]
  }
]

export function Certifications() {
  const hasBeenViewed = useHasBeenViewed("certifications")
  const [expandedCert, setExpandedCert] = useState<number | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const mounted = useMounted()
  
  const toggleExpand = (index: number) => {
    setExpandedCert(expandedCert === index ? null : index)
  }
  
  // Function to determine logo filter based on issuer and theme
  const getLogoFilter = (issuer: string) => {
    if (!mounted) return {}
    
    if (issuer === "Harvard University") {
      return {
        filter: "none" // No filter for Harvard logo in any mode
      }
    } else if (issuer === "edX" || issuer === "Unqork") {
      return {
        filter: isDark ? "brightness(0) invert(1)" : "none"
      }
    } else if (issuer === "Stripe") {
      return {
        filter: isDark ? "brightness(0) invert(1)" : "none"
      }
    }
    
    // Default filter for other logos
    return {
      filter: isDark ? "brightness(0.9) contrast(1.1)" : "none"
    }
  }
  
  return (
    <section id="certifications" className="relative min-h-screen flex items-center justify-center py-24 overflow-hidden bg-gray-100 dark:bg-[#0a0a0a]">
      {/* Background with reduced opacity */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1d1d1d_1px,transparent_1px),linear-gradient(to_bottom,#1d1d1d_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      
      <div className="container relative max-w-6xl px-4">
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
              Licenses & Certifications
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Professional certifications and technical achievements
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={hasBeenViewed ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-1 mx-auto bg-gray-300/50 dark:bg-gray-600/50 rounded-full"
            />
          </div>
          
          {/* Grid layout for certifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "rounded-xl overflow-hidden",
                  "bg-white/80 dark:bg-black/40",
                  "border border-black/10 dark:border-white/10",
                  "backdrop-blur-sm shadow-xl",
                  "hover:shadow-2xl hover:border-gray-300/30 dark:hover:border-gray-600/30",
                  "transition-all duration-300"
                )}
              >
                {/* Certificate Header with Logo */}
                <div className="relative p-6 pb-0">
                  <div className="flex flex-col items-center">
                    {/* Logo in a circular container */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={hasBeenViewed ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className={cn(
                        "relative w-28 h-28 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center",
                        "border-4 border-black/5 dark:border-white/5",
                        "shadow-lg",
                        "transition-all duration-300",
                        "bg-white dark:bg-black",
                        "z-10"
                      )}
                    >
                      <Image
                        src={cert.logo}
                        alt={`${cert.issuer} logo`}
                        width={112}
                        height={112}
                        className="w-[75%] h-[75%] object-contain"
                        style={getLogoFilter(cert.issuer)}
                      />
                    </motion.div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-200/5 to-transparent dark:from-gray-700/20 dark:to-transparent -z-0" />
                  </div>
                </div>
                
                {/* Certificate Content */}
                <div className="p-6 pt-3">
                  <div className="space-y-4 text-center">
                    {/* Title and Issuer */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                        {cert.title}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-lg text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-medium">{cert.issuer}</span>
                        <a 
                          href={cert.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    
                    {/* Credential Details */}
                    <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500/70 dark:text-gray-400" />
                        <span>
                          Issued {cert.issueDate}
                          {cert.expiryDate && ` • Expires ${cert.expiryDate}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <BadgeIcon className="h-4 w-4 text-gray-500/70 dark:text-gray-400" />
                        <span className="truncate max-w-[300px]">
                          Credential ID: {cert.credentialId.substring(0, 15)}...
                        </span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {cert.description.length > 120 
                        ? `${cert.description.substring(0, 120)}...` 
                        : cert.description}
                    </p>
                    
                    {/* Skills Preview */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {cert.skills.slice(0, 3).map((skill, i) => (
                        <Badge 
                          key={i}
                          className="bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-0.5 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {cert.skills.length > 3 && (
                        <Badge className="bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                          +{cert.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-center gap-3 pt-2">
                      <a 
                        href={cert.credentialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:underline text-sm flex items-center gap-1"
                      >
                        <span>View Credential</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(index)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm p-0 h-auto"
                      >
                        {expandedCert === index ? (
                          <span className="flex items-center">
                            <ChevronUp className="mr-1 h-3 w-3" />
                            Less
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <ChevronDown className="mr-1 h-3 w-3" />
                            More
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Expandable Content */}
                <AnimatePresence>
                  {expandedCert === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10"
                    >
                      <div className="p-6 space-y-6">
                        {/* Full Skills List */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                            <Code className="h-5 w-5 mr-2 text-gray-500/70 dark:text-gray-400" />
                            Skills & Technologies
                          </h4>
                          <div className="flex flex-wrap justify-center gap-2">
                            {cert.skills.map((skill, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 + (i * 0.05) }}
                              >
                                <Badge 
                                  className="bg-black/10 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/15 dark:hover:bg-white/15 px-3 py-1 text-sm"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1 text-green-500 dark:text-green-400" />
                                  {skill}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Projects */}
                        {cert.projects && cert.projects.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                              <Award className="h-5 w-5 mr-2 text-gray-500/70 dark:text-gray-400" />
                              Projects & Achievements
                            </h4>
                            <div className="space-y-3">
                              {cert.projects.map((project, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.2 + (i * 0.1) }}
                                  className="p-4 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 transition-colors"
                                >
                                  <h5 className="font-semibold text-gray-900 dark:text-white">{project.name}</h5>
                                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{project.description}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Full Credential ID */}
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
                          <span className="font-medium">Full Credential ID:</span> {cert.credentialId}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
} 