"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

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
    
    // Simple password check - in a real app, use a more secure method
    // This is just a basic protection layer
    if (password === 'Aaron3209') {
      console.log("Password correct, setting redirect state")
      setIsRedirecting(true)
      
      // Immediate attempt at redirect as a fallback
      try {
        console.log("Attempting immediate redirect")
        setTimeout(() => {
          window.location.href = '/admin'
        }, 100)
      } catch (err) {
        console.error("Error during redirect:", err)
      }
    } else {
      console.log("Password incorrect")
      setError('Invalid access code')
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }
  
  return (
    <div suppressHydrationWarning className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0a0a0a] p-4 relative overflow-hidden">
      {/* Static background pattern - only render on client side */}
      {isMounted && (
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-black/5 dark:bg-white/5 blur-3xl"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 rounded-full bg-black/5 dark:bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/2 w-80 h-80 rounded-full bg-black/5 dark:bg-white/5 blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-black/5 dark:bg-white/5 blur-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-black/5 dark:bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-black/5 dark:bg-white/5 blur-3xl"></div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border border-black/10 dark:border-white/10 shadow-xl backdrop-blur-md bg-white/70 dark:bg-black/30 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 dark:from-gray-700 dark:via-gray-500 dark:to-gray-300"></div>
          
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Admin Portal</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">Enter your access code to continue</CardDescription>
            </motion.div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-4 pb-6">
              <div className="space-y-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    id="password"
                    placeholder="Enter access code"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className="bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-gray-500 h-12 text-lg px-4"
                    autoFocus
                  />
                </motion.div>
                
                {/* Error message with animation */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: error ? 1 : 0,
                    height: error ? 'auto' : 0
                  }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-red-500 text-center font-medium">{error}</p>
                </motion.div>
                
                {/* Success message with animation */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: isRedirecting ? 1 : 0,
                    height: isRedirecting ? 'auto' : 0
                  }}
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
              </div>
            </CardContent>
            
            <CardFooter>
              <motion.div 
                className="w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className={`w-full h-12 text-lg font-medium transition-all duration-300 ${
                    isRedirecting 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white'
                  } shadow-lg`}
                  disabled={isRedirecting}
                >
                  {isRedirecting ? 'Redirecting...' : 'Access Admin Panel'}
                </Button>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
      
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