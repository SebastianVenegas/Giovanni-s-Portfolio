"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from 'date-fns'
import { 
  Search, 
  UserRound, 
  MessageSquare, 
  ChevronDown, 
  Calendar, 
  Clock, 
  RefreshCw, 
  FileJson, 
  FileText, 
  BarChart3, 
  Download, 
  Trash2, 
  SearchX, 
  LogOut,
  CalendarClock,
  Users,
  Database,
  Check,
  Home,
  Github,
  Loader2,
  LockKeyhole,
  Activity,
  Moon,
  Sun,
  Monitor,
  Bell,
  Brain,
  ClipboardCheck,
  PieChart,
  Sparkles,
  Lightbulb,
  Target,
  Bot,
  Phone,
  LayoutDashboard,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { NextGioConfig } from './components/NextGioConfig'
import AdminChat from './components/AdminChat'
import ConversationsPage from './conversations/page'

// Remove the direct style injection
const globalStyles = {
  '@global': {
    '.glass-card': {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '10px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
    '.gradient-primary': {
      background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
    }
  }
}

// Create a styles object
const styles = `
  .glass-card {
    background: rgba(13, 25, 42, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .glass-card:hover {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  .gradient-primary {
    background: linear-gradient(45deg, #3b82f6, #2563eb);
  }
  
  .glow-effect {
    position: relative;
    overflow: hidden;
  }
  
  .glow-effect::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #3b82f6, #2563eb, #3b82f6);
    border-radius: 12px;
    z-index: -1;
    filter: blur(10px);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  .glow-effect:hover::before {
    opacity: 0.6;
  }
  
  .btn-blue {
    background: linear-gradient(45deg, #3b82f6, #2563eb);
    border: none;
    color: white;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .btn-blue::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0));
    transform: rotate(30deg);
    transition: transform 0.6s ease;
  }
  
  .btn-blue:hover::after {
    transform: rotate(30deg) translate(50%, 50%);
  }
  
  .btn-red {
    background: linear-gradient(45deg, #ef4444, #b91c1c);
    border: none;
    color: white;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .btn-red::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0));
    transform: rotate(30deg);
    transition: transform 0.6s ease;
  }
  
  .btn-red:hover::after {
    transform: rotate(30deg) translate(50%, 50%);
  }
  
  /* Animated background */
  .animated-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: -1;
  }
  
  .grid-pattern {
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  
  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shimmer {
    0% { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
  
  .pulse-animation {
    animation: pulse 3s infinite ease-in-out;
  }
  
  .shimmer {
    background: linear-gradient(90deg, 
      rgba(255,255,255,0) 0%, 
      rgba(255,255,255,0.05) 50%, 
      rgba(255,255,255,0) 100%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
`

interface Message {
  id: number
  contact_id: number
  session_id: string
  role: string
  content: string
  created_at: string
  isTyping?: boolean
}

interface Session {
  sessionId: string
  messages: Message[]
}

interface Contact {
  id: number
  name: string
  phone_number: string
  created_at: string
}

interface ChatData {
  contact: Contact
  sessions: Session[]
}

interface Stats {
  totalUsers: number
  totalSessions: number
  totalMessages: number
  activeToday: number
  lastActivity: string
}

type SummaryData = {
  summary: string;
  topTopics: string[];
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    details?: string;
  };
  recentHighlights: {
    contact: string;
    highlight: string;
    sentiment: string;
    priority?: string;
    actionItem?: string;
  }[];
};

// Add new type for active section
type ActiveSection = 'chatbot' | 'conversations' | 'crm'

export default function AdminPage() {
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState<ActiveSection>('chatbot')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Use a safe default (true) for isDark to match server rendering
  // Only update it after component is mounted
  const isDark = !mounted ? true : resolvedTheme === "dark"
  
  // Track mounted state for theme switching
  useEffect(() => {
    setMounted(true)
    
    // Set the default theme to dark to match our server render
    if (!theme || theme === 'system') {
      setTheme('dark')
    }
  }, [theme, setTheme])

  // Theme cycle function
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  // Add styles using useEffect
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style')
    styleElement.textContent = styles
    document.head.appendChild(styleElement)

    // Cleanup
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])
  
  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Handle logout
  const handleLogout = () => {
    // Clear both cookie and session storage
    document.cookie = "admin_api_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_api_key')
    }
    
    // Redirect to admin-access page
    router.push('/admin-access')
  }

  // Theme switch component
  const ThemeSwitch = () => {
    // Don't show animation until mounted
    if (!mounted) return <Monitor className="h-4 w-4" />
    
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={cycleTheme}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
          "shadow-sm",
          isDark
            ? "bg-white/10 text-white hover:bg-white/20" 
            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          "focus-visible:outline-none focus-visible:ring-2",
          isDark
            ? "focus-visible:ring-white focus-visible:ring-offset-black"
            : "focus-visible:ring-slate-400 focus-visible:ring-offset-white"
        )}
        aria-label="Toggle theme"
      >
        <div className="relative h-5 w-5">
          {/* Dark theme icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{
              scale: theme === "dark" ? 1 : 0,
              opacity: theme === "dark" ? 1 : 0,
              rotate: theme === "dark" ? 0 : -30,
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="h-5 w-5" />
          </motion.div>
          
          {/* Light theme icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: 30 }}
            animate={{
              scale: theme === "light" ? 1 : 0,
              opacity: theme === "light" ? 1 : 0,
              rotate: theme === "light" ? 0 : 30,
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="h-5 w-5" />
          </motion.div>
          
          {/* System theme icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: 30 }}
            animate={{
              scale: theme === "system" ? 1 : 0,
              opacity: theme === "system" ? 1 : 0,
              rotate: theme === "system" ? 0 : 30,
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Monitor className="h-5 w-5" />
          </motion.div>
        </div>
      </motion.button>
    )
  }

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
      {/* Background logo - always use dark theme styles until mounted */}
      <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none">
        <Image 
          src="/GV Fav.png" 
          alt="Background Logo" 
          width={500} 
          height={500}
          className={`opacity-[0.02]`}
        />
      </div>
      
      {/* Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-3">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "mx-auto max-w-7xl rounded-2xl transition-all duration-300",
            isDark
              ? "bg-zinc-800/80 backdrop-blur-sm border border-white/[0.05] shadow-lg shadow-black/5"
              : "bg-white/80 backdrop-blur-sm border border-black/[0.05] shadow-md"
          )}
        >
          <div className="h-14 px-4 flex items-center justify-between relative">
            {/* Left section with logo and status */}
            <div className="flex items-center gap-3 w-[180px]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Image 
                    src="/GV Fav.png" 
                    alt="GV Logo" 
                    width={32} 
                    height={32} 
                    className="rounded-full shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-zinc-800 dark:ring-zinc-900"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className={cn(
                    "font-semibold tracking-tight text-base leading-none",
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  )}>
                    NextGio
                  </h1>
                  <span className={cn(
                    "text-[11px] font-medium",
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  )}>
                    Admin
                  </span>
                </div>
              </div>
              <div className={cn(
                "hidden sm:flex h-5 items-center px-1.5 rounded-full text-[10px] font-medium",
                isDark 
                  ? "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
              )}>
                System
              </div>
            </div>

            {/* Center navigation */}
            <nav className="hidden md:flex items-center gap-3 flex-1 justify-center">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection('chatbot')}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  activeSection === 'chatbot'
                    ? isDark
                      ? "bg-white/10 text-white shadow-sm"
                      : "bg-black/5 text-gray-900 shadow-sm"
                    : isDark
                      ? "text-zinc-400 hover:text-white hover:bg-white/5"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-black/5"
                )}
              >
                <Bot className="h-4 w-4 mr-2 flex-shrink-0" />
                NextGio
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection('conversations')}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  activeSection === 'conversations'
                    ? isDark
                      ? "bg-white/10 text-white shadow-sm"
                      : "bg-black/5 text-gray-900 shadow-sm"
                    : isDark
                      ? "text-zinc-400 hover:text-white hover:bg-white/5"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-black/5"
                )}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                Conversations
              </Button>
            </nav>

            {/* Right section with actions */}
            <div className="flex items-center gap-2 w-[180px] justify-end">
              <ThemeSwitch />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isDark
                    ? "text-zinc-400 hover:text-white hover:bg-white/5"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-black/5"
                )}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 p-0 rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Content with padding for the floating header */}
      <main className="flex-1 overflow-hidden z-10">
        <div className="h-full relative mx-auto max-w-7xl">
          {activeSection === 'chatbot' && <AdminChat isDark={isDark} />}
          {activeSection === 'conversations' && <ConversationsPage />}
        </div>
      </main>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={cn(
                "fixed top-[72px] left-4 right-4 z-[95] rounded-xl overflow-hidden md:hidden",
                isDark
                  ? "bg-zinc-950/90 backdrop-blur-md border border-zinc-800/40"
                  : "bg-white/90 backdrop-blur-md border border-zinc-200/70",
              )}
            >
              <div className="py-4 px-2">
                {/* Add logo at the top of mobile menu */}
                <div className="flex justify-center mb-4">
                  <Image 
                    src="/GV Fav.png" 
                    alt="GV Logo" 
                    width={40} 
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setActiveSection('chatbot');
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "justify-center rounded-xl py-6 transition-all duration-200 flex gap-3 items-center",
                      activeSection === 'chatbot'
                        ? isDark 
                          ? "bg-white/10 text-white shadow-sm"
                          : "bg-black/5 text-gray-900 shadow-sm"
                        : isDark
                          ? "text-white/80 hover:text-white hover:bg-white/5"
                          : "text-gray-700 hover:text-gray-900 hover:bg-black/5",
                    )}
                  >
                    <Bot className="h-5 w-5" />
                    <span className="text-sm font-medium">NextGio</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setActiveSection('conversations');
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "justify-center rounded-xl py-6 transition-all duration-200 flex gap-3 items-center",
                      activeSection === 'conversations'
                        ? isDark 
                          ? "bg-white/10 text-white shadow-sm"
                          : "bg-black/5 text-gray-900 shadow-sm"
                        : isDark
                          ? "text-white/80 hover:text-white hover:bg-white/5"
                          : "text-gray-700 hover:text-gray-900 hover:bg-black/5",
                    )}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm font-medium">Conversations</span>
                  </Button>
                  <div className="border-t border-zinc-200/20 my-2"></div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={cn(
                      "justify-center rounded-xl py-6 transition-all duration-200 flex gap-3 items-center",
                      isDark
                        ? "text-white/80 hover:text-white hover:bg-white/5"
                        : "text-gray-700 hover:text-gray-900 hover:bg-black/5",
                    )}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Log Out</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 