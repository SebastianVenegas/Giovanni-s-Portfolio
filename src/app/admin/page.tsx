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
  const isDark = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chatData, setChatData] = useState<ChatData[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSessions: 0,
    totalMessages: 0,
    activeToday: 0,
    lastActivity: ''
  })
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [expandedContacts, setExpandedContacts] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<ActiveSection>('chatbot')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Track mounted state for theme switching
  useEffect(() => {
    setMounted(true)
  }, [])

  // Theme cycle function
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  // Add styles using useEffect
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Cleanup
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Try to auto-login if API key is in session storage
  useEffect(() => {
    // First check the API status to see if environment variables are working
    const checkApiStatus = async () => {
      try {
        const statusResponse = await fetch('/api/admin/status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('API status check:', statusData);
        }
      } catch (error) {
        console.error('Error checking API status:', error);
      }
    };
    
    checkApiStatus();
    
    const storedApiKey = typeof window !== 'undefined' ? sessionStorage.getItem('admin_api_key') : null;
    
    if (storedApiKey) {
      console.log('Found stored API key, attempting auto-login');
      
      // Use the hardcoded key if the stored one is different, for debugging
      const keyToUse = storedApiKey === 'Aaron3209' ? storedApiKey : 'Aaron3209';
      setApiKey(keyToUse);
      
      // Auto-submit login
      const autoLogin = async () => {
        setIsLoading(true);
        setError('');
        
        try {
          console.log('Auto-login: Attempting with key');
          // First fetch just the stats for quick display
          const statsResponse = await fetch('/api/admin/chats?stats=true', {
            headers: {
              'x-api-key': keyToUse,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Auto-login: Stats response status:', statsResponse.status);
          
          if (!statsResponse.ok) {
            // Try with the hardcoded key as a fallback
            if (keyToUse !== 'Aaron3209') {
              console.log('Auto-login: Trying with hardcoded key as fallback');
              const retryResponse = await fetch('/api/admin/chats?stats=true', {
                headers: {
                  'x-api-key': 'Aaron3209', 
                  'Content-Type': 'application/json'
                }
              });
              
              if (retryResponse.ok) {
                console.log('Auto-login: Retry with hardcoded key succeeded');
                const statsData = await retryResponse.json();
                setStats(statsData.stats);
                setApiKey('Aaron3209'); // Update to use the working key
                setIsAuthenticated(true);
                return; // Exit early as we've succeeded
              }
            }
            
            if (statsResponse.status === 401) {
              throw new Error('Invalid API key - please log in again');
            }
            throw new Error(`Failed to fetch statistics: ${statsResponse.status}`);
          }
          
          // Original request succeeded
          const statsData = await statsResponse.json();
          console.log('Auto-login: Stats data received:', statsData.stats ? 'yes' : 'no');
          setStats(statsData.stats);
          setIsAuthenticated(true);
          
          // Then fetch the full chat data
          console.log('Auto-login: Fetching full chat data');
          const chatResponse = await fetch('/api/admin/chats', {
            headers: {
              'x-api-key': keyToUse,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Auto-login: Chat response status:', chatResponse.status);
          
          if (!chatResponse.ok) {
            throw new Error(`Failed to fetch chat data: ${chatResponse.status}`);
          }
          
          const chatData = await chatResponse.json();
          console.log('Auto-login: Chat data received, chats:', chatData.chats?.length || 0);
          setChatData(chatData.chats || []);
          
          // Update stats again with potentially more accurate data from full payload
          if (chatData.stats) {
            setStats(chatData.stats);
          }
        } catch (error: any) {
          console.error('Auto-login error:', error);
          setError(error.message || 'Auto-login failed. Please log in manually.');
          
          // Don't clear session storage on failure - allow manual login
        } finally {
          setIsLoading(false);
        }
      };
      
      autoLogin();
    }
  }, [])
  
  // Login form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate input
    if (!apiKey || apiKey.trim() === '') {
      setError('Please enter your access code')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    // Store the API key in sessionStorage for future use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin_api_key', apiKey)
    }
    
    try {
      // Try with entered key
      const statsResponse = await fetch('/api/admin/chats?stats=true', {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })
      
      // Handle API errors
      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          throw new Error('Invalid access code. Please try again.')
        } else {
          // Try to get detailed error from response
          let errorDetail = '';
          try {
            const errorJson = await statsResponse.json();
            errorDetail = errorJson.message || '';
          } catch (e) {
            // Ignore if we can't parse the error
          }
          
          throw new Error(`Authentication failed: ${statsResponse.status}${errorDetail ? ` - ${errorDetail}` : ''}`)
        }
      }
      
      // Auth successful
      const statsData = await statsResponse.json()
      setStats(statsData.stats || {})
      setIsAuthenticated(true)
      
      // Then fetch the full chat data in background
      fetchData().catch(error => {
        console.error('Error fetching initial data:', error)
        // Don't show this error to user since they're already logged in
      })
      
    } catch (error: any) {
      setIsAuthenticated(false)
      console.error('Login error:', error)
      
      // Show user-friendly error
      if (error.message.includes('Failed to fetch')) {
        setError('Connection error. Please check your internet connection and try again.')
      } else {
        setError(error.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch (e) {
      return dateString
    }
  }
  
  // Toggle expansion for a contact
  const toggleContactExpansion = (contactId: string) => {
    setExpandedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };
  
  // Filter chats based on search term
  const filteredChats = chatData.filter(chat => 
    chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.contact.phone_number.includes(searchTerm)
  )
  
  // Add the missing fetchData function
  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/chats', {
        headers: {
          'x-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh data');
      }
      
      const data = await response.json();
      setChatData(data.chats);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error: any) {
      // Silently fail refresh but don't show error
      console.error('Error refreshing data:', error);
    }
  };
  
  // Replace the first refreshData function with this combined version
  const refreshData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchData();
      await fetchSummaryData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle export data
  const exportChatData = () => {
    // Create JSON data for export
    const jsonData = JSON.stringify(chatData, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Create a download link and click it
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-logs-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  // Handle logout
  const handleLogout = () => {
    // Clear both cookie and session storage
    document.cookie = "admin_api_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_api_key')
    }
    
    setIsAuthenticated(false)
    setApiKey('')
    setChatData([])
    
    // Redirect to admin-access page
    router.push('/admin-access')
  }
  
  // Add getTotalMessages function
  const getTotalMessages = () => {
    return stats.totalMessages || 0;
  };

  // Theme switch component
  const ThemeSwitch = () => {
    // Don't show animation until mounted
    if (!mounted) return <Monitor className="h-4 w-4" />;
    
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
    );
  };

  // Update the fetchSummaryData function to use headers for authentication
  const fetchSummaryData = async () => {
    try {
      setIsSummaryLoading(true);
      console.log('Fetching summary with API key:', apiKey ? 'Available' : 'Not available');
      
      const response = await fetch('/api/admin/summary', {
        headers: {
          'x-api-key': apiKey || '' // Ensure apiKey is not null
        }
      });
      
      console.log('Summary API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', JSON.stringify(errorData));
        throw new Error(`${errorData.error || `Failed to fetch summary data: ${response.status}`}`);
      }
      
      const data = await response.json();
      console.log('Summary data received:', data ? 'Yes' : 'No');
      setSummaryData(data);
    } catch (error: any) {
      console.error('Error fetching summary data:', error);
      // Set fallback data with error information
      setSummaryData({
        summary: `Unable to generate summary: ${error.message || 'Unknown error'}. Please check that your OpenAI API key is properly configured in the environment variables.`,
        topTopics: ["Check OpenAI API key", "Verify environment variables", "Ensure database is accessible"],
        sentimentAnalysis: { positive: 0, neutral: 100, negative: 0 },
        recentHighlights: [
          {
            contact: "System",
            highlight: "There was an error generating the summary. Check the server logs for more details.",
            sentiment: "neutral"
          }
        ]
      });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Add this to the useEffect that loads data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchSummaryData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if we're in a browser environment before accessing window
    if (typeof window !== 'undefined') {
      // Set base URL for API calls
      if (!process.env.NEXT_PUBLIC_BASE_URL) {
        process.env.NEXT_PUBLIC_BASE_URL = window.location.origin;
      }
    }
  }, []);

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

  return isLoading ? (
    <div className="fixed inset-0 bg-zinc-900 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-zinc-800 blur-md opacity-30 -z-10"></div>
          <Image 
            src="/GV Fav.png" 
            alt="NextGio Logo" 
            width={48} 
            height={48} 
            className="brightness-100 relative z-10"
          />
        </div>
        
        <h1 className="text-xl font-medium text-zinc-200 mb-6">NextGio Admin</h1>
        
        <div className="flex items-center justify-center px-4 py-2 rounded-md bg-zinc-800/50 border border-zinc-700/30">
          <Loader2 className="h-4 w-4 text-zinc-400 animate-spin mr-3" />
          <p className="text-sm text-zinc-400">Initializing dashboard</p>
        </div>
      </motion.div>
    </div>
  ) : !isAuthenticated ? (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
        
        <motion.div
          animate={{
            x: [0, 10, 0],
            y: [0, 15, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-700/20 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -15, 0],
            y: [0, -10, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-600/10 to-purple-700/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] z-10 px-6"
      >
        <div className="backdrop-blur-md bg-zinc-800/40 border border-zinc-700/50 shadow-xl rounded-2xl overflow-hidden">
          {/* Subtle top highlight */}
          <div className="h-0.5 w-full bg-gradient-to-r from-zinc-700/50 via-zinc-500/50 to-zinc-700/50"></div>
          
          <div className="px-8 pt-8 pb-6">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl opacity-50 -z-10"></div>
                <div className="w-20 h-20 flex items-center justify-center overflow-hidden rounded-xl">
                  <Image 
                    src="/GV Fav.png" 
                    alt="NextGio" 
                    width={60} 
                    height={60} 
                    className="object-contain brightness-110"
                  />
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-5 text-2xl font-semibold text-white"
              >
                NextGio Admin
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-2 text-sm text-zinc-400 text-center"
              >
                Enter your access code to manage conversations and analytics
              </motion.p>
            </div>

            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onSubmit={handleLogin}
              className="mt-6 space-y-5"
            >
              <div className="space-y-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-zinc-800/80 border border-zinc-700/80 focus-within:border-zinc-600 rounded-lg overflow-hidden transition-colors duration-200">
                    <div className="flex">
                      <div className="flex items-center justify-center w-12 text-zinc-500">
                        <LockKeyhole className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        placeholder="Access Code"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setError(''); // Clear error when user types
                        }}
                        required
                        className="flex-1 h-12 bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder:text-zinc-500 px-0 py-3"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error message with animation */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-3 rounded bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400 flex items-center">
                        <X className="h-4 w-4 mr-2 flex-shrink-0" />
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  isLoading 
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative z-10 flex items-center justify-center font-medium">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      <span>Verifying access...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogOut className="h-5 w-5 mr-3" />
                      <span>Sign In</span>
                    </div>
                  )}
                </div>
                {/* Button shine effect */}
                {!isLoading && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-20"
                    animate={{ x: ["calc(-100% - 50px)", "calc(100% + 50px)"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                  />
                )}
              </motion.button>
            </motion.form>
          </div>

          <div className="px-8 py-4 bg-black/20 border-t border-zinc-800/50">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>© 2024 NextGio</span>
              <span className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Secure Login
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  ) : (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
      {/* Background logo */}
      <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none">
        <Image 
          src="/GV Fav.png" 
          alt="Background Logo" 
          width={500} 
          height={500}
          className={`opacity-[0.02] ${isDark ? "" : "brightness-0"}`}
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
                    className={cn(
                      "rounded-full shadow-sm",
                      isDark ? "" : "brightness-0"
                    )}
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
                    className={cn(
                      "rounded-full",
                      isDark ? "" : "brightness-0"
                    )}
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
  );
} 