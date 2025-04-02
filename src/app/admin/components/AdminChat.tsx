"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Toaster, toast } from "react-hot-toast"
import TextareaAutosize from "react-textarea-autosize"
import { AnimatePresence, motion } from "framer-motion"
import { PaperAirplaneIcon, TrashIcon, MicrophoneIcon, StopIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, ChartBarIcon, CloudIcon, CalendarIcon } from "@heroicons/react/24/outline"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useChat } from "ai/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UsersIcon, ClipboardIcon, PhoneIcon, UserIcon, ArrowUpIcon, UserMinusIcon, SunIcon, MoonIcon, CloudArrowDownIcon, ClockIcon, BoltIcon } from "@heroicons/react/24/outline"
import { Message } from "ai"
import { WeatherCard } from "@/app/components/WeatherCard"
import { parse, serialize } from 'cookie'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import Image from "next/image"

// Animation variants for the thinking dots
const thinkingVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
    }

const dotVariants = {
  initial: { scale: 0.8, opacity: 0.4 },
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.4, 1, 0.4],
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 1,
      ease: "easeInOut",
    },
  },
}

// Recommended prompts
const recommendedPrompts = [
  { 
    text: "Latest visitor messages", 
    prompt: "Show me any latest visitor messages or interactions on my portfolio website since my last check.",
    icon: ChatBubbleLeftRightIcon,
    hasNotification: false
  },
  { 
    text: "Visitor analytics", 
    prompt: "Give me an overview of visitor engagement on my portfolio website. How many unique visitors have interacted with NextGio?",
    icon: ChartBarIcon,
    hasNotification: false
  },
  { 
    text: "Latest visitors", 
    prompt: "Tell me about any latest visitors who have interacted with NextGio on my portfolio website recently.",
    icon: UsersIcon,
    hasNotification: false
  },
  { 
    text: "Visitor inquiries", 
    prompt: "What are the most common questions visitors ask about me or my work?",
    icon: ClipboardIcon,
    hasNotification: false
  }
]

interface AdminChatProps {
  isDark?: boolean
}

// Simple contact card for basic info
const SimpleContactCard = ({ name, phone }: { name: string; phone: string }) => {
  const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-zinc-900 rounded-lg p-3 shadow-sm border border-zinc-800/50"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-zinc-100 truncate">{name}</h3>
          <p className="text-xs text-zinc-500">{formattedPhone}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Full contact card with message details
const ContactCard = ({ name, phone, lastMessage, time }: { name: string; phone: string; lastMessage: string; time: string }) => {
  const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-zinc-900 rounded-lg p-4 shadow-sm border border-zinc-800/50"
    >
      <div className="flex items-center space-x-4">
        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
          <UserIcon className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-zinc-100">{name}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{formattedPhone}</p>
            </div>
            <span className="text-[11px] text-zinc-600">{time}</span>
          </div>
          {lastMessage && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
              {lastMessage}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Chat message component for individual messages
const ChatMessage = ({
  role,
  content,
  time,
  isDetail = false
}: {
  role: string;
  content?: string;
  time: string;
  isDetail?: boolean;
}) => {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-6 h-6 rounded-full bg-zinc-800/80 flex items-center justify-center flex-shrink-0">
        <UserIcon className="h-3 w-3 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">{role}:</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{time}</span>
          </div>
        </div>
        {content && (
          <p className={cn(
            "text-sm mt-1",
            isDetail ? "text-zinc-400" : "text-zinc-300"
          )}>
            {content}
          </p>
        )}
      </div>
    </div>
  );
};

// Chat log section for displaying a group of related messages
const ChatLogSection = ({
  messages
}: {
  messages: Array<{
    role: string;
    content?: string;
    time: string;
    isDetail?: boolean;
  }>;
}) => {
  return (
    <div className="bg-zinc-900/90 rounded-lg border border-zinc-800/50 divide-y divide-zinc-800/50">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} {...msg} />
      ))}
    </div>
  );
};

// Chat log list component for displaying the full conversation history
const ChatLogList = ({ 
  title,
  sections 
}: { 
  title: string;
  sections: Array<{
    messages: Array<{
      role: string;
      content?: string;
      time: string;
      isDetail?: boolean;
    }>;
  }>;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-sm font-medium text-zinc-300">
        {title}
      </h3>
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <ChatLogSection key={idx} messages={section.messages} />
        ))}
      </div>
      {title && (
        <p className="text-sm text-zinc-300 mb-4">
          {title}
        </p>
      )}
      <div className="bg-zinc-900 rounded-lg">
        {sections.map((section, index) => (
          <ChatMessage
            key={index}
            role={section.messages[0].role}
            content={section.messages[0].content}
            time={section.messages[0].time}
          />
        ))}
      </div>
    </motion.div>
  );
};

const AnalyticsCard = ({ title, value, change, timeframe }: { title: string; value: string; change?: string; timeframe?: string }) => {
  const isPositive = change && !change.startsWith('-')
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-lg p-3 shadow-md border border-zinc-800"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">{title}</h3>
          {timeframe && <p className="text-xs text-zinc-600 mt-0.5">{timeframe}</p>}
        </div>
        <div className="flex items-baseline">
          <p className="text-xl font-medium text-zinc-100">{value}</p>
          {change && (
            <p className={`ml-2 text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive && '+'}{change}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const ConversationList = ({ conversations }: { conversations: Array<{title: string, messages: number, date: string}> }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-lg p-4 shadow-md border border-zinc-800"
    >
      <h3 className="font-medium text-zinc-100 mb-3">Recent Conversations</h3>
      <div className="space-y-2">
        {conversations.map((convo, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
            <h4 className="font-medium text-zinc-300">{convo.title}</h4>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{convo.messages} msgs</span>
              <span className="text-xs text-zinc-500">{convo.date}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Analytics Dashboard Component
const AnalyticsDashboard = ({ data }: { data: any }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <AnalyticsCard title="Total Messages" value={data.totalMessages} change={data.messageChange} timeframe="vs last week" />
        <AnalyticsCard title="Active Conversations" value={data.activeConversations} change={data.conversationChange} timeframe="vs last week" />
        <AnalyticsCard title="Response Time" value={data.responseTime} timeframe="average" />
        <AnalyticsCard title="User Satisfaction" value={data.satisfaction} />
      </div>
      
      <div className="mt-4 bg-zinc-900 rounded-lg p-4 shadow-md border border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-100 mb-3">Popular Topics</h3>
        <div className="space-y-2">
          {data.popularTopics.map((topic: {name: string, percentage: number}, index: number) => (
            <div key={index} className="flex items-center gap-3 py-1.5">
              <span className="text-sm text-zinc-300 w-28">{topic.name}</span>
              <div className="flex-1">
                <div className="relative w-full bg-zinc-800 rounded-full h-1.5">
                  <div 
                    className="bg-zinc-600 h-1.5 rounded-full" 
                    style={{ width: `${topic.percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-zinc-300 font-medium w-9 text-right">{topic.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Combined Weather and Time Widget
const WeatherTimeWidget = ({ isDark }: { isDark?: boolean }) => {
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  );
  
  // Split time into parts for better styling
  const timeMatch = currentTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  const hours = timeMatch?.[1] || "";
  const minutes = timeMatch?.[2] || "";
  const ampm = timeMatch?.[3] || "";
  
  const [weatherData, setWeatherData] = useState<{
    temperature: number | null;
    conditions: string;
    location: string;
  }>({
    temperature: null,
    conditions: '',
    location: 'Moreno Valley'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/weather?city=Moreno Valley`);
        if (response.ok) {
          const data = await response.json();
          setWeatherData({
            temperature: data.temperature,
            conditions: data.description || data.condition,
            location: 'Moreno Valley'
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Weather icon based on conditions with animations
  const getWeatherIcon = () => {
    const conditionsLower = weatherData.conditions.toLowerCase();
    const isNightTime = new Date().getHours() >= 19 || new Date().getHours() < 6;
    
    if (conditionsLower.includes('sun') || conditionsLower.includes('clear')) {
      // Show moon at night, sun during day
      if (isNightTime) {
        return (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 40, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <MoonIcon className={`h-7 w-7 ${isDark ? "text-zinc-300" : "text-zinc-500"}`} />
          </motion.div>
        );
      } else {
        return (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <SunIcon className={`h-7 w-7 ${isDark ? "text-amber-400" : "text-amber-500"}`} />
          </motion.div>
        );
      }
    } else if (conditionsLower.includes('cloud') && conditionsLower.includes('broken')) {
      return (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -2, 0] }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <CloudIcon className={`h-7 w-7 ${isDark ? "text-zinc-300" : "text-zinc-500"}`} />
        </motion.div>
      );
    } else if (conditionsLower.includes('cloud')) {
      return (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -2, 0] }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <CloudIcon className={`h-7 w-7 ${isDark ? "text-zinc-200" : "text-zinc-300"}`} />
        </motion.div>
      );
    } else if (conditionsLower.includes('rain')) {
      return (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -1, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <CloudArrowDownIcon className={`h-7 w-7 ${isDark ? "text-zinc-300" : "text-zinc-500"}`} />
        </motion.div>
      );
    } else if (conditionsLower.includes('snow')) {
      return (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 15, 0, -15, 0] }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <CloudIcon className={`h-7 w-7 ${isDark ? "text-zinc-200" : "text-zinc-300"}`} />
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <CloudIcon className={`h-7 w-7 ${isDark ? "text-zinc-300" : "text-zinc-500"}`} />
        </motion.div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} mb-8 overflow-hidden w-full max-w-md shadow-sm`}
    >
      <div className={`grid grid-cols-2 ${isDark ? 'divide-zinc-700' : 'divide-zinc-200'} divide-x`}>
        {/* Time section */}
        <div className="flex flex-col items-start justify-center px-6 py-5">
          <motion.div 
            key={currentTime}
            initial={{ opacity: 0.8, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-baseline"
          >
            <span className={`text-[2.8rem] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'} leading-none`}>
              {hours}:{minutes}
            </span>
            <span className={`text-[1.8rem] font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-900'} ml-2 leading-none`}>
              {ampm}
            </span>
          </motion.div>
          <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'} mt-1 text-lg`}>
            {weatherData.location}
          </p>
        </div>
        
        {/* Weather section */}
        <div className="flex flex-col items-end justify-center px-6 py-5">
          <div className="flex items-center gap-2">
            <motion.span 
              key={weatherData.temperature}
              initial={{ opacity: 0.8, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-[2.8rem] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'} leading-none`}
            >
              {weatherData.temperature !== null ? `${Math.round(weatherData.temperature)}°` : "--°"}
            </motion.span>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mt-1"
            >
              {getWeatherIcon()}
            </motion.div>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'} mt-1 text-lg text-right`}
          >
            {isLoading ? "Loading..." : weatherData.conditions.toLowerCase()}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced notification card for alert messages
const NotificationCard = ({ title, message, type = "info" }: { title: string; message: string; type?: "info" | "warning" | "success" }) => {
  const getTypeStyles = () => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-amber-900/20",
          border: "border-amber-800/40",
          icon: <BoltIcon className="h-5 w-5 text-amber-500" />
        };
      case "success":
        return {
          bg: "bg-emerald-900/20",
          border: "border-emerald-800/40", 
          icon: <ArrowUpIcon className="h-5 w-5 text-emerald-500" />
        };
      default:
        return {
          bg: "bg-zinc-900/20",
          border: "border-zinc-800/40",
          icon: <ChatBubbleLeftRightIcon className="h-5 w-5 text-zinc-500" />
        };
    }
  };
  
  const styles = getTypeStyles();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg ${styles.bg} ${styles.border} border p-4 shadow-sm`}
    >
      <div className="flex items-start">
        <div className="mt-0.5 mr-3">
          {styles.icon}
        </div>
        <div>
          <h4 className="font-medium text-zinc-100 mb-1">{title}</h4>
          <p className="text-sm text-zinc-300">{message}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Add a CodeBlockControls component with both copy and toggle line numbers
const CodeBlockControls = ({ code, showLineNumbers, toggleLineNumbers }: { 
  code: string; 
  showLineNumbers: boolean; 
  toggleLineNumbers: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-2 right-2 flex space-x-2">
      <button
        className="p-1.5 rounded-md transition-all bg-zinc-700/50 hover:bg-zinc-600/70 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        onClick={toggleLineNumbers}
        aria-label={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
        title={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
      >
        {showLineNumbers ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <button
        className="p-1.5 rounded-md transition-all bg-zinc-700/50 hover:bg-zinc-600/70 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        onClick={handleCopy}
        aria-label="Copy code to clipboard"
        title="Copy code to clipboard"
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// CodeBlock component to encapsulate code block rendering
const CodeBlock = ({ code, language, isDark }: { code: string; language: string; isDark: boolean }) => {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  
  const toggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers);
  };
  
  return (
    <div className="relative">
      <CodeBlockControls 
        code={code} 
        showLineNumbers={showLineNumbers} 
        toggleLineNumbers={toggleLineNumbers} 
      />
      <LanguageLabel language={language} />
      <SyntaxHighlighter
        style={isDark ? atomDark : oneLight}
        language={language}
        PreTag="div"
        className="rounded-md my-3 text-sm"
        showLineNumbers={showLineNumbers}
        wrapLongLines={true}
        customStyle={{ 
          borderRadius: '0.375rem',
          padding: '1rem',
          paddingRight: '2.5rem', // Space for copy button
          paddingTop: '2rem', // Space for language label
          margin: '1rem 0',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          maxWidth: '100%',
          overflowX: 'auto'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// Add a LanguageLabel component for code blocks
const LanguageLabel = ({ language }: { language: string }) => {
  // Map for common language names display
  const languageMap: Record<string, string> = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'jsx': 'React JSX',
    'tsx': 'React TSX',
    'bash': 'Bash/Shell',
    'sh': 'Bash/Shell',
    'css': 'CSS',
    'html': 'HTML',
    'json': 'JSON',
    'md': 'Markdown',
    'py': 'Python',
    'sql': 'SQL',
    'yml': 'YAML',
    'yaml': 'YAML',
    'text': 'Text',
    'diff': 'Diff',
    'php': 'PHP',
    'csharp': 'C#',
    'java': 'Java',
    'go': 'Go',
    'ruby': 'Ruby',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'dart': 'Dart',
    'graphql': 'GraphQL',
  };

  const displayName = languageMap[language.toLowerCase()] || language;

  return (
    <div className="absolute top-0 right-0 px-2 py-1 text-xs font-mono rounded-bl-md rounded-tr-md bg-zinc-700/80 text-zinc-300">
      {displayName}
    </div>
  );
};

// Update the RenderMessageContent component to use the CodeBlock component
const RenderMessageContent = ({ content, isDark }: { content: string, isDark: boolean }) => {
  // Helper function to clean up message content
  const cleanMessageContent = (text: string) => {
    if (!text) return "";
    
    // Remove repeated "sent the following message at" patterns
    text = text.replace(/(?:sent the following messages? at \d+:\d+ (?:AM|PM) )?View \w+'s profile \w+ \w+ \w+ \w+ \d+:\d+ (?:AM|PM)\s*/g, '');
    
    // Remove any remaining timestamp patterns
    text = text.replace(/\b\d{1,2}:\d{2} (?:AM|PM)\b\s*/g, '');
    
    // Clean up any remaining "View profile" mentions
    text = text.replace(/View \w+'s profile/g, '');
    
    // Remove repeated names
    text = text.replace(/(\w+)\s+\1(\s+\1)*\s*/g, '$1 ');
    
    // Fix spacing issues
    text = text.replace(/\s{2,}/g, ' ').trim();
    
    return text;
  };

  // Process content to detect language based on content if not specified
  const detectLanguage = (code: string, specifiedLang?: string): string => {
    if (specifiedLang) return specifiedLang;
    
    // Some basic detection rules
    if (code.includes('import React') || code.includes('export default') || code.includes('useState(')) return 'jsx';
    if (code.includes('<template>') && code.includes('</template>')) return 'vue';
    if (code.includes('function') && code.includes('{') && (code.includes('const ') || code.includes('let '))) return 'js';
    if (code.includes('interface ') || code.includes('type ') || code.includes(': string') || code.includes(': number')) return 'ts';
    if (code.includes('<div>') || code.includes('</div>')) return 'html';
    if (code.includes('@media') || code.includes('margin:') || code.includes('padding:')) return 'css';
    if (code.startsWith('{') && code.includes('"')) return 'json';
    if (code.includes('pip install') || code.includes('def ') || code.includes('import ') && code.includes('print(')) return 'py';
    if (code.includes('SELECT ') || code.includes('FROM ') || code.includes('WHERE ')) return 'sql';
    
    return 'text';
  };

  // Use the processed content for rendering
  const processedContent = cleanMessageContent(content);
  
  // Check if the content contains the Weather pattern
  if (processedContent.match(/The weather in .* is currently/)) {
    const location = processedContent.match(/The weather in (.*?) is currently/)?.[1];
    const tempMatch = processedContent.match(/currently ([-\d.]+)°F/);
    const temperature = tempMatch ? parseFloat(tempMatch[1]) : null;
    const conditionsMatch = processedContent.match(/with (.*?)\./);
    const conditions = conditionsMatch ? conditionsMatch[1] : '';
    
    return (
      <div className="mt-4">
        <WeatherCard 
          location={location || ''} 
          temperature={temperature}
          conditions={conditions}
        />
        <div className="mt-4">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');
                const language = detectLanguage(code, match?.[1]);
                
                return !className ? (
                  <code {...props} className={cn(
                    "rounded px-1 py-0.5 font-mono text-sm",
                    isDark ? "bg-zinc-700 text-zinc-200" : "bg-zinc-100 text-zinc-800"
                  )}>
                    {children}
                  </code>
                ) : (
                  <CodeBlock code={code} language={language} isDark={isDark} />
                );
              }
            }}
          >
            {processedContent}
          </Markdown>
        </div>
      </div>
    );
  }
  
  // Render standard message with enhanced code formatting
  return (
    <div className="w-full overflow-hidden">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            const language = detectLanguage(code, match?.[1]);
            
            return !className ? (
              <code {...props} className={cn(
                "rounded px-1 py-0.5 font-mono text-sm",
                isDark ? "bg-zinc-700 text-zinc-200" : "bg-zinc-100 text-zinc-800"
              )}>
                {children}
              </code>
            ) : (
              <CodeBlock code={code} language={language} isDark={isDark} />
            );
          }
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
}

// Add these types at the top of the file
interface ChatMessage {
  createdAt: string;
  role: string;
  content: string;
}

interface Session {
  messages: ChatMessage[];
}

interface Contact {
  created_at: string;
}

interface Chat {
  sessions: Session[];
  contact: Contact;
}

// Add these types and interfaces near the top
interface AudioRecording {
  blob: Blob;
  url: string;
}

// AudioAnalyzer component for visualizing audio input
const AudioAnalyzer = () => {
  const [audioData, setAudioData] = useState<number[]>(Array(30).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let stream: MediaStream | null = null;

    const initAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        if (!mounted.current) return;

        audioContextRef.current = new AudioContext();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

        // Adjust analyzer settings for better voice detection
        analyzerRef.current.fftSize = 256; // Increased for better frequency resolution
        analyzerRef.current.minDecibels = -90;
        analyzerRef.current.maxDecibels = -10;
        analyzerRef.current.smoothingTimeConstant = 0.5; // Reduced for faster response

        sourceRef.current.connect(analyzerRef.current);

        const analyzeAudio = () => {
          if (!mounted.current || !analyzerRef.current) return;
          
          const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
          analyzerRef.current.getByteFrequencyData(dataArray);

          // Focus on voice frequency range (approximately 85-255 Hz)
          const voiceRange = dataArray.slice(2, 32);
          
          // Calculate average energy in voice range
          const averageEnergy = voiceRange.reduce((acc, val) => acc + val, 0) / voiceRange.length;
          
          // Create more dynamic range for visualization
          const normalizedData = Array.from(voiceRange.slice(0, 30)).map(value => {
            // Enhanced scaling for better visibility of voice input
            const amplification = 1.5; // Increase visual response
            const minHeight = 20; // Minimum bar height
            const maxHeight = 90; // Maximum bar height
            
            // Non-linear scaling to make quiet sounds more visible
            const normalized = Math.pow(value / 255, 0.7) * amplification;
            const percentage = minHeight + (normalized * (maxHeight - minHeight));
            
            // Add slight randomization for more natural movement
            const jitter = Math.random() * 5;
            return Math.min(maxHeight, percentage + (averageEnergy > 30 ? jitter : 0));
          });

          setAudioData(normalizedData);
          rafIdRef.current = requestAnimationFrame(analyzeAudio);
        };

        analyzeAudio();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    initAudio();

    return () => {
      mounted.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="w-full h-[48px] flex items-center justify-center px-4 py-2">
      <div className="w-full h-full flex items-center justify-between gap-[2px]">
        {audioData.map((height, index) => (
          <motion.div
            key={index}
            className="flex-1 bg-zinc-500"
            initial={{ height: '20%' }}
            animate={{ 
              height: `${height}%`,
              opacity: height > 30 ? 0.9 : 0.5
            }}
            transition={{ 
              duration: 0.05,
              ease: "easeOut"
            }}
            style={{ 
              minWidth: '3px', 
              borderRadius: '2px',
              transformOrigin: 'bottom'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Add this helper function at the top level of the file
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const AdminChat = ({ isDark = false }: AdminChatProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  
  const [isTyping, setIsTyping] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(false) // Set to false by default to ensure immediate rendering
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recording, setRecording] = useState<AudioRecording | null>(null)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeToday: 0
  })

  // Get default greeting
  const getDefaultGreeting = () => {
    const hour = new Date().getHours()
    let greeting = ''
    
    if (hour < 12) {
      greeting = "Good morning, Giovanni. Ready to review your portfolio activity?"
    } else if (hour < 18) {
      greeting = "Good afternoon, Giovanni. Let's check your portfolio stats."
    } else {
      greeting = "Good evening, Giovanni. Here's the latest from your portfolio."
    }
    
    return greeting
  }
  
  // Initialize greeting immediately to avoid rendering delay
  const [greeting, setGreeting] = useState(getDefaultGreeting())
  const [hasNewActivity, setHasNewActivity] = useState(false)
  const [messageCountsRef, setMessageCountsRef] = useState({
    lastCheckedTotal: 0,
    lastCheckedUsers: 0
  })
  const [initialLoad, setInitialLoad] = useState(true)
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [inputHeight, setInputHeight] = useState(64)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [hasNewChats, setHasNewChats] = useState(false)
  const [hasNewContacts, setHasNewContacts] = useState(false)
  
  // Add a session ID state to track the current conversation
  const [sessionId, setSessionId] = useState<string>(() => {
    // Try to get the session ID from localStorage if it exists
    if (typeof window !== 'undefined') {
      const storedSessionId = localStorage.getItem('adminChatSessionId');
      return storedSessionId || `admin-session-${Date.now()}`;
    }
    return `admin-session-${Date.now()}`;
  });
  
  // Modified useChat with custom options
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
    setInput,
    reload,
    stop,
    append
  } = useChat({
    initialMessages: [],
    id: sessionId,
    api: '/api/admin/chat',
    headers: {
      'x-api-key': 'Aaron3209',
      'Accept': 'text/event-stream',
    },
    body: {
      sessionId: sessionId
    },
    streamProtocol: 'text', // Set to 'text' to handle plain text streams
    onFinish: (message) => {
      console.log('Chat response finished:', message);
      setIsWaitingForResponse(false);
    },
    onResponse: (response) => {
      console.log('Chat API response status:', response.status);
      
      // Check for a session ID header and store it
      const responseSessionId = response.headers.get('X-SESSION-ID') || response.headers.get('x-session-id');
      if (responseSessionId) {
        console.log('Received session ID:', responseSessionId);
        setSessionId(responseSessionId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminChatSessionId', responseSessionId);
        }
      } else {
        console.log('No session ID received in response');
      }
      setIsWaitingForResponse(false);
    },
    onError: (err) => {
      console.error('Chat error:', err);
      // Try to extract more detailed error information if available
      let errorMessage = 'Unable to get a response. Please try again.';
      
      try {
        // Check if we have a JSON response with error details
        if (err instanceof Error) {
          errorMessage = err.message;
          
          // Try to parse the error message if it looks like JSON
          if (err.message.includes('{') && err.message.includes('}')) {
            const match = err.message.match(/\{.*\}/);
            if (match) {
              const errorObj = JSON.parse(match[0]);
              if (errorObj.error) {
                errorMessage = errorObj.error;
              }
            }
          }
          
          // If we get session not found, start a new session
          if (errorMessage.includes('Session not found')) {
            console.log('Session not found, creating new session');
            // We'll use refreshSession() here instead of direct startNewChat to avoid circular reference
            const newSessionId = `admin-session-${Date.now()}`;
            setSessionId(newSessionId);
            if (typeof window !== 'undefined') {
              localStorage.setItem('adminChatSessionId', newSessionId);
            }
            setMessages([]);
            setInput('');
            toast.success('Started a new chat session');
            return;
          }
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
      }
      
      toast.error(errorMessage);
      setIsWaitingForResponse(false);
    }
  });
  
  // Start a new chat session
  const startNewChat = useCallback(() => {
    const newSessionId = `admin-session-${Date.now()}`;
    setSessionId(newSessionId);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminChatSessionId', newSessionId);
    }
    
    setMessages([]);
    setInput('');
    
    toast.success('Started a new chat session');
  }, [setMessages, setInput]);
  
  // Helper functions for UI
  const cleanStreamingText = (text: string) => {
    if (!text || text === "..." || text === "…" || text === ". . .") {
      return "";
    }
    
    // Clean up data prefixes that may appear when displayed
    let cleaned = text;
    
    // Remove any 'data:' prefixes that might appear in the rendered content
    if (cleaned.includes('data:')) {
      const cleanedLines = cleaned.split('\n').map(line => {
        // If line starts with data:, remove it
        if (line.trim().startsWith('data:')) {
          return line.replace(/^data:\s*/, '');
        }
        return line;
      });
      cleaned = cleanedLines.join('\n');
    }
    
    // Remove [DONE] marker if present
    cleaned = cleaned.replace('[DONE]', '');
    
    // Remove any ":" alone on a line (often comes from SSE)
    cleaned = cleaned.replace(/^:\s*$/gm, '');
    
    // Remove trailing ellipses
    cleaned = cleaned.replace(/\s*\.{3}\s*$/, "").replace(/\s*…\s*$/, "");
    
    // Fix stream chunking issues where multiple words are joined together without spaces
    
    // Add space between sentence-case words (lowercase followed by uppercase)
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Add space between camelCase and regular words
    cleaned = cleaned.replace(/([a-zA-Z])([A-Z][a-z])/g, '$1 $2');
    
    // Add spaces after punctuation if missing
    cleaned = cleaned.replace(/([.!?])([A-Za-z])/g, '$1 $2');
    
    // Add spaces after commas if missing
    cleaned = cleaned.replace(/([,])([A-Za-z])/g, '$1 $2');
    
    // Replace multiple spaces with a single space
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    
    // Normalize line breaks and spacing
    // Remove excess spaces before and after line breaks
    cleaned = cleaned.replace(/\s*\n\s*/g, '\n');
    
    // Replace multiple spaces with a single space (except for code blocks)
    cleaned = cleaned.replace(/(?!`.*?)[ \t]{2,}(?!.*?`)/g, ' ');
    
    // Remove excessive newlines (more than 2 in a row)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return cleaned.trim();
  };
  
  // Thinking animation component
  const ThinkingAnimation = () => {
    return (
      <motion.div
        className="flex items-center justify-center space-x-2 py-1"
        variants={thinkingVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={dotVariants}
          className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
        />
        <motion.div
          variants={dotVariants}
          className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
        />
        <motion.div
          variants={dotVariants}
          className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
        />
      </motion.div>
    )
  }
  
  // Functions for audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecording({ blob, url });
        setIsProcessingAudio(false);
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access microphone');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessingAudio(true);
    }
  };
  
  // Handle speech recognition results
  useEffect(() => {
    const transcribeAudio = async () => {
      if (recording && recording.blob) {
        try {
          setIsProcessingAudio(true);
          
          // Create form data to send the audio file
          const formData = new FormData();
          formData.append('audio', recording.blob, 'audio.webm');
          
          // Send to the Whisper API route
          const response = await fetch('/api/whisper', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to transcribe audio');
          }
          
          const data = await response.json();
          
          if (data.text) {
            // Set the transcribed text as input
            setInput(data.text);
            
            // Clean up the recording
            URL.revokeObjectURL(recording.url);
            setRecording(null);
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
          toast.error('Failed to transcribe audio. Please try again.');
        } finally {
          setIsProcessingAudio(false);
        }
      }
    };
    
    transcribeAudio();
  }, [recording]);
  
  // Handle prompt recommendations
  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    
    // Create a mock input event
    const mockEvent = {
      target: { value: prompt },
      currentTarget: { value: prompt }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    // Use the SDK's handleInputChange function
    handleInputChange(mockEvent);
    
    // Use SDK's handleSubmit to process the prompt
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
      setIsWaitingForResponse(true);
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 0);
  };
  
  // Function to clear chat
  const clearChat = () => {
    setMessages([]);
    setGreeting(getDefaultGreeting());
  };
  
  // Form submission handler
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setIsWaitingForResponse(true);
    handleSubmit(e);
  };
  
  // Add a function to handle Enter key for message submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        setIsWaitingForResponse(true);
        handleSubmit(e.nativeEvent as any);
      }
    }
  };
  
  // Update input height when it changes
  useEffect(() => {
    if (inputContainerRef.current) {
      const height = inputContainerRef.current.offsetHeight;
      setInputHeight(height);
    }
  }, [input]);
  
  // Function to load chat history from the server
  const loadChatHistory = useCallback(async () => {
    // Skip loading chat history - storage is disabled
    console.log('Chat history loading skipped - storage is disabled');
    
    // Ensure greeting is set to current time-appropriate greeting
    setGreeting(getDefaultGreeting());
    
    // Make sure we're ready to render immediately
    setLoadingInitial(false);
    return;
  }, []);

  // Initialize greeting when component first loads
  useEffect(() => {
    // Immediately set the greeting based on time of day
    setGreeting(getDefaultGreeting());
  }, []);

  // Load chat history when the session ID changes
  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId, loadChatHistory]);
  
  // Scroll management
  const isNearBottom = () => {
    if (!containerRef.current) return true
    
    const container = containerRef.current
    const threshold = 100
    const position = container.scrollTop + container.clientHeight
    const height = container.scrollHeight
    
    return position >= height - threshold
  }
  
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && isAutoScrollEnabled) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
    
    if (messages.length > 0 && !isLoading) {
      scrollToBottom()
    }
  }, [messages, isLoading, isAutoScrollEnabled])
  
  const handleScroll = () => {
    if (!containerRef.current) return
    
    if (isNearBottom()) {
      setUserScrolled(false)
      setIsAutoScrollEnabled(true)
    } else {
      setUserScrolled(true)
      setIsAutoScrollEnabled(false)
    }
  }
  
  const handleScrollStart = () => {
    if (!isNearBottom()) {
      setUserScrolled(true)
    }
  }
  
  const handleScrollEnd = () => {
    if (isNearBottom()) {
      setUserScrolled(false)
    }
  }

  // Rest of your component...
  
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col",
        isDark ? "bg-zinc-900" : "bg-zinc-50"
      )}
      style={{ top: "84px" }}
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent scrollbar-thumb-zinc-400/50 dark:scrollbar-thumb-zinc-600/50 hover:scrollbar-thumb-zinc-500/60 dark:hover:scrollbar-thumb-zinc-500/60"
          style={{ 
            bottom: `${inputHeight}px`,
            overscrollBehavior: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? 'rgba(82, 82, 91, 0.5) transparent' : 'rgba(161, 161, 170, 0.5) transparent'
          }}
          onScroll={handleScroll}
          onTouchStart={handleScrollStart}
          onTouchEnd={handleScrollEnd}
          onMouseDown={handleScrollStart}
          onMouseUp={handleScrollEnd}
        >
          {/* Message content */}
          <div className="h-full flex flex-col">
            <div className="w-full max-w-2xl mx-auto px-4 flex flex-col h-full">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="text-center space-y-8 max-w-md w-full px-4"
                  >
                    {/* Weather and Time Widget */}
                    <WeatherTimeWidget isDark={isDark} />
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-5"
                    >
                      <motion.h3 
                        className={cn(
                          "text-2xl font-semibold mb-2",
                          isDark ? "text-zinc-100" : "text-zinc-800"
                        )}
                      >
                        <motion.span
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.6,
                            ease: "easeOut"
                          }}
                        >
                          {greeting}
                        </motion.span>
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className={cn(
                          "text-sm",
                          isDark ? "text-zinc-400" : "text-zinc-600"
                        )}
                      >
                        Ask me anything or start a conversation.
                      </motion.p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="pt-4"
                    >
                      <motion.h4 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className={cn(
                          "text-sm mb-4 font-medium",
                          isDark ? "text-zinc-500" : "text-zinc-600"
                        )}
                      >
                        Quick actions:
                      </motion.h4>
                      <div className="grid grid-cols-2 gap-3">
                        {recommendedPrompts.map((item, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.6, 
                              delay: 0.5 + index * 0.08,
                              ease: [0.1, 0.5, 0.3, 1]
                            }}
                            onClick={() => {
                              handlePromptClick(item.prompt)
                              // Clear notification when clicked
                              if (index === 0) setHasNewMessages(false)
                              if (index === 1) setHasNewContacts(false)
                            }}
                            className={cn(
                              "group flex items-center gap-2 p-2.5 rounded-xl text-left transition-all duration-200",
                              isDark ? [
                                "bg-gradient-to-br from-zinc-800/30 to-zinc-900/30",
                                "hover:from-zinc-800/40 hover:to-zinc-900/40",
                                "shadow-sm"
                              ] : [
                                "bg-white/90 hover:bg-white",
                                "border-none",
                                "shadow-sm"
                              ],
                              "transform hover:-translate-y-0.5 active:translate-y-0",
                              "relative" // Always keep relative positioning
                            )}
                            whileHover={{ 
                              scale: 1.01,
                              boxShadow: isDark ? "0 5px 10px -10px rgba(0,0,0,0.2)" : "0 5px 10px -10px rgba(0,0,0,0.1)"
                            }}
                            whileTap={{ scale: 0.99 }}
                          >
                            {/* Only show notification badge if item has hasNotification property */}
                            {item.hasNotification && (
                              <div className="absolute -top-1.5 -right-1.5 opacity-0">
                                {/* Removed notification badge but kept the placeholder div */}
                              </div>
                            )}
                            <span className={cn(
                              "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200",
                              isDark ? [
                                "bg-gradient-to-br from-zinc-700/80 to-zinc-800/80",
                                "group-hover:from-zinc-600/80 group-hover:to-zinc-700/80"
                              ] : [
                                "bg-zinc-100/80 group-hover:bg-zinc-200/80"
                              ]
                            )}>
                              <item.icon className={cn(
                                "h-4 w-4",
                                isDark ? "text-zinc-300 group-hover:text-zinc-100" : "text-zinc-600 group-hover:text-zinc-800"
                              )} />
                            </span>
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-sm font-medium",
                                isDark ? "text-zinc-300 group-hover:text-zinc-100" : "text-zinc-700 group-hover:text-zinc-900"
                              )}>
                                {item.text}
                              </span>
                              <span className={cn(
                                "text-xs",
                                isDark ? "text-zinc-400 group-hover:text-zinc-300" : "text-zinc-500 group-hover:text-zinc-700"
                              )}>
                                {item.prompt.length > 40 ? item.prompt.substring(0, 40) + '...' : item.prompt}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              ) : (
                <div ref={messagesEndRef} className="flex-1 w-full pt-6 pb-16 flex flex-col justify-start">
              <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 350, 
                      damping: 30,
                          mass: 0.7,
                        }}
                        className="mb-6 last:mb-2"
                        style={{
                          minHeight: message.role === "assistant" ? "48px" : "auto",
                          containIntrinsicSize: "0 48px",
                          contentVisibility: "auto"
                        }}
                      >
                        {message.role === "user" ? (
                      <div className="flex justify-end">
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm min-h-[48px] w-fit",
                                isDark
                                  ? "bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100"
                                  : "bg-gradient-to-br from-zinc-800 to-black text-white",
                              )}
                            >
                              <div className="prose prose-sm max-w-none text-white prose-invert overflow-hidden break-words">
                                <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                            <div
                              className={cn(
                                "flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 rounded-full overflow-hidden",
                                isDark ? "bg-zinc-800" : "bg-zinc-100",
                              )}
                            >
                              <Image 
                                src="/GV Fav.png"
                                alt="GV"
                                width={20}
                                height={20}
                                className={cn(
                                  "object-contain",
                                  isDark ? "brightness-100" : "brightness-0"
                                )}
                              />
                            </div>
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm min-h-[48px] w-fit",
                                isDark
                                  ? "bg-zinc-800/80 text-zinc-200 ring-1 ring-zinc-700/50"
                                  : "bg-white text-zinc-800 ring-1 ring-zinc-100",
                              )}
                              style={{
                                minHeight: "48px",
                                containIntrinsicSize: "0 48px",
                                contentVisibility: "auto"
                              }}
                            >
                              <div className="prose prose-sm max-w-none dark:prose-invert overflow-hidden break-words">
                                {message.content ? (
                                  <RenderMessageContent content={cleanStreamingText(message.content)} isDark={isDark} />
                                ) : isWaitingForResponse && index === messages.length - 1 ? (
                                  <ThinkingAnimation />
                                ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                    {/* Loading indicator */}
                    {isWaitingForResponse && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                      <motion.div
                        key="loading-indicator"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                          mass: 0.7,
                        }}
                        className="mb-6"
                      >
                        <div className="flex items-start">
                          <div
                            className={cn(
                              "flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 rounded-full",
                              isDark ? "bg-zinc-800" : "bg-zinc-100",
                            )}
                          >
                            <Image
                              src="/GV Fav.png"
                              alt="Assistant"
                              width={24}
                              height={24}
                              className={cn(
                                "rounded-full",
                                isDark ? "brightness-90" : "brightness-100"
                              )}
                            />
                          </div>
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm min-h-[48px]",
                              isDark
                                ? "bg-zinc-800/80 text-zinc-200 ring-1 ring-zinc-700/50"
                                : "bg-white text-zinc-800 ring-1 ring-zinc-100",
                            )}
                          >
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ThinkingAnimation />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
              </AnimatePresence>
                  <div ref={messagesEndRef} className="h-0 w-full" />
            </div>
          )}
            </div>
          </div>
          
          {/* Fade gradient at bottom */}
          <div 
            className="absolute left-0 right-0 bottom-0 h-16 pointer-events-none"
            style={{
              background: isDark 
                ? 'linear-gradient(to bottom, rgba(24, 24, 27, 0), rgba(24, 24, 27, 0.9))' 
                : 'linear-gradient(to bottom, rgba(250, 250, 250, 0), rgba(250, 250, 250, 0.9))'
            }}
          />
        </div>
        
        {/* Fixed input area at the bottom - without full background footer */}
        <div
          ref={inputContainerRef}
          className="absolute bottom-0 left-0 right-0 px-4 py-4"
          style={{ background: "transparent" }}
        >
          <div className="max-w-2xl mx-auto">
        {/* Error message */}
            {error && (
              <div
                className={cn(
                  "mb-4 px-4 py-2 rounded-lg text-center",
                  isDark ? "bg-red-900/10 text-red-300" : "bg-red-50 text-red-600",
                )}
              >
                <p className="text-xs font-medium">{error instanceof Error ? error.message : String(error)}</p>
          </div>
        )}
        
            <form onSubmit={onSubmit} className="relative">
              <div className={cn(
                "relative flex items-end gap-2 p-2 rounded-2xl backdrop-blur-sm",
                isDark 
                  ? "bg-zinc-800/80 border border-white/5 shadow-xl" 
                  : "bg-white/80 border border-black/5 shadow-lg"
              )}>
                <div className="relative flex-1">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {isRecording ? (
                        <motion.div
                          key="waveform"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AudioAnalyzer />
                        </motion.div>
                      ) : isProcessingAudio ? (
                        <motion.div
                          key="processing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center min-h-[48px]"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "linear"
                              }}
                            >
                              <ArrowPathIcon className={`h-4 w-4 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
                            </motion.div>
                            <span className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                              Transcribing audio...
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="input"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
            <TextareaAutosize
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything, Giovanni. I'm your personal AI assistant..."
              className={cn(
                "w-full resize-none focus:outline-none focus:ring-0 border-0 text-base leading-6 min-h-[48px] max-h-[120px] overflow-auto rounded-xl px-4 py-3",
                isDark
                  ? "bg-zinc-800/80 text-zinc-100 placeholder-zinc-500"
                  : "bg-white/80 text-zinc-800 placeholder-zinc-400",
                isProcessingAudio && "opacity-20"
              )}
              style={{ outline: "none", boxShadow: "none" }}
              onKeyDown={handleKeyDown}
              disabled={isProcessingAudio}
              autoFocus
            />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pr-1 mt-2">
                  <motion.button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-200",
                      isDark
                        ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-300"
                        : "hover:bg-black/5 text-zinc-500 hover:text-zinc-700",
                      isRecording && "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    )}
                    title={isRecording ? "Stop recording" : "Start recording"}
                    animate={isRecording ? {
                      scale: [1, 1.1, 1],
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                      }
                    } : {}}
                  >
                    {isRecording ? (
                      <StopIcon className="h-5 w-5" />
                    ) : (
                      <MicrophoneIcon className="h-5 w-5" />
                    )}
                  </motion.button>

                  {messages.length > 0 && (
                    <motion.button
                      type="button"
                      onClick={clearChat}
                      className={cn(
                        "p-2.5 rounded-xl transition-all duration-200",
                        isDark
                          ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-300"
                          : "hover:bg-black/5 text-zinc-500 hover:text-zinc-700"
                      )}
                      title="Clear chat"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                  )}

                  <motion.button
                    type="submit"
                    disabled={(!input.trim() && !isLoading) || isProcessingAudio}
                    onClick={() => {
                      if (isLoading) {
                        stop();
                        setIsWaitingForResponse(false); // Manually set loading state to false
                      }
                    }}
                    className={cn(
                      "p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200",
                      isDark
                        ? "bg-white/10 text-white hover:bg-white/20 disabled:bg-zinc-800 disabled:text-zinc-500"
                        : "bg-black/5 text-black hover:bg-black/10 disabled:bg-zinc-100 disabled:text-zinc-400",
                      "transform hover:scale-105 active:scale-95",
                      isLoading && "bg-red-500/10 hover:bg-red-500/20"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <StopIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                  </motion.button>
          </div>
        </div>
            </form>
      </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
