"use client"

import { motion } from "framer-motion"
import { Mail, Phone, Calendar, Send, MessageSquare, MapPin, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useHasBeenViewed } from "@/hooks/useHasBeenViewed"
import { useState } from "react"

export function Contact() {
  const hasBeenViewed = useHasBeenViewed("contact")
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    service: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      
      // Reset form after showing success message
      setTimeout(() => {
        setIsSubmitted(false)
        setFormState({
          name: "",
          email: "",
          service: "",
          message: ""
        })
      }, 3000)
    }, 1500)
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  return (
    <section id="contact" className="relative min-h-screen flex items-center justify-center py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#111]">
      {/* Background with reduced opacity */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1d1d1d_1px,transparent_1px),linear-gradient(to_bottom,#1d1d1d_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="container relative max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-16"
        >
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={hasBeenViewed ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 text-sm font-medium mb-2"
            >
              Let's Connect
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
            >
              Get in Touch
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Ready to bring your vision to life? Let's discuss how we can work together to create something extraordinary.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={hasBeenViewed ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-1 mx-auto bg-gradient-to-r from-primary/30 to-primary/70 dark:from-primary/20 dark:to-primary/50 rounded-full"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={hasBeenViewed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={hasBeenViewed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className={cn(
                  "rounded-2xl p-8",
                  "bg-white/80 dark:bg-black/40",
                  "border border-black/5 dark:border-white/5",
                  "backdrop-blur-md shadow-xl"
                )}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/10 text-primary dark:text-primary/90">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Contact Information
                  </h3>
                </div>

                <div className="space-y-6">
                  <motion.a
                    initial={{ opacity: 0, x: -20 }}
                    animate={hasBeenViewed ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    href="mailto:Giovanni@v.com"
                    className={cn(
                      "flex items-center gap-4 group p-4",
                      "rounded-xl",
                      "bg-black/5 dark:bg-white/5",
                      "hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent dark:hover:from-primary/20 dark:hover:to-transparent",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                      <span className="text-gray-900 dark:text-gray-200 font-medium">Giovanni@vanguardsd.com</span>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all text-primary dark:text-primary/90" />
                  </motion.a>

                  <motion.a
                    initial={{ opacity: 0, x: -20 }}
                    animate={hasBeenViewed ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    href="tel:+13108729781"
                    className={cn(
                      "flex items-center gap-4 group p-4",
                      "rounded-xl",
                      "bg-black/5 dark:bg-white/5",
                      "hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent dark:hover:from-primary/20 dark:hover:to-transparent",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                      <span className="text-gray-900 dark:text-gray-200 font-medium">(310) 872-9781</span>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all text-primary dark:text-primary/90" />
                  </motion.a>

                  <motion.a
                    initial={{ opacity: 0, x: -20 }}
                    animate={hasBeenViewed ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    href="#"
                    className={cn(
                      "flex items-center gap-4 group p-4",
                      "rounded-xl",
                      "bg-black/5 dark:bg-white/5",
                      "hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent dark:hover:from-primary/20 dark:hover:to-transparent",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 group-hover:scale-110 transition-transform">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Availability</span>
                      <span className="text-gray-900 dark:text-gray-200 font-medium">Schedule a Call</span>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all text-primary dark:text-primary/90" />
                  </motion.a>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={hasBeenViewed ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    className={cn(
                      "flex items-center gap-4 group p-4",
                      "rounded-xl",
                      "bg-black/5 dark:bg-white/5",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                      <span className="text-gray-900 dark:text-gray-200 font-medium"> Moreno Valley, CA</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={hasBeenViewed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <motion.form
                onSubmit={handleSubmit}
                className={cn(
                  "rounded-2xl p-8",
                  "bg-white/80 dark:bg-black/40",
                  "border border-black/5 dark:border-white/5",
                  "backdrop-blur-md shadow-xl",
                  "relative overflow-hidden"
                )}
              >
                {/* Success message overlay */}
                {isSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-black/95 backdrop-blur-sm z-10"
                  >
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center max-w-xs">
                      Thank you for reaching out. I'll get back to you as soon as possible.
                    </p>
                  </motion.div>
                )}
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Name
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-black/5 dark:bg-white/5",
                        "border border-black/10 dark:border-white/10",
                        "focus:border-primary/50 dark:focus:border-primary/50",
                        "focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20",
                        "text-gray-900 dark:text-white",
                        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        "transition-all duration-300",
                        "outline-none"
                      )}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Email
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-black/5 dark:bg-white/5",
                        "border border-black/10 dark:border-white/10",
                        "focus:border-primary/50 dark:focus:border-primary/50",
                        "focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20",
                        "text-gray-900 dark:text-white",
                        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        "transition-all duration-300",
                        "outline-none"
                      )}
                      placeholder="Your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Service Needed
                    </label>
                    <motion.select
                      whileFocus={{ scale: 1.01 }}
                      name="service"
                      value={formState.service}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-black/5 dark:bg-white/5",
                        "border border-black/10 dark:border-white/10",
                        "focus:border-primary/50 dark:focus:border-primary/50",
                        "focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20",
                        "text-gray-900 dark:text-white",
                        "transition-all duration-300",
                        "outline-none"
                      )}
                      required
                    >
                      <option value="" className="bg-white dark:bg-gray-900">Select a service</option>
                      <option value="web" className="bg-white dark:bg-gray-900">Web Development</option>
                      <option value="ai" className="bg-white dark:bg-gray-900">AI Integration</option>
                      <option value="enterprise" className="bg-white dark:bg-gray-900">Enterprise Solutions</option>
                      <option value="consulting" className="bg-white dark:bg-gray-900">Technical Consulting</option>
                      <option value="other" className="bg-white dark:bg-gray-900">Other</option>
                    </motion.select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Project Details
                    </label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-black/5 dark:bg-white/5",
                        "border border-black/10 dark:border-white/10",
                        "focus:border-primary/50 dark:focus:border-primary/50",
                        "focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20",
                        "text-gray-900 dark:text-white",
                        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        "transition-all duration-300",
                        "resize-none",
                        "outline-none"
                      )}
                      rows={4}
                      placeholder="Tell me about your project"
                      required
                    />
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-8"
                >
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full h-14 rounded-xl",
                      "bg-gradient-to-r from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70",
                      "text-white",
                      "hover:from-primary/90 hover:to-primary/70 dark:hover:from-primary/80 dark:hover:to-primary/60",
                      "transition-all duration-300",
                      "shadow-lg shadow-primary/20 dark:shadow-primary/10",
                      "disabled:opacity-70 disabled:cursor-not-allowed"
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </motion.form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 