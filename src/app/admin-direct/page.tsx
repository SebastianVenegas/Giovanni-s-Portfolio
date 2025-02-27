"use client"

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function AdminDirectPage() {
  const [isMounted, setIsMounted] = useState(false)
  const linkRef = useRef<HTMLAnchorElement>(null)
  
  useEffect(() => {
    // Set mounted state after hydration
    setIsMounted(true)
    console.log("Admin Direct page mounted")
    
    // Try multiple redirect methods with different timings
    
    // Method 1: window.location.replace (most reliable)
    const timer1 = setTimeout(() => {
      console.log("Executing redirect via window.location.replace")
      try {
        window.location.replace('/admin')
      } catch (err) {
        console.error("Error with window.location.replace:", err)
      }
    }, 1000)
    
    // Method 2: window.location.href (fallback)
    const timer2 = setTimeout(() => {
      console.log("Executing redirect via window.location.href")
      try {
        window.location.href = '/admin'
      } catch (err) {
        console.error("Error with window.location.href:", err)
      }
    }, 1500)
    
    // Method 3: Click hidden link (last resort)
    const timer3 = setTimeout(() => {
      console.log("Executing redirect via link click")
      try {
        if (linkRef.current) {
          linkRef.current.click()
        }
      } catch (err) {
        console.error("Error with link click:", err)
      }
    }, 2000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])
  
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
        className="text-gray-900 dark:text-white text-center z-10"
      >
        <motion.h1 
          className="text-3xl font-bold mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Accessing Admin Panel
        </motion.h1>
        
        <div className="flex justify-center mb-4">
          <div className="flex space-x-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full"
                initial={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-700 dark:text-gray-300"
        >
          Please wait while we redirect you...
        </motion.p>
      </motion.div>
      
      {/* Hidden link for fallback redirect */}
      <a 
        ref={linkRef}
        href="/admin" 
        style={{ display: 'none' }}
      >
        Redirect to Admin
      </a>
      
      {/* Add a visible button as last resort */}
      {isMounted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-10 left-0 right-0 mx-auto text-center"
        >
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            If you're not redirected automatically:
          </p>
          <a
            href="/admin"
            className="inline-block px-6 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white rounded-md shadow-md transition-colors"
          >
            Click here to continue
          </a>
        </motion.div>
      )}
    </div>
  )
} 