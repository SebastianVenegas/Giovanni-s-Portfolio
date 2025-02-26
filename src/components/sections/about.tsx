"use client"

import { motion, useInView } from "framer-motion"
import { Mail, CheckCircle2, Github, Linkedin, Code, ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { useMounted } from "@/components/theme-provider"
import { TechStackBanner } from "@/components/TechStackBanner"

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mounted = useMounted()

  // Function to handle resume download
  const handleDownloadResume = () => {
    // Create a link element
    const link = document.createElement('a');
    
    // Set the download attribute with the desired filename
    link.download = "Giovanni-Venegas-Resume-2025.pdf";
    
    // Set the href to the PDF URL
    // NOTE: You need to add your actual resume PDF file to:
    // public/resume/Giovanni-Venegas-Resume-2025.pdf
    link.href = "/resume/Giovanni-Venegas-Resume-2025.pdf";
    
    // Append to the document
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  }

  // Grid background animation effect
  useEffect(() => {
    if (!mounted) return;
    
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
  }, [isDark, mounted])

  return (
    <section ref={ref} id="about" className="relative py-24 overflow-hidden bg-gray-100 dark:bg-[#0a0a0a]">
      {/* Grid background */}
      {mounted && <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-50" />}

      <div className="container relative mx-auto px-4 max-w-6xl z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Section header */}
          <div className="text-center space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              About Me
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Senior Full Stack Engineer & Solutions Architect with 13+ years of experience crafting enterprise-level
              solutions for government agencies, global insurers, and Fortune 500 firms.
            </motion.p>
          </div>

          {/* Main content - Full width layout without image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-10 max-w-4xl mx-auto"
          >
            {/* Bio section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-800/40"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Giovanni Venegas</h3>
                <div className="flex items-center">
                  <span className="hidden md:block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mx-3"></span>
                  <span className="text-lg text-gray-700 dark:text-gray-300">Full Stack Solutions Architect</span>
                </div>
                <div className="flex ml-auto gap-3">
                  <motion.a
                    href="https://github.com/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-black/40 dark:text-gray-300 dark:hover:bg-black/60 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Github className="h-5 w-5" />
                  </motion.a>
                  <motion.a
                    href="https://linkedin.com/in/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-black/40 dark:text-gray-300 dark:hover:bg-black/60 transition-colors"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Linkedin className="h-5 w-5" />
                  </motion.a>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                As a seasoned Full Stack Engineer and Solutions Architect, I specialize in designing and delivering
                secure, high-impact web solutions for elite government agencies, global insurers, and Fortune 500 firms.
                My expertise spans Next.js, React, and Vercel deployments, complemented by deep proficiency in Python,
                PHP, Node.js, and Unqork no-code platforms. With a focus on enterprise-level architecture and security,
                I've successfully delivered over 50 projects with a 100% client satisfaction rate.
              </p>
            </motion.div>

            {/* Expertise and skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800/40"
              >
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Core Expertise</h3>
                <ul className="space-y-3">
                  {[
                    "Enterprise-level web solutions",
                    "AI integration specialist",
                    "Secure architecture design",
                    "Cloud infrastructure expert",
                    "Government & financial sector experience",
                    "Full-stack development leadership",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800/40"
              >
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: "Next.js", image: "/images/tech-stack/nextjs.png" },
                    { name: "React", image: "/images/tech-stack/react.png" },
                    { name: "TypeScript", image: "/images/tech-stack/typescript.png" },
                    { name: "Python", image: "/images/tech-stack/python.png" },
                    { name: "Node.js", image: "/images/tech-stack/nodejs.png" },
                    { name: "AWS", image: "/images/tech-stack/aws.png" },
                    { name: "Azure", image: "/images/tech-stack/azure.png" },
                    { name: "Docker", image: "/images/tech-stack/docker.png" },
                    { name: "GraphQL", image: "/images/tech-stack/graphql.png" },
                    { name: "PHP", image: "/images/tech-stack/php.png" },
                    { name: "Laravel", image: "/images/tech-stack/laravel.png" },
                    { name: "JavaScript", image: "/images/tech-stack/javascript.png" },
                    { name: "Drupal", image: "/images/tech-stack/drupal.png" },
                    { name: "Magento", image: "/images/tech-stack/magento.png" },
                    { name: "WordPress", image: "/images/tech-stack/wordpress.png" },
                    { name: "Flask", image: "/images/tech-stack/flask.png" },
                    { name: "Unqork", image: "/images/tech-stack/unqork1.png" },
                  ].map((tech, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-black/40 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-black/60 transition-colors"
                    >
                      <div className="w-6 h-6 relative">
                        <img 
                          src={tech.image} 
                          alt={tech.name} 
                          className={cn(
                            "object-contain",
                            isDark && (tech.name === "Next.js" || tech.name === "AWS" || tech.name === "Flask" || tech.name === "Unqork" || tech.name === "WordPress") && "filter brightness-0 invert"
                          )}
                          width={24}
                          height={24}
                        />
                      </div>
                      {tech.name}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "13+", label: "Years Experience" },
                { value: "50+", label: "Projects Completed" },
                { value: "15+", label: "Enterprise Clients" },
                { value: "24/7", label: "Support" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="p-4 rounded-xl bg-white/80 dark:bg-black/20 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-800/40"
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons with hover animations */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className={cn(
                    "w-full h-12 rounded-xl text-base font-medium group relative overflow-hidden",
                    "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10",
                    "text-gray-900 dark:text-white",
                    "border border-gray-200 dark:border-gray-800",
                    "hover:border-gray-300 dark:hover:border-gray-700",
                    "transition-all duration-300",
                  )}
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <span
                    className="absolute inset-0 w-full h-full transition-all duration-300 
                    opacity-0 group-hover:opacity-0"
                  ></span>
                  <span className="relative flex items-center justify-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Me
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>

              <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className={cn(
                    "w-full h-12 rounded-xl text-base font-medium group relative overflow-hidden",
                    "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10",
                    "text-gray-900 dark:text-white",
                    "border border-gray-200 dark:border-gray-800",
                    "hover:border-gray-300 dark:hover:border-gray-700",
                    "transition-all duration-300",
                  )}
                  onClick={handleDownloadResume}
                >
                  <span
                    className="absolute inset-0 w-full h-full transition-all duration-300 
                    bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 
                    dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 
                    opacity-0 group-hover:opacity-100"
                  ></span>
                  <span className="relative flex items-center justify-center">
                    <Download className="mr-2 h-5 w-5" />
                    Download Resume
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Tech Stack Banner at the bottom of About section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="mt-16 w-full"
      >
        <TechStackBanner />
      </motion.div>
    </section>
  )
}

export default About

