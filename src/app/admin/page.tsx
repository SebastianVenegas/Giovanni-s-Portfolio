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
  MessagesSquare, 
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
  MessageSquare,
  Activity,
  Moon,
  Sun,
  Monitor,
  Bell,
  Brain,
  ClipboardCheck,
  PieChart,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

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
  };
  recentHighlights: {
    contact: string;
    highlight: string;
    sentiment: string;
  }[];
};

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
    
    if (!apiKey) {
      setError('Please enter the API key')
      return
    }
    
    console.log(`Logging in with API key length: ${apiKey.length}, key: ${apiKey === 'Aaron3209' ? 'matches hardcoded' : 'does not match hardcoded'}`)
    
    // Store the API key in sessionStorage for future use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin_api_key', apiKey)
      console.log('API key stored in session storage')
    }
    
    setIsLoading(true)
    setError('')
    
    // Try multiple API keys if needed
    const keysToTry = [apiKey];
    if (apiKey !== 'Aaron3209') {
      keysToTry.push('Aaron3209'); // Add fallback key
    }
    
    let loginSuccess = false;
    
    for (const keyAttempt of keysToTry) {
      if (loginSuccess) break;
      
      try {
        console.log(`Trying login with key: ${keyAttempt === 'Aaron3209' ? 'hardcoded key' : 'user-entered key'}`)
        
        // Test with status endpoint first
        try {
          const statusResponse = await fetch('/api/admin/status');
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('API status before login attempt:', statusData);
          }
        } catch (error) {
          console.error('Error checking API status:', error);
        }
        
        // First fetch just the stats for quick display
        const statsResponse = await fetch('/api/admin/chats?stats=true', {
        headers: {
            'x-api-key': keyAttempt,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Stats response status:', statsResponse.status)
        
        if (!statsResponse.ok) {
          if (statsResponse.status === 401) {
            console.error('Authentication failed with status 401 - Invalid API key')
            // Continue to next key if available
            continue;
          }
          
          // Try to get detailed error from response
          let errorDetail = '';
          try {
            const errorJson = await statsResponse.json();
            errorDetail = errorJson.message || '';
          } catch (e) {
            // Ignore if we can't parse the error
          }
          
          throw new Error(`Failed to fetch statistics: ${statsResponse.status}${errorDetail ? ` - ${errorDetail}` : ''}`)
        }
        
        // This key worked!
        if (keyAttempt !== apiKey) {
          console.log('Login succeeded with fallback key - updating state');
          setApiKey(keyAttempt);
          // Update in session storage too
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('admin_api_key', keyAttempt);
          }
        }
        
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      setIsAuthenticated(true)
        loginSuccess = true;
        
        // Then fetch the full chat data
        console.log('Fetching full chat data')
        const chatResponse = await fetch('/api/admin/chats', {
          headers: {
            'x-api-key': keyAttempt,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Chat response status:', chatResponse.status)
        
        if (!chatResponse.ok) {
          throw new Error(`Failed to fetch chat data: ${chatResponse.status}`)
        }
        
        const chatData = await chatResponse.json()
        setChatData(chatData.chats || [])
        
        // Update stats again with potentially more accurate data from full payload
        if (chatData.stats) {
          setStats(chatData.stats)
        }
        
    } catch (error: any) {
        if (keyAttempt === keysToTry[keysToTry.length - 1]) {
          // Only show error if we've tried all keys
          console.error('Login error:', error)
          setError(error.message || 'Failed to login. Please check the API key and try again.')
          setIsAuthenticated(false)
        } else {
          console.log('Login failed with this key, trying fallback...');
        }
      }
    }
    
    setIsLoading(false)
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
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_api_key')
    }
    
    setIsAuthenticated(false)
    setApiKey('')
    setChatData([])
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

  return isLoading ? (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#040d18] via-[#071526] to-[#0a1c34]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-xl bg-[#071018]/80 shadow-xl border border-white/5 backdrop-blur-md flex flex-col items-center"
      >
        <Image 
          src="/GV Fav.png" 
          alt="GV Logo" 
          width={60} 
          height={60}
          className="mb-4 animate-pulse rounded-sm"
        />
        <h1 className="text-xl font-bold text-blue-400 mb-2">NextGio Admin</h1>
        <p className="text-gray-400 mb-6 text-center">Initializing dashboard...</p>
        <div className="relative w-48 h-1.5 bg-[#0c1829] rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  ) : !isAuthenticated ? (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-[#040d18] via-[#071526] to-[#0a1c34] overflow-hidden">
      {/* Animated Background */}
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
            
          <form onSubmit={handleLogin}>
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
                    value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    required
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-gray-500 h-12 text-lg px-4 pr-10"
                        autoFocus
                      />
                      <motion.div 
                        animate={{ 
                          rotate: isLoading ? [0, 360] : 0
                        }}
                        transition={{ 
                          duration: 1,
                          repeat: isLoading ? Infinity : 0,
                          ease: "linear"
                        }}
                        className="absolute right-3 top-3.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isLoading ? 'text-green-500' : 'text-gray-400'}`}>
                          {isLoading ? (
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
                    {isLoading && (
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
                            <p className="text-sm text-green-500 font-medium">Authenticating...</p>
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
                      isLoading 
                        ? 'gradient-primary' 
                        : 'glass-effect glass-card bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white'
                    } shadow-lg`}
                    disabled={isLoading}
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
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
                    {!isLoading && (
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
      <a 
        href="/admin" 
        id="admin-redirect-link" 
        style={{ display: 'none' }}
        ref={(node) => {
          if (node && isLoading) {
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
    </div>
  ) : (
    <div className={cn(
      "min-h-screen flex flex-col relative overflow-hidden",
      isDark 
        ? "bg-gradient-to-br from-[#040d18] via-[#071526] to-[#0a1c34] text-white"
        : "bg-gradient-to-br from-blue-50/80 via-slate-50 to-white text-slate-900"
    )}>
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 overflow-hidden z-0"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0.3 }}
          animate={{ 
            scale: [0.8, 1.1, 0.8],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          className={cn(
            "absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[100px]",
            isDark ? "bg-blue-500/5" : "bg-blue-300/20"
          )}
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0.2 }}
          animate={{ 
            scale: [0.8, 1.1, 0.8],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 30, delay: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          className={cn(
            "absolute -bottom-[40%] -right-[10%] w-[80%] h-[80%] rounded-full blur-[120px]",
            isDark ? "bg-blue-500/5" : "bg-indigo-200/30"
          )}
        />
        <div className={cn(
          "absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)]",
          isDark ? "opacity-30" : "opacity-10"
        )}>
          {Array.from({ length: 40 }).map((_, i) => (
            Array.from({ length: 40 }).map((_, j) => (
              <div 
                key={`${i}-${j}`} 
                className={isDark ? "border-[0.5px] border-blue-500/5" : "border-[0.5px] border-slate-400/10"}
              ></div>
            ))
          ))}
        </div>
      </motion.div>

      {/* Content container with scrolling */}
      <div className="flex flex-col flex-grow relative z-10">
        {/* Header - Fixed */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
          className={cn(
            "sticky top-0 z-30 backdrop-blur-xl border-b shadow-lg",
            isDark 
              ? "bg-[#071018]/80 border-white/5"
              : "bg-white/70 border-slate-200"
          )}
        >
          <div className="container mx-auto py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative w-10 h-10 flex items-center justify-center"
                >
                  <div className={cn(
                    "absolute inset-0 rounded-full blur-md animate-pulse",
                    isDark ? "bg-blue-500/10" : "bg-blue-500/20"
                  )} />
                  <Image 
                    src="/GV Fav.png" 
                    alt="GV Logo" 
                    width={30} 
                    height={30} 
                    className="relative z-10 rounded-sm"
                  />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    <span className={cn(
                      "bg-clip-text text-transparent",
                      isDark 
                        ? "bg-gradient-to-r from-white to-gray-300"
                        : "bg-gradient-to-r from-gray-900 to-gray-700"
                    )}>
                      NextGio <span className={isDark ? "text-blue-400" : "text-blue-600"}>Admin</span>
                    </span>
                  </h1>
                  <p className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-600"}>Dashboard & Management</p>
                </div>
      </div>
      
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={refreshData}
                    variant="outline" 
                    className={cn(
                      "flex items-center gap-2 border transition-all duration-300 rounded-xl h-10 px-4 shadow-lg backdrop-blur-xl",
                      isDark 
                        ? "bg-[#0c1829]/80 border-white/10 hover:bg-blue-500/10 hover:border-blue-400/30 text-gray-200 hover:text-blue-300"
                        : "bg-white/80 border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-gray-700 hover:text-blue-600"
                    )}
                  >
                    <motion.div
                      animate={{ rotate: isRefreshing ? 360 : 0 }}
                      transition={{ duration: 0.8, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                    >
                      <RefreshCw className={cn("h-4 w-4", isDark ? "text-blue-400" : "text-blue-500")} />
                    </motion.div>
                    <span className="text-sm font-medium">Refresh Data</span>
                  </Button>
                </motion.div>
                
                {/* Theme Switch */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThemeSwitch />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={handleLogout}
                    variant="default" 
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 border-0 text-white shadow-lg rounded-xl h-10 px-4 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Log Out</span>
                  </Button>
                </motion.div>
        </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 container mx-auto p-6 space-y-6">
          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5"
          >
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={cn(
                "relative overflow-hidden rounded-xl border p-5 backdrop-blur-xl shadow-lg group",
                isDark
                  ? "bg-[#071018]/70 border-white/5"
                  : "bg-white border-slate-200"
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isDark ? "from-blue-500/5 to-transparent" : "from-blue-100 to-transparent"
              )} />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={isDark ? "text-gray-400 text-sm font-medium" : "text-gray-500 text-sm font-medium"}>Total Users</h3>
                  <div className={cn(
                    "rounded-full p-2",
                    isDark ? "bg-blue-500/20" : "bg-blue-50"
                  )}>
                    <Users className={isDark ? "h-4 w-4 text-blue-300" : "h-4 w-4 text-blue-500"} />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className={isDark ? "text-3xl font-bold text-white" : "text-3xl font-bold text-slate-800"}>{stats.totalUsers}</span>
                  <span className={cn(
                    "ml-2 text-xs px-1.5 py-0.5 rounded",
                    isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-500 bg-blue-50"
                  )}>
                    All Time
                  </span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={cn(
                "relative overflow-hidden rounded-xl border p-5 backdrop-blur-xl shadow-lg group",
                isDark
                  ? "bg-[#071018]/70 border-white/5"
                  : "bg-white border-slate-200"
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isDark ? "from-blue-500/5 to-transparent" : "from-blue-500/10 to-transparent"
              )} />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={isDark ? "text-gray-400 text-sm font-medium" : "text-gray-600 text-sm font-medium"}>Total Sessions</h3>
                  <div className={cn(
                    "rounded-full p-2",
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  )}>
                    <MessageSquare className={isDark ? "h-4 w-4 text-blue-300" : "h-4 w-4 text-blue-600"} />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className={isDark ? "text-3xl font-bold text-white" : "text-3xl font-bold text-gray-900"}>{stats.totalSessions}</span>
                  <span className={cn(
                    "ml-2 text-xs px-1.5 py-0.5 rounded",
                    isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-100"
                  )}>
                    Sessions
                  </span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={cn(
                "relative overflow-hidden rounded-xl border p-5 backdrop-blur-xl shadow-lg group",
                isDark
                  ? "bg-[#071018]/70 border-white/5"
                  : "bg-white border-slate-200"
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isDark ? "from-blue-500/5 to-transparent" : "from-blue-500/10 to-transparent"
              )} />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={isDark ? "text-gray-400 text-sm font-medium" : "text-gray-600 text-sm font-medium"}>Total Messages</h3>
                  <div className={cn(
                    "rounded-full p-2",
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  )}>
                    <MessagesSquare className={isDark ? "h-4 w-4 text-blue-300" : "h-4 w-4 text-blue-600"} />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className={isDark ? "text-3xl font-bold text-white" : "text-3xl font-bold text-gray-900"}>{stats.totalMessages}</span>
                  <span className={cn(
                    "ml-2 text-xs px-1.5 py-0.5 rounded",
                    isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-100"
                  )}>
                    Messages
                  </span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={cn(
                "relative overflow-hidden rounded-xl border p-5 backdrop-blur-xl shadow-lg group",
                isDark
                  ? "bg-[#071018]/70 border-white/5"
                  : "bg-white border-slate-200"
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isDark ? "from-blue-500/5 to-transparent" : "from-blue-500/10 to-transparent"
              )} />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={isDark ? "text-gray-400 text-sm font-medium" : "text-gray-600 text-sm font-medium"}>Active Today</h3>
                  <div className={cn(
                    "rounded-full p-2",
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  )}>
                    <Activity className={isDark ? "h-4 w-4 text-blue-300" : "h-4 w-4 text-blue-600"} />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className={isDark ? "text-3xl font-bold text-white" : "text-3xl font-bold text-gray-900"}>{stats.activeToday}</span>
                  <span className={cn(
                    "ml-2 text-xs px-1.5 py-0.5 rounded",
                    isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-100"
                  )}>
                    Users
                  </span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={cn(
                "relative overflow-hidden rounded-xl border p-5 backdrop-blur-xl shadow-lg group",
                isDark
                  ? "bg-[#071018]/70 border-white/5"
                  : "bg-white border-slate-200"
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isDark ? "from-blue-500/5 to-transparent" : "from-blue-500/10 to-transparent"
              )} />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={isDark ? "text-gray-400 text-sm font-medium" : "text-gray-600 text-sm font-medium"}>Last Activity</h3>
                  <div className={cn(
                    "rounded-full p-2",
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  )}>
                    <Clock className={isDark ? "h-4 w-4 text-blue-300" : "h-4 w-4 text-blue-600"} />
                  </div>
                </div>
                <div>
                  <span className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-gray-900"}>{formatDate(stats.lastActivity)}</span>
                  <p className={isDark ? "text-xs text-blue-400 mt-1" : "text-xs text-gray-500 mt-1"}>
                    <span className={cn(
                      "inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 pulse-animation",
                      isDark ? "text-green-400" : "text-green-600"
                    )}></span> 
                    Recent interaction
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
            className={cn(
              "relative overflow-hidden rounded-xl border p-6 backdrop-blur-xl shadow-lg",
              isDark
                ? "bg-[#071018]/70 border-white/5"
                : "bg-white border-slate-200"
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-50",
              isDark ? "from-blue-500/5 to-transparent" : "from-blue-50 to-transparent"
            )} />
            <div className="relative z-10">
              <Tabs defaultValue="chats" className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
                  className={cn(
                    "mb-8 rounded-xl border p-6 backdrop-blur-xl shadow-lg",
                    isDark
                      ? "glass-card border-white/5"
                      : "bg-white/95 border-slate-200"
                  )}
                >
                  <h2 className={cn(
                    "text-xl font-bold mb-4 flex items-center",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    <Database className={cn("h-5 w-5 mr-2", isDark ? "text-blue-400" : "text-blue-600")} />
                    AI Chat Analysis
                    {isSummaryLoading && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="ml-3"
                      >
                        <RefreshCw className={cn("h-4 w-4", isDark ? "text-blue-400" : "text-blue-500")} />
                      </motion.div>
                    )}
                  </h2>
                  
                  {summaryData ? (
                    <div className="space-y-6">
                      {/* Summary Text */}
                      <div className={cn(
                        "p-4 rounded-lg",
                        isDark ? "bg-[#071018]/50" : "bg-blue-50/50"
                      )}>
                        <h3 className={cn(
                          "font-medium mb-2",
                          isDark ? "text-blue-300" : "text-blue-700"
                        )}>
                          Conversation Summary
                        </h3>
                        <p className={cn(
                          "text-sm whitespace-pre-line",
                          isDark ? "text-gray-300" : "text-slate-700"
                        )}>
                          {summaryData.summary}
                        </p>
                      </div>
                      
                      {/* Topic & Sentiment Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Topics */}
                        <div className={cn(
                          "p-4 rounded-lg",
                          isDark ? "bg-[#071018]/50" : "bg-slate-50"
                        )}>
                          <h3 className={cn(
                            "font-medium mb-3",
                            isDark ? "text-blue-300" : "text-blue-700"
                          )}>
                            Top Topics
                          </h3>
                          <ul className="space-y-2">
                            {summaryData.topTopics.length > 0 ? (
                              summaryData.topTopics.map((topic, idx) => (
                                <li 
                                  key={idx} 
                                  className={cn(
                                    "flex items-center text-sm py-1 px-3 rounded-md",
                                    isDark 
                                      ? "bg-blue-500/10 text-gray-300" 
                                      : "bg-blue-100/50 text-slate-700"
                                  )}
                                >
                                  <span className={cn(
                                    "w-5 h-5 flex items-center justify-center rounded-full mr-2 text-xs",
                                    isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-200 text-blue-700"
                                  )}>
                                    {idx + 1}
                                  </span>
                                  {topic}
                                </li>
                              ))
                            ) : (
                              <li className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                                No topics available yet
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        {/* Sentiment */}
                        <div className={cn(
                          "p-4 rounded-lg",
                          isDark ? "bg-[#071018]/50" : "bg-slate-50"
                        )}>
                          <h3 className={cn(
                            "font-medium mb-3",
                            isDark ? "text-blue-300" : "text-blue-700"
                          )}>
                            Sentiment Analysis
                          </h3>
                          
                          <div className="space-y-3">
                            {/* Positive */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className={isDark ? "text-green-300" : "text-green-600"}>Positive</span>
                                <span className={isDark ? "text-green-300" : "text-green-600"}>
                                  {summaryData.sentimentAnalysis.positive}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-700/20 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${summaryData.sentimentAnalysis.positive}%` }}
                                  transition={{ duration: 1, type: "spring", stiffness: 100, damping: 15 }}
                                  className="h-full bg-green-500 rounded-full"
                                />
                              </div>
                            </div>
                            
                            {/* Neutral */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className={isDark ? "text-blue-300" : "text-blue-600"}>Neutral</span>
                                <span className={isDark ? "text-blue-300" : "text-blue-600"}>
                                  {summaryData.sentimentAnalysis.neutral}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-700/20 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${summaryData.sentimentAnalysis.neutral}%` }}
                                  transition={{ duration: 1, type: "spring", stiffness: 100, damping: 15 }}
                                  className="h-full bg-blue-500 rounded-full"
                                />
                              </div>
                            </div>
                            
                            {/* Negative */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className={isDark ? "text-red-300" : "text-red-600"}>Negative</span>
                                <span className={isDark ? "text-red-300" : "text-red-600"}>
                                  {summaryData.sentimentAnalysis.negative}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-700/20 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${summaryData.sentimentAnalysis.negative}%` }}
                                  transition={{ duration: 1, type: "spring", stiffness: 100, damping: 15 }}
                                  className="h-full bg-red-500 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Highlights */}
                      <div className={cn(
                        "p-4 rounded-lg",
                        isDark ? "bg-[#071018]/50" : "bg-slate-50"
                      )}>
                        <h3 className={cn(
                          "font-medium mb-3",
                          isDark ? "text-blue-300" : "text-blue-700"
                        )}>
                          Conversation Highlights
                        </h3>
                        
                        <div className="space-y-3">
                          {summaryData.recentHighlights.length > 0 ? (
                            summaryData.recentHighlights.map((highlight, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className={cn(
                                  "p-3 rounded-lg border",
                                  isDark 
                                    ? "border-white/5 bg-blue-500/5" 
                                    : "border-slate-200 bg-white",
                                  highlight.sentiment === "positive" 
                                    ? "border-l-4 border-l-green-500" 
                                    : highlight.sentiment === "negative"
                                      ? "border-l-4 border-l-red-500"
                                      : "border-l-4 border-l-blue-500"
                                )}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-white" : "text-slate-800"
                                  )}>
                                    {highlight.contact}
                                  </h4>
                                  <Badge className={cn(
                                    "text-xs",
                                    highlight.sentiment === "positive" 
                                      ? isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"
                                      : highlight.sentiment === "negative"
                                        ? isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700"
                                        : isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                                  )}>
                                    {highlight.sentiment}
                                  </Badge>
                                </div>
                                <p className={cn(
                                  "text-sm",
                                  isDark ? "text-gray-300" : "text-slate-600"
                                )}>
                                  {highlight.highlight}
                                </p>
                              </motion.div>
                            ))
                          ) : (
                            <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                              No highlights available yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "py-12 flex flex-col items-center justify-center",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      {isSummaryLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="mb-4"
                        >
                          <RefreshCw className="h-12 w-12 opacity-30" />
                        </motion.div>
                      ) : (
                        <>
                          <Database className="h-12 w-12 opacity-30 mb-4" />
                          <p className="text-center max-w-md">
                            AI summary will appear here once chat data is available and analyzed
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                  className="mb-6"
                >
                  <TabsList className={cn(
                    "p-1 rounded-lg border shadow-md",
                    isDark 
                      ? "bg-[#0c1829]/80 border-white/5"
                      : "bg-slate-50 border-slate-200"
                  )}>
                      <TabsTrigger 
                      value="chats" 
                      onClick={() => setActiveTab('chats')}
                      className={cn(
                        "rounded-md py-2.5 px-4 transition-all duration-300",
                        "data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:border-0 data-[state=active]:shadow-md",
                        isDark 
                          ? "data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=inactive]:text-gray-400"
                          : "data-[state=active]:from-blue-500 data-[state=active]:to-blue-400 data-[state=inactive]:text-gray-500",
                        "data-[state=inactive]:bg-transparent"
                      )}
                    >
                      <motion.span 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Users & Chats
                      </motion.span>
                      </TabsTrigger>
                    <TabsTrigger 
                      value="export" 
                      onClick={() => setActiveTab('export')}
                      className={cn(
                        "rounded-md py-2.5 px-4 transition-all duration-300",
                        "data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:border-0 data-[state=active]:shadow-md",
                        isDark 
                          ? "data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=inactive]:text-gray-400"
                          : "data-[state=active]:from-blue-500 data-[state=active]:to-blue-400 data-[state=inactive]:text-gray-500",
                        "data-[state=inactive]:bg-transparent"
                      )}
                    >
                      <motion.span 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </motion.span>
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

                <TabsContent value="chats" className="space-y-6">
                  <div className={cn(
                    "rounded-xl border shadow-lg p-6",
                    isDark
                      ? "glass-card border-white/5"
                      : "bg-white/95 border-slate-200"
                  )}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                      className="relative mb-6"
                    >
                      <Input
                        type="text"
                        placeholder="Search by name, message content, or session ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cn(
                          "border pr-10 h-12 rounded-xl shadow-sm",
                          isDark
                            ? "bg-[#0c1829]/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-white"
                            : "bg-white border-slate-200 focus:border-blue-400/50 focus:ring-blue-400/20 text-slate-900"
                        )}
                      />
                      <Search className={cn(
                        "absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5",
                        isDark ? "text-gray-400" : "text-gray-400"
                      )} />
                    </motion.div>

                    {filteredChats.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
                        className="space-y-5"
                      >
                        {filteredChats.map((chat, idx) => (
                          <motion.div
                            key={chat.contact.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.5, 
                              delay: 0.05 * Math.min(idx, 5),
                              type: "spring",
                              stiffness: 100,
                              damping: 15
                            }}
                            onClick={() => {
                              console.log('Clicked chat:', chat.contact.id);
                              toggleContactExpansion(chat.contact.id.toString());
                            }}
                            className={cn(
                              "overflow-hidden border hover:border-blue-500/30 transition-all duration-300 shadow-lg rounded-xl relative group cursor-pointer",
                              expandedContacts.includes(chat.contact.id.toString()) && (isDark ? "bg-blue-500/5" : "bg-blue-50/50"),
                              isDark
                                ? "glass-card border-white/10"
                                : "bg-white border-slate-200/80"
                            )}
                          >
                            <motion.div 
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{
                                boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.15)',
                                borderRadius: 'inherit'
                              }}
                            />
                            <div className="p-5 hover:bg-blue-500/5 transition-colors duration-300">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className={cn(
                                    "font-bold group-hover:text-blue-500 transition-colors duration-300",
                                    isDark ? "text-white text-base" : "text-slate-800 text-base"
                                  )}>
                                    {chat.contact.name}
                                  </h3>
                                  <div className="flex items-center mt-1 space-x-3">
                                    <p className={cn(
                                      "text-xs flex items-center",
                                      isDark ? "text-gray-400" : "text-gray-500" 
                                    )}>
                                      <span className={cn(
                                        "inline-block w-1.5 h-1.5 rounded-full mr-1.5 opacity-70",
                                        isDark ? "bg-blue-500" : "bg-blue-500"
                                      )}></span>
                                      Session: {chat.sessions[0]?.sessionId.substring(0, 8)}
                                    </p>
                                    <p className={cn(
                                      "text-xs flex items-center",
                                      isDark ? "text-gray-400" : "text-gray-500" 
                                    )}>
                                      <CalendarClock className="h-3 w-3 mr-1.5 text-gray-500" />
                                      {formatDate(chat.contact.created_at)}
                          </p>
                        </div>
                                </div>
                                <div className="flex items-center">
                                  <Badge className={cn(
                                    "mr-3 text-white border-none text-xs px-2.5 py-1 rounded-lg shadow-sm",
                                    isDark ? "bg-blue-500/80" : "bg-blue-500"
                                  )}>
                                    {chat.sessions[0]?.messages.length} messages
                                  </Badge>
                                  <motion.div
                                    animate={{ rotate: expandedContacts.includes(chat.contact.id.toString()) ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn(
                                      "flex justify-center items-center w-8 h-8 rounded-full group-hover:bg-blue-500/20 transition-colors duration-300",
                                      isDark ? "bg-white/5" : "bg-slate-100"
                                    )}
                                  >
                                    <ChevronDown className={cn(
                                      "h-4 w-4 group-hover:text-blue-500 transition-colors duration-300",
                                      isDark ? "text-gray-400" : "text-gray-500"
                                    )} />
                                  </motion.div>
                                </div>
                              </div>
                            </div>

                            {/* Expanded chat content */}
                            <AnimatePresence mode="wait">
                              {expandedContacts.includes(chat.contact.id.toString()) && (
                                <motion.div
                                  key={`expanded-${chat.contact.id}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                  className={cn(
                                    "overflow-hidden border-t",
                                    isDark ? "border-white/5" : "border-slate-200"
                                  )}
                                >
                                  <div className="p-5 space-y-4">
                                    {chat.sessions.map((session) => (
                                      <div key={session.sessionId} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <h4 className={cn(
                                            "text-sm font-medium",
                                            isDark ? "text-blue-400" : "text-blue-600"
                                          )}>
                                            Session {session.sessionId.substring(0, 8)}
                                          </h4>
                                          <Badge className={cn(
                                            "border-none",
                                            isDark 
                                              ? "bg-blue-500/20 text-blue-300" 
                                              : "bg-blue-100 text-blue-600"
                                          )}>
                                            {session.messages.length} messages
                                          </Badge>
                                        </div>
                                        <div className="space-y-2">
                          {session.messages.map((message) => (
                            <div 
                              key={message.id} 
                                              className={cn(
                                                "p-3 rounded-lg text-sm",
                                                message.role === "user" 
                                                  ? isDark 
                                                    ? "bg-[#0e1c2e] text-white"
                                                    : "bg-blue-50 text-slate-700"
                                                  : isDark
                                                    ? "bg-[#071018] text-gray-300"
                                                    : "bg-slate-100 text-slate-800"
                                              )}
                                            >
                                              <div className="flex items-center mb-1">
                                                <span className={cn(
                                                  "text-xs font-medium",
                                                  message.role === "user" 
                                                    ? isDark 
                                                      ? "text-blue-400" 
                                                      : "text-blue-600"
                                                    : isDark 
                                                      ? "text-gray-400" 
                                                      : "text-gray-600"
                                                )}>
                                                  {message.role === "user" ? "User" : "Assistant"}
                                </span>
                                                <span className={cn(
                                                  "text-xs ml-2",
                                                  isDark ? "text-gray-500" : "text-gray-600"
                                                )}>
                                  {formatDate(message.created_at)}
                                </span>
                              </div>
                                              {message.isTyping ? (
                                                <div className="flex space-x-2 items-center h-6">
                                                  <motion.div
                                                    className={cn(
                                                      "w-2 h-2 rounded-full",
                                                      isDark ? "bg-blue-400" : "bg-blue-600"
                                                    )}
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, repeat: Infinity }}
                                                  />
                                                  <motion.div
                                                    className={cn(
                                                      "w-2 h-2 rounded-full",
                                                      isDark ? "bg-blue-400" : "bg-blue-600"
                                                    )}
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                                                  />
                                                  <motion.div
                                                    className={cn(
                                                      "w-2 h-2 rounded-full",
                                                      isDark ? "bg-blue-400" : "bg-blue-600"
                                                    )}
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }}
                                                  />
                                                </div>
                                              ) : (
                                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : chatData.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
                        className={cn(
                          "flex flex-col items-center justify-center p-10 text-center rounded-xl",
                          isDark ? "glass-card" : "bg-white/90"
                        )}
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className={cn(
                            "w-16 h-16 flex items-center justify-center rounded-full mb-4 shadow-lg",
                            isDark ? "bg-[#0c1829]/80" : "bg-slate-100"
                          )}
                        >
                          <SearchX className={cn(
                            "h-8 w-8",
                            isDark ? "text-blue-400/60" : "text-blue-500/70"
                          )} />
                        </motion.div>
                        <h3 className={cn(
                          "text-lg font-bold mb-2",
                          isDark ? "text-white" : "text-slate-900"
                        )}>No matching results</h3>
                        <p className={isDark ? "text-gray-400 max-w-md" : "text-gray-600 max-w-md"}>Try adjusting your search term to find what you're looking for</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
                        className={cn(
                          "flex flex-col items-center justify-center p-10 text-center rounded-xl",
                          isDark ? "glass-card" : "bg-white/90"
                        )}
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className={cn(
                            "w-16 h-16 flex items-center justify-center rounded-full mb-4 shadow-lg",
                            isDark ? "bg-[#0c1829]/80" : "bg-slate-100"
                          )}
                        >
                          <MessagesSquare className={cn(
                            "h-8 w-8",
                            isDark ? "text-blue-400/60" : "text-blue-500/70"
                          )} />
                        </motion.div>
                        <h3 className={cn(
                          "text-lg font-bold mb-2",
                          isDark ? "text-white" : "text-slate-900"
                        )}>No chat data available</h3>
                        <p className={isDark ? "text-gray-400 max-w-md" : "text-gray-600 max-w-md"}>Chat data will appear here when users interact with NextGio</p>
                      </motion.div>
                    )}
        </div>
                </TabsContent>

                <TabsContent value="export" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
                    className={cn(
                      "rounded-xl border p-6 shadow-lg",
                      isDark
                        ? "glass-card border-white/10"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <h2 className={cn(
                      "text-xl font-bold mb-4 flex items-center",
                      isDark ? "text-white" : "text-slate-900"
                    )}>
                      <Download className={cn("h-5 w-5 mr-2", isDark ? "text-blue-400" : "text-blue-600")} />
                      Export All Data
                    </h2>
                    <p className={isDark ? "text-gray-400 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
                      Export all users, sessions, and messages data in JSON format for backup or analysis.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className={cn(
                          "glass-card rounded-lg p-5 border hover:border-blue-500/30 transition-all duration-300",
                          isDark ? "border-white/5" : "border-slate-200/50 bg-white/70"
                        )}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                              isDark ? "bg-blue-500/20" : "bg-blue-100"
                            )}>
                              <Users className={isDark ? "h-5 w-5 text-blue-400" : "h-5 w-5 text-blue-600"} />
    </div>
                            <div>
                              <h3 className={isDark ? "font-bold text-white" : "font-bold text-slate-900"}>User Data</h3>
                              <p className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-600"}>All user profiles and contact info</p>
                            </div>
                          </div>
                          <Badge className={cn(
                            "border-none",
                            isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
                          )}>
                            {chatData?.length || 0} Records
                          </Badge>
                        </div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button 
                            onClick={exportChatData}
                            className="w-full bg-gradient-to-r from-blue-600/80 to-blue-500/80 text-white border-none hover:from-blue-600 hover:to-blue-500 transition-all duration-300"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Users
                          </Button>
                        </motion.div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className={cn(
                          "glass-card rounded-lg p-5 border hover:border-blue-500/30 transition-all duration-300",
                          isDark ? "border-white/5" : "border-slate-200/50 bg-white/70"
                        )}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                              isDark ? "bg-blue-500/20" : "bg-blue-100"
                            )}>
                              <MessagesSquare className={isDark ? "h-5 w-5 text-blue-400" : "h-5 w-5 text-blue-600"} />
                            </div>
                            <div>
                              <h3 className={isDark ? "font-bold text-white" : "font-bold text-slate-900"}>Message Data</h3>
                              <p className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-600"}>All conversations and interactions</p>
                            </div>
                          </div>
                          <Badge className={cn(
                            "border-none",
                            isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
                          )}>
                            {getTotalMessages()} Records
                          </Badge>
                        </div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button 
                            onClick={exportChatData}
                            className="w-full bg-gradient-to-r from-blue-600/80 to-blue-500/80 text-white border-none hover:from-blue-600 hover:to-blue-500 transition-all duration-300"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Messages
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={cn(
                        "glass-card rounded-lg p-5 border hover:border-blue-500/30 transition-all duration-300",
                        isDark ? "border-white/5" : "border-slate-200/50 bg-white/70"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mr-3">
                            <Database className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className={isDark ? "font-bold text-white" : "font-bold text-slate-900"}>Complete Dataset</h3>
                            <p className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-600"}>Export all data as a single JSON file</p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "border-none",
                          isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
                        )}>Full Backup</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className={cn(
                          "rounded-lg p-3 border",
                          isDark ? "bg-[#071018] border-white/5" : "bg-slate-50 border-slate-200/50"
                        )}>
                          <div className="flex justify-between items-center">
                            <span className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-600"}>Includes user data</span>
                            <Check className={isDark ? "h-4 w-4 text-blue-400" : "h-4 w-4 text-blue-600"} />
                          </div>
                        </div>
                        <div className={cn(
                          "rounded-lg p-3 border",
                          isDark ? "bg-[#071018] border-white/5" : "bg-slate-50 border-slate-200/50"
                        )}>
                          <div className="flex justify-between items-center">
                            <span className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-600"}>Includes all sessions</span>
                            <Check className={isDark ? "h-4 w-4 text-blue-400" : "h-4 w-4 text-blue-600"} />
                          </div>
                        </div>
                        <div className={cn(
                          "rounded-lg p-3 border",
                          isDark ? "bg-[#071018] border-white/5" : "bg-slate-50 border-slate-200/50"
                        )}>
                          <div className="flex justify-between items-center">
                            <span className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-600"}>Includes all message content</span>
                            <Check className={isDark ? "h-4 w-4 text-blue-400" : "h-4 w-4 text-blue-600"} />
                          </div>
                        </div>
                      </div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        className="mt-4"
                      >
                        <Button 
                          onClick={exportChatData}
                          className="w-full h-12 bg-gradient-to-r from-blue-700 to-blue-500 text-white hover:from-blue-800 hover:to-blue-600 border-none shadow-lg transition-all duration-300"
                        >
                          <Database className="h-4 w-4 mr-2" />
                          Export Complete Dataset
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </TabsContent>
              </Tabs>

              {/* Footer section (update to support light/dark modes) */}
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className={cn(
                  "relative overflow-hidden rounded-xl border p-4 backdrop-blur-xl shadow-lg mt-auto",
                  isDark
                    ? "bg-[#071018]/70 border-white/5"
                    : "bg-white/70 border-slate-200/50"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-50",
                  isDark ? "from-blue-500/5 to-transparent" : "from-blue-500/5 to-transparent"
                )} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center mb-3 md:mb-0">
                    <Image 
                      src="/GV Fav.png" 
                      alt="GV Logo" 
                      width={24} 
                      height={24}
                      className="mr-2 rounded-sm"
                    />
                    <span className={isDark ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
                      NextGio Admin Dashboard <span className={isDark ? "text-blue-400" : "text-blue-600"}>v1.0</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/" 
                      className={cn(
                        "text-sm transition-colors duration-300",
                        isDark 
                          ? "text-gray-400 hover:text-blue-400" 
                          : "text-gray-600 hover:text-blue-600"
                      )}
                    >
                      <span className="flex items-center">
                        <Home className="h-3.5 w-3.5 mr-1.5" />
                        Back to Home
                      </span>
                    </Link>
                    <motion.a 
                      href="https://github.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "text-sm transition-colors duration-300",
                        isDark 
                          ? "text-gray-400 hover:text-blue-400" 
                          : "text-gray-600 hover:text-blue-600"
                      )}
                    >
                      <span className="flex items-center">
                        <Github className="h-3.5 w-3.5 mr-1.5" />
                        GitHub
                      </span>
                    </motion.a>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors duration-300"
                    >
                      <span className="flex items-center">
                        <LogOut className="h-3.5 w-3.5 mr-1.5" />
                        Logout
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.footer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 