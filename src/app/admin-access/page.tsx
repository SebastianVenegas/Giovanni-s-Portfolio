"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'
import { KeyRound, Loader2, LogIn, Check, AlertOctagon } from "lucide-react"
import { useTheme } from "next-themes"

export default function AdminAccessPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  
  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Determine if dark mode is active
  const isDark = theme === "dark"
  
  // Get the correct password from environment variable or fallback
  const getCorrectPassword = () => {
    // In production, this should be set in your environment variables
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    // Fallback for development (should be replaced with env vars in production)
    return envPassword || 'Aaron3209'
  }
  
  // Handle redirect when isRedirecting changes
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        // Use router first
        router.push('/admin')
        
        // Then fallback to other methods if needed
        const fallbackTimer = setTimeout(() => {
          // Check if we're still on the same page after router.push attempt
          if (window.location.pathname.includes('admin-access')) {
            console.log('Router navigation failed, trying direct methods')
            window.location.href = '/admin'
          }
        }, 1000)
        
        return () => clearTimeout(fallbackTimer)
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [isRedirecting, router])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const correctPassword = getCorrectPassword()
    
    if (password === correctPassword) {
      setIsRedirecting(true)
      
      // Store the API key in sessionStorage
      try {
        sessionStorage.setItem('admin_api_key', correctPassword)
        // Add an expiration timestamp (24 hours)
        const expiry = Date.now() + (24 * 60 * 60 * 1000)
        sessionStorage.setItem('admin_session_expiry', expiry.toString())
      } catch (err) {
        console.error("Error storing API key in session:", err)
      }
    } else {
      // Increment failed attempts
      setAttempts(prev => prev + 1)
      
      // Show error with different messages based on number of attempts
      if (attempts >= 2) {
        setError('Multiple incorrect attempts. Please verify your credentials.')
      } else {
        setError('Invalid access code')
      }
      
      // Activate the shaking animation
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }
  
  // Animated background patterns
  const BackgroundPatterns = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1d1d1d_1px,transparent_1px),linear-gradient(to_bottom,#1d1d1d_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      
      {/* Subtle animation for background */}
      <motion.div
        animate={{
          opacity: [0.05, 0.07, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-black dark:bg-white blur-3xl opacity-5"
      />
    </div>
  )

  return (
    <div suppressHydrationWarning className="relative min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900 p-4 overflow-hidden">
      {/* Animated background */}
      {isMounted && <BackgroundPatterns />}
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-full max-w-md z-10"
          key="login-card"
        >
          <motion.div
            animate={isShaking ? { 
              x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
              transition: { duration: 0.5 }
            } : {}}
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-md bg-white dark:bg-zinc-900 overflow-hidden rounded-lg">
              {/* Top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 dark:bg-zinc-200"></div>
              
              <CardHeader className="space-y-4 text-center pb-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="mx-auto relative"
                >
                  <div className="w-20 h-20 relative mx-auto mb-2 flex items-center justify-center">
                    <Image 
                      src="/GV Fav.png" 
                      alt="GV Logo" 
                      width={80} 
                      height={80} 
                      className={`object-contain ${isRedirecting ? 'animate-pulse' : ''} ${isDark ? 'invert-0' : 'invert'}`}
                      priority // Ensures the image loads quickly
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Admin Access</CardTitle>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400 mt-2">Enter your access code to continue</CardDescription>
                </motion.div>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="pt-2 pb-6">
                  <div className="space-y-4">
                    <motion.div 
                      className="space-y-2"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-zinc-500 dark:text-zinc-400">
                          <KeyRound size={18} />
                        </div>
                        <Input
                          id="password"
                          placeholder="Enter access code"
                          type="password"
                          value={password}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                          required
                          className={`bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:ring-zinc-500 focus:border-zinc-500 h-12 pl-10 ${isRedirecting ? 'opacity-70' : ''}`}
                          autoFocus
                          disabled={isRedirecting}
                        />
                        {isRedirecting && (
                          <motion.div 
                            animate={{ 
                              rotate: 360
                            }}
                            transition={{ 
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute right-3 top-3.5 text-zinc-600 dark:text-zinc-300"
                          >
                            <Check size={18} />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Error message with animation */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center justify-center gap-2 py-1">
                            <AlertOctagon size={16} className="text-red-500 dark:text-red-400" />
                            <p className="text-sm text-red-500 dark:text-red-400 font-medium">{error}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Success message with animation */}
                    <AnimatePresence>
                      {isRedirecting && (
                        <motion.div
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center justify-center gap-2 py-1">
                            <Loader2 className="h-4 w-4 text-zinc-600 dark:text-zinc-300 animate-spin" />
                            <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">Access granted! Redirecting...</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <motion.div 
                    className="w-full"
                    whileHover={{ scale: isRedirecting ? 1 : 1.01 }}
                    whileTap={{ scale: isRedirecting ? 1 : 0.99 }}
                  >
                    <Button 
                      type="submit" 
                      className={`w-full h-11 text-base font-medium transition-all duration-200 relative ${
                        isRedirecting 
                          ? 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                      } shadow-md rounded-md`}
                      disabled={isRedirecting}
                    >
                      <div className="relative z-10 flex items-center justify-center">
                        {isRedirecting ? (
                          <span className="flex items-center gap-2">
                            <Check size={18} />
                            <span>Access Granted</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <LogIn size={18} />
                            <span>Access Admin Panel</span>
                          </span>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Hidden link that we can programmatically click as a fallback */}
      {isMounted && (
        <a 
          href="/admin" 
          id="admin-redirect-link" 
          style={{ display: 'none' }}
          ref={(node) => {
            if (node && isRedirecting) {
              setTimeout(() => {
                try {
                  node.click()
                } catch (err) {
                  console.error("Error clicking link:", err)
                }
              }, 1200)
            }
          }}
        >
          Redirect to Admin
        </a>
      )}
    </div>
  )
} 