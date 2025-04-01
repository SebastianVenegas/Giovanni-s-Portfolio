"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Search, 
  UserRound, 
  MessageSquare, 
  Filter, 
  Clock, 
  RefreshCw, 
  ChevronDown,
  ChevronRight,
  Phone,
  CalendarDays,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

// Types for chat data
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

export default function ConversationsPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isLoading, setIsLoading] = useState(true)
  const [chatData, setChatData] = useState<ChatData[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSessions: 0,
    totalMessages: 0,
    activeToday: 0,
    lastActivity: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedContacts, setExpandedContacts] = useState<string[]>([])
  const [expandedSessions, setExpandedSessions] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'active'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [error, setError] = useState('')

  // Function to format date display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch (e) {
      return dateString
    }
  }

  // Function to format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) {
        return 'just now'
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} day${days > 1 ? 's' : ''} ago`
      } else {
        return format(date, 'MMM d, yyyy')
      }
    } catch (e) {
      return 'unknown time'
    }
  }

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  // Toggle expansion for a contact
  const toggleContactExpansion = (contactId: string) => {
    setExpandedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  // Toggle expansion for a session
  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    )
  }

  // Function to fetch conversation data
  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/admin/chats', {
        headers: {
          'x-api-key': 'Aaron3209'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversation data')
      }
      
      const data = await response.json()
      setChatData(data.chats || [])
      
      if (data.stats) {
        setStats(data.stats)
      }
      
      setError('')
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error.message || 'Failed to load conversations')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  // Filter and sort conversations based on user criteria
  const filteredChats = chatData
    .filter(chat => {
      // First apply text search filter
      const matchesSearch = 
        searchTerm === '' ||
        chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.contact.phone_number.includes(searchTerm) ||
        chat.sessions.some(session => 
          session.messages.some(msg => 
            msg.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      
      // Then apply type filter
      if (!matchesSearch) return false
      
      if (filterType === 'all') return true
      
      const latestMessageTime = Math.max(
        ...chat.sessions.flatMap(session => 
          session.messages.map(msg => new Date(msg.created_at).getTime())
        )
      )
      
      if (filterType === 'recent') {
        // Show conversations from the last 24 hours
        return (Date.now() - latestMessageTime) < 24 * 60 * 60 * 1000
      }
      
      if (filterType === 'active') {
        // Show conversations with at least 5 messages
        return chat.sessions.reduce(
          (total, session) => total + session.messages.length, 0
        ) >= 5
      }
      
      return true
    })
    .sort((a, b) => {
      // Get the latest message time for each chat
      const aLatestTime = Math.max(
        ...a.sessions.flatMap(session => 
          session.messages.map(msg => new Date(msg.created_at).getTime())
        )
      )
      
      const bLatestTime = Math.max(
        ...b.sessions.flatMap(session => 
          session.messages.map(msg => new Date(msg.created_at).getTime())
        )
      )
      
      // Sort by newest or oldest based on user selection
      return sortOrder === 'newest' 
        ? bLatestTime - aLatestTime
        : aLatestTime - bLatestTime
    })

  return (
    <div className={cn(
      "min-h-full w-full pt-24 pb-16 px-4",
      isDark ? "bg-zinc-900 text-zinc-100" : "bg-zinc-50 text-zinc-800"
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Stats cards and filter header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">Conversations</h1>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchData}
                disabled={isRefreshing}
                className={cn(
                  "text-xs",
                  isDark 
                    ? "bg-zinc-800 border-zinc-700" 
                    : "bg-white border-zinc-200"
                )}
              >
                {isRefreshing ? (
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                )}
                Refresh
              </Button>
              
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "h-9 w-[200px] text-xs",
                    isDark 
                      ? "bg-zinc-800 border-zinc-700 text-zinc-100" 
                      : "bg-white border-zinc-200 text-zinc-800"
                  )}
                />
                <Search className="h-3.5 w-3.5 absolute right-3 top-2.5 opacity-40" />
              </div>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Total Users" 
              value={stats.totalUsers.toString()}
              icon={<UserRound className="h-4 w-4" />}
              isDark={isDark}
            />
            <StatsCard 
              title="Total Conversations" 
              value={stats.totalSessions.toString()}
              icon={<MessageSquare className="h-4 w-4" />}
              isDark={isDark}
            />
            <StatsCard 
              title="Total Messages" 
              value={stats.totalMessages.toString()}
              icon={<MessageSquare className="h-4 w-4" />}
              isDark={isDark}
            />
            <StatsCard 
              title="Last Activity" 
              value={stats.lastActivity || "None"}
              icon={<Clock className="h-4 w-4" />}
              isDark={isDark}
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs opacity-70">Filter:</span>
            
            <Badge 
              variant={filterType === 'all' ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                filterType === 'all' 
                  ? "" 
                  : isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
              )}
              onClick={() => setFilterType('all')}
            >
              All
            </Badge>
            
            <Badge 
              variant={filterType === 'recent' ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                filterType === 'recent' 
                  ? "" 
                  : isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
              )}
              onClick={() => setFilterType('recent')}
            >
              Recent (24h)
            </Badge>
            
            <Badge 
              variant={filterType === 'active' ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                filterType === 'active' 
                  ? "" 
                  : isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
              )}
              onClick={() => setFilterType('active')}
            >
              Active (5+ msgs)
            </Badge>
            
            <div className="flex-1"></div>
            
            <span className="text-xs opacity-70">Sort:</span>
            
            <Badge 
              variant={sortOrder === 'newest' ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                sortOrder === 'newest' 
                  ? "" 
                  : isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
              )}
              onClick={() => setSortOrder('newest')}
            >
              Newest first
            </Badge>
            
            <Badge 
              variant={sortOrder === 'oldest' ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                sortOrder === 'oldest' 
                  ? "" 
                  : isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
              )}
              onClick={() => setSortOrder('oldest')}
            >
              Oldest first
            </Badge>
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border text-center",
            isDark 
              ? "bg-red-900/20 border-red-900/30 text-red-300" 
              : "bg-red-50 border-red-100 text-red-600"
          )}>
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin opacity-50 mb-4" />
            <p className="text-sm opacity-70">Loading conversations...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          // Empty state
          <div className={cn(
            "text-center py-16 rounded-lg border",
            isDark 
              ? "bg-zinc-800/50 border-zinc-700/50" 
              : "bg-white border-zinc-200/80"
          )}>
            <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <h3 className="font-semibold mb-2">No conversations found</h3>
            <p className="text-sm opacity-70 max-w-md mx-auto">
              {searchTerm 
                ? "Try adjusting your search terms or filters"
                : chatData.length === 0 
                  ? "No conversations have been recorded yet. When visitors chat with your site, they'll appear here."
                  : "No conversations match your current filters."}
            </p>
          </div>
        ) : (
          // Conversation list
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {filteredChats.map((chat) => (
                <ConversationCard 
                  key={chat.contact.id}
                  chat={chat}
                  isExpanded={expandedContacts.includes(chat.contact.id.toString())}
                  expandedSessions={expandedSessions}
                  toggleExpand={() => toggleContactExpansion(chat.contact.id.toString())}
                  toggleSession={toggleSessionExpansion}
                  formatDate={formatDate}
                  formatRelativeTime={formatRelativeTime}
                  formatPhoneNumber={formatPhoneNumber}
                  isDark={isDark}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

// Stats card component
function StatsCard({ 
  title, 
  value, 
  icon,
  isDark
}: { 
  title: string
  value: string
  icon: React.ReactNode
  isDark: boolean
}) {
  return (
    <div className={cn(
      "rounded-lg border p-4",
      isDark 
        ? "bg-zinc-800/80 border-zinc-700/50" 
        : "bg-white border-zinc-200/70 shadow-sm"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full",
          isDark ? "bg-zinc-700/50" : "bg-zinc-100"
        )}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium opacity-70">{title}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Conversation card component
function ConversationCard({
  chat,
  isExpanded,
  expandedSessions,
  toggleExpand,
  toggleSession,
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  isDark
}: {
  chat: ChatData
  isExpanded: boolean
  expandedSessions: string[]
  toggleExpand: () => void
  toggleSession: (id: string) => void
  formatDate: (date: string) => string
  formatRelativeTime: (date: string) => string
  formatPhoneNumber: (phone: string) => string
  isDark: boolean
}) {
  // Calculate metrics for this contact
  const totalMessages = chat.sessions.reduce(
    (count, session) => count + session.messages.length, 0
  )
  
  // Get latest message and its time
  const allMessages = chat.sessions.flatMap(session => 
    session.messages.map(msg => ({ ...msg, sessionId: session.sessionId }))
  )
  
  const sortedMessages = [...allMessages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  const latestMessage = sortedMessages[0]
  const latestMessagePreview = latestMessage 
    ? latestMessage.content.length > 60 
      ? latestMessage.content.substring(0, 60) + '...'
      : latestMessage.content
    : 'No messages'
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-lg border overflow-hidden",
        isDark 
          ? "bg-zinc-800/80 border-zinc-700/50" 
          : "bg-white border-zinc-200 shadow-sm"
      )}
    >
      {/* Contact header - always visible */}
      <div 
        className={cn(
          "p-4 cursor-pointer transition-colors",
          isDark 
            ? "hover:bg-zinc-700/30" 
            : "hover:bg-zinc-50",
        )}
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isDark ? "bg-zinc-700" : "bg-zinc-100"
            )}>
              <UserRound className="h-5 w-5 opacity-70" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{chat.contact.name}</h3>
                <Badge variant="outline" className="text-xs font-normal">
                  {totalMessages} msg{totalMessages !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-xs opacity-70">
                  <Phone className="h-3 w-3 mr-1" />
                  {formatPhoneNumber(chat.contact.phone_number)}
                </div>
                
                <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                
                <div className="flex items-center text-xs opacity-70">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {formatRelativeTime(chat.contact.created_at)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right text-xs">
              <div className="opacity-70">Last message</div>
              <div className="font-medium">{formatRelativeTime(latestMessage?.created_at || '')}</div>
            </div>
            
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
              isDark ? "bg-zinc-700/70" : "bg-zinc-100"
            )}>
              {isExpanded 
                ? <ChevronDown className="h-4 w-4" /> 
                : <ChevronRight className="h-4 w-4" />}
            </div>
          </div>
        </div>
        
        {/* Latest message preview */}
        <div className="mt-3 pl-13">
          <div className={cn(
            "text-sm p-2 rounded",
            isDark ? "bg-zinc-700/50" : "bg-zinc-100/80"
          )}>
            <span className="opacity-70">"{latestMessagePreview}"</span>
          </div>
        </div>
      </div>
      
      {/* Expandable sessions section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "p-4 pt-0 overflow-hidden",
              isDark ? "border-t border-zinc-700/50" : "border-t border-zinc-200/70"
            )}
          >
            <div className="pt-4">
              <div className="pl-13">
                <h4 className="text-sm font-medium mb-3">Conversation Sessions ({chat.sessions.length})</h4>
                
                <div className="space-y-3">
                  {chat.sessions.map(session => (
                    <SessionCard
                      key={session.sessionId}
                      session={session}
                      isExpanded={expandedSessions.includes(session.sessionId)}
                      toggleExpand={() => toggleSession(session.sessionId)}
                      formatDate={formatDate}
                      formatRelativeTime={formatRelativeTime}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Session card component
function SessionCard({
  session,
  isExpanded,
  toggleExpand,
  formatDate,
  formatRelativeTime,
  isDark
}: {
  session: Session
  isExpanded: boolean
  toggleExpand: () => void
  formatDate: (date: string) => string
  formatRelativeTime: (date: string) => string
  isDark: boolean
}) {
  // Sort messages by date
  const sortedMessages = [...session.messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  
  // Get first and last message times
  const firstMessage = sortedMessages[0]
  const lastMessage = sortedMessages[sortedMessages.length - 1]
  
  // Format session details
  const sessionStart = firstMessage ? formatRelativeTime(firstMessage.created_at) : 'Unknown'
  const sessionId = session.sessionId.substring(0, 8) + '...'
  
  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      isDark 
        ? "bg-zinc-700/30 border-zinc-700/50" 
        : "bg-zinc-50/80 border-zinc-200/60"
    )}>
      {/* Session header - always visible */}
      <div 
        className={cn(
          "p-3 cursor-pointer transition-colors",
          isDark 
            ? "hover:bg-zinc-700/50" 
            : "hover:bg-zinc-100/50",
        )}
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isDark ? "bg-zinc-600/70" : "bg-white"
            )}>
              <MessageSquare className="h-4 w-4 opacity-70" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Session {sessionId}</h4>
                <Badge variant="outline" className="text-xs font-normal">
                  {session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center text-xs opacity-70">
                  <Clock className="h-3 w-3 mr-1" />
                  {sessionStart}
                </div>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
            isDark ? "bg-zinc-600/70" : "bg-white"
          )}>
            {isExpanded 
              ? <ChevronDown className="h-4 w-4" /> 
              : <ChevronRight className="h-4 w-4" />}
          </div>
        </div>
      </div>
      
      {/* Expandable messages section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "p-3 pt-0",
              isDark ? "border-t border-zinc-600/30" : "border-t border-zinc-200/60"
            )}>
              <div className="pt-3 space-y-3">
                {sortedMessages.map((message, index) => (
                  <MessageBubble
                    key={message.id || index}
                    message={message}
                    formatDate={formatDate}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Message bubble component
function MessageBubble({
  message,
  formatDate,
  isDark
}: {
  message: Message
  formatDate: (date: string) => string
  isDark: boolean
}) {
  const isUser = message.role === 'user'
  
  return (
    <div className={cn(
      "flex",
      isUser ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg p-3",
        isUser
          ? isDark 
            ? "bg-zinc-600/70" 
            : "bg-white"
          : isDark
            ? "bg-blue-600/20 border border-blue-600/30" 
            : "bg-blue-50 border border-blue-100"
      )}>
        <div className="flex justify-between items-start gap-3 mb-1">
          <span className={cn(
            "text-xs font-medium",
            isUser
              ? isDark ? "text-zinc-300" : "text-zinc-600"
              : isDark ? "text-blue-300" : "text-blue-600"
          )}>
            {isUser ? 'Visitor' : 'NextGio'}
          </span>
          
          <span className="text-xs opacity-50">
            {formatDate(message.created_at)}
          </span>
        </div>
        
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  )
} 