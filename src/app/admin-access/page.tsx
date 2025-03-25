"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'

export default function AdminAccessPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true)
    console.log("Component mounted")
  }, [])
  
  // Handle redirect when isRedirecting changes
  useEffect(() => {
    if (isRedirecting) {
      console.log("Redirect effect triggered")
      const timer = setTimeout(() => {
        console.log("Executing redirect now via direct navigation")
        // Try direct navigation
        window.location.replace('/admin')
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [isRedirecting])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Submit clicked, checking password:", password)
    
    // Use the API key from the .env file directly
    const correctPassword = 'Aaron3209' // Should match ADMIN_API_KEY env var
    
    if (password === correctPassword) {
      console.log("Password correct, setting redirect state and storing in session")
      setIsRedirecting(true)
      
      // Store the API key in sessionStorage temporarily
      // This is only for this browser session
      try {
        // Use the hardcoded value to ensure consistency
        sessionStorage.setItem('admin_api_key', 'Aaron3209')
      } catch (err) {
        console.error("Error storing API key in session:", err)
      }
      
      // Use multiple redirect methods for redundancy
      setTimeout(() => {
        try {
          // Method 1: Use router
          router.push('/admin')
          
          // Method 2: Direct location change as backup
          setTimeout(() => {
            window.location.href = '/admin'
          }, 300)
        } catch (err) {
          console.error("Error during redirect:", err)
          
          // Last fallback method
          window.location.replace('/admin')
        }
      }, 500)
    } else {
      console.log("Password incorrect")
      setError('Invalid access code')
      
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
      
      {/* Animated blurred circles */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-800 dark:to-blue-900 blur-3xl opacity-30"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, 20, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 dark:from-amber-900 dark:to-rose-900 blur-3xl opacity-20"
      />
    </div>
  )

  return (
    <div suppressHydrationWarning className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0a0a0a] p-4 overflow-hidden">
      {/* Animated background */}
      {isMounted && <BackgroundPatterns />}
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="w-full max-w-md z-10"
        >
          <Card className="border border-black/10 dark:border-white/10 shadow-xl glass-effect glass-card backdrop-blur-md bg-white/70 dark:bg-black/30 overflow-hidden">
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 dark:from-gray-700 dark:via-gray-500 dark:to-gray-300"></div>
            
            <CardHeader className="space-y-4 text-center pb-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mx-auto relative"
              >
                {/* Logo with glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-400 blur-md opacity-30 -z-10"></div>
                <div className="w-24 h-24 relative mx-auto mb-4">
                  <Image 
                    src="/GV Fav.png" 
                    alt="GV Logo" 
                    width={96} 
                    height={96} 
                    className="object-contain"
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Admin Portal</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">Enter your access code to continue</CardDescription>
              </motion.div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6 pb-6">
                <div className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="relative">
                      <Input
                        id="password"
                        placeholder="Enter access code"
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-gray-500 h-12 text-lg px-4 pr-10"
                        autoFocus
                      />
                      <motion.div 
                        animate={{ 
                          rotate: isRedirecting ? [0, 360] : 0
                        }}
                        transition={{ 
                          duration: 1,
                          repeat: isRedirecting ? Infinity : 0,
                          ease: "linear"
                        }}
                        className="absolute right-3 top-3.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isRedirecting ? 'text-green-500' : 'text-gray-400'}`}>
                          {isRedirecting ? (
                            <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                          ) : (
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                          )}
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Error message with animation */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-red-500 text-center font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Success message with animation */}
                  <AnimatePresence>
                    {isRedirecting && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col items-center justify-center py-2">
                          <div className="flex space-x-2 items-center">
                            <svg className="animate-spin h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm text-green-500 font-medium">Access granted! Redirecting...</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <motion.div 
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className={`w-full h-12 text-lg font-medium transition-all duration-300 relative overflow-hidden ${
                      isRedirecting 
                        ? 'gradient-primary' 
                        : 'glass-effect glass-card bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white'
                    } shadow-lg`}
                    disabled={isRedirecting}
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      {isRedirecting ? (
                        <>Access Granted</>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                          Access Admin Panel
                        </>
                      )}
                    </div>
                    
                    {/* Background animation for button */}
                    {!isRedirecting && (
                      <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </form>
          </Card>
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
              console.log("Attempting redirect via hidden link click")
              setTimeout(() => {
                try {
                  node.click()
                } catch (err) {
                  console.error("Error clicking link:", err)
                }
              }, 1000)
            }
          }}
        >
          Redirect to Admin
        </a>
      )}
    </div>
  )
} 