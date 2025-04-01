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
    text: "New visitor messages", 
    prompt: "Show me any new visitor messages or interactions on my portfolio website since my last check.",
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
    text: "Recent visitors", 
    prompt: "Tell me about any new visitors who have interacted with NextGio on my portfolio website recently.",
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
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
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
                    className="bg-blue-600 h-1.5 rounded-full" 
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

// Time and date card for generative UI
const TimeCard = ({ location, isDark }: { location?: string, isDark?: boolean }) => {
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  );
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
      setCurrentDate(now.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-3xl p-6 min-w-[280px] w-full max-w-[320px] relative overflow-hidden group cursor-default",
        isDark 
          ? "bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-800/90 shadow-lg border border-white/5"
          : "bg-gradient-to-br from-white via-zinc-50/50 to-zinc-100/50 shadow-sm border border-black/5"
      )}
    >
      {/* Animated background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
        isDark
          ? "bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"
          : "bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50"
      )} />

      {/* Content container with relative positioning */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 20,
      repeat: Infinity,
              ease: "linear"
            }}
          >
            <ClockIcon className={cn(
              "h-[15px] w-[15px]",
              isDark ? "text-zinc-500" : "text-zinc-400"
            )} />
          </motion.div>
          <span className={cn(
            "text-[13px] font-medium",
            isDark ? "text-zinc-500" : "text-zinc-400"
          )}>
            Current time
          </span>
        </div>
        
        {location && (
          <p className={cn(
            "text-[13px] mb-5",
            isDark ? "text-zinc-500" : "text-zinc-400"
          )}>
            {location}
          </p>
        )}
        
        <motion.div
          initial={false}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3 }}
          key={currentTime} // Trigger animation on time change
        >
          <p className={cn(
            "text-[32px] font-semibold tracking-tight leading-none mb-2 relative",
            isDark ? "text-zinc-100" : "text-zinc-900"
          )}>
            {currentTime}
            <span className={cn(
              "absolute -right-2 top-0 h-2 w-2 rounded-full opacity-75",
              isDark ? "bg-blue-500" : "bg-blue-400"
            )}>
              <span className={cn(
                "absolute inset-0 rounded-full animate-ping",
                isDark ? "bg-blue-500" : "bg-blue-400"
              )} />
            </span>
          </p>
        </motion.div>
        
        <p className={cn(
          "text-[13px]",
          isDark ? "text-zinc-500" : "text-zinc-400"
        )}>
          {currentDate}
        </p>
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
          bg: "bg-blue-900/20",
          border: "border-blue-800/40",
          icon: <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
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
        className="p-1.5 rounded-md transition-all bg-zinc-700/50 hover:bg-zinc-600/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="p-1.5 rounded-md transition-all bg-zinc-700/50 hover:bg-zinc-600/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  // Helper function to detect language based on content if not specified
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

  // Check if the content contains the Weather pattern
  if (content.match(/The weather in .* is currently/)) {
    const location = content.match(/The weather in (.*?) is currently/)?.[1];
    const tempMatch = content.match(/currently ([-\d.]+)°F/);
    const temperature = tempMatch ? parseFloat(tempMatch[1]) : null;
    const conditionsMatch = content.match(/with (.*?)\./);
    const conditions = conditionsMatch ? conditionsMatch[1] : '';
    
    return (
      <div className="mt-4">
        <WeatherCard 
          location={location || ''} 
          temperature={temperature}
          conditions={conditions}
          isDark={isDark}
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
            {content}
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
        {content}
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
            className="flex-1 bg-blue-500"
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
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recording, setRecording] = useState<AudioRecording | null>(null)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeToday: 0
  })
  const [greeting, setGreeting] = useState('')
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
  
  // Add anti-flooding protection
  const isLoadingHistoryRef = useRef(false);
  const [historyRetryCount, setHistoryRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  
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
  
  // Add a session ID state to track the current conversation
  const [sessionId, setSessionId] = useState<string>(() => {
    // Only use localStorage in browser environment
    if (typeof window !== 'undefined') {
      try {
        const storedSessionId = localStorage.getItem('adminChatSessionId');
        // Create a new session ID if none exists or if it's invalid
        if (!storedSessionId || storedSessionId.trim() === '') {
          const newSessionId = `admin-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem('adminChatSessionId', newSessionId);
          return newSessionId;
        }
        return storedSessionId;
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        // Fallback to creating a new session ID
        return `admin-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }
    }
    // Server-side rendering fallback
    return `admin-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  });
  
  // Function to load chat history from the server
  const loadChatHistory = useCallback(async () => {
    // Don't load if we're already loading or if we've exceeded retry limit
    if (isLoadingHistoryRef.current) {
      console.log('Already loading chat history, skipping');
      setLoadingInitial(false);
      return;
    }
    
    if (historyRetryCount > MAX_RETRIES) {
      console.log('Retry limit reached, skipping chat history load');
      setLoadingInitial(false);
      return;
    }
    
    try {
      // Don't load if we don't have a session ID yet
      if (!sessionId) {
        console.log('No session ID available, skipping chat history load');
        setLoadingInitial(false);
        return;
      }
      
      // Set loading flag
      isLoadingHistoryRef.current = true;
      
      console.log(`Loading chat history for session: ${sessionId}`);
      
      try {
        const response = await fetch(`/api/admin/chat?sessionId=${sessionId}`, {
        headers: {
            'x-api-key': 'Aaron3209'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Server responded with ${response.status}: ${errorText}`);
          
          // If session not found (404), create a new session
          if (response.status === 404) {
            console.log('Session not found, creating a new session');
            // Create a new session with random suffix to ensure uniqueness
            const newSessionId = `admin-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
            // Increment retry count
            setHistoryRetryCount(prev => prev + 1);
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('adminChatSessionId', newSessionId);
              // Small delay to prevent immediate retry
              setTimeout(() => {
                setSessionId(newSessionId);
              }, 300);
            } else {
              setSessionId(newSessionId);
            }
            
            setLoadingInitial(false);
            isLoadingHistoryRef.current = false;
            return;
          }
          
          throw new Error(`Failed to load chat history: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data) {
          console.log('No data returned from server');
          setLoadingInitial(false);
          isLoadingHistoryRef.current = false;
          return;
        }
        
        console.log('Chat history response:', data);
        
        if (data.messages && Array.isArray(data.messages)) {
          // Convert to the format expected by the useChat hook
          const formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id?.toString() || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            role: msg.role,
            content: msg.content,
            createdAt: new Date(msg.created_at || Date.now())
          }));
          
          // Only set messages if we have some to set
          if (formattedMessages.length > 0) {
            setMessages(formattedMessages);
            console.log('Loaded chat history:', formattedMessages.length, 'messages');
          } else {
            console.log('No messages in the chat history');
          }
        } else {
          console.log('Data structure not as expected:', data);
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        // Show error toast with a unique ID to prevent duplicates
        toast.error(
          'Chat history could not be loaded. Creating a new session.',
          { id: 'database-error', duration: 5000 }
        );
        
        // Create a new session on error
        const newSessionId = `admin-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Increment retry count
        setHistoryRetryCount(prev => prev + 1);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminChatSessionId', newSessionId);
          // Small delay to prevent immediate retry
          setTimeout(() => {
            setSessionId(newSessionId);
          }, 300);
        } else {
          setSessionId(newSessionId);
        }
      }
    } catch (error) {
      console.error('General error in loadChatHistory:', error);
    } finally {
      setLoadingInitial(false);
      isLoadingHistoryRef.current = false;
    }
  }, [sessionId, setMessages, historyRetryCount, MAX_RETRIES]);

  // Load chat history when the session ID changes
  useEffect(() => {
    // Only load if we have a session ID and haven't exceeded retry limit
    if (sessionId && !isLoadingHistoryRef.current && historyRetryCount <= MAX_RETRIES) {
      // Debounce the loadChatHistory call to prevent rapid consecutive calls
      const timeoutId = setTimeout(() => {
        loadChatHistory();
      }, 200);
      
      // Clean up the timeout if component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [sessionId, loadChatHistory, historyRetryCount, MAX_RETRIES]);
  
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
      'x-api-key': 'Aaron3209'
    },
    body: {
      sessionId: sessionId
    },
    onResponse: async (response) => {
      // Check for a session ID header and store it
      const responseSessionId = response.headers.get('X-Session-ID');
      if (responseSessionId) {
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
          className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700"
          style={{ 
            bottom: `${inputHeight}px`,
            overscrollBehavior: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="h-full flex flex-col">
            <div className="w-full max-w-2xl mx-auto px-4 flex flex-col h-full">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="text-center space-y-6 max-w-md px-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                      className={cn(
                        "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                        isDark 
                          ? "bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 shadow-xl ring-1 ring-zinc-700/50"
                          : "bg-gradient-to-br from-white to-zinc-100 shadow-lg ring-1 ring-zinc-200/50"
                      )}
                    >
                      <motion.svg 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        width="32" 
                        height="32" 
                        viewBox="0 0 26 26" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13 2.5C7.20101 2.5 2.5 7.20101 2.5 13C2.5 18.799 7.20101 23.5 13 23.5C18.799 23.5 23.5 18.799 23.5 13C23.5 7.20101 18.799 2.5 13 2.5ZM6.5 13C6.5 14.6 7.09 16.1 8.1 17.2L8.8 16.5C9.5 15.8 10.3 15.3 11.2 15L11.5 14.9C11.8 14.8 12 14.5 12 14.2V13.7C10.8 13.1 10 11.9 10 10.5C10 8.6 11.3 7 13 7C14.7 7.1 16 8.6 16 10.6C16 12 15.2 13.2 14 13.7V14.2C14 14.5 14.2 14.9 14.5 14.9L14.8 15C15.7 15.2 16.5 15.8 17.3 16.4L18 17.1C19 16 19.5 14.5 19.5 13C19.5 9.4 16.6 6.5 13 6.5C9.4 6.5 6.5 9.4 6.5 13Z"
                          className={isDark ? "fill-blue-400" : "fill-blue-500"}
                        />
                      </motion.svg>
                    </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <h3 className={cn(
                        "text-2xl font-semibold mb-2",
                        isDark ? "text-zinc-100" : "text-zinc-800"
                      )}>
                        {greeting}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      )}>
                        Ask me anything or start a conversation.
                      </p>
              </motion.div>

                  <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="pt-6"
                    >
                      <h4 className={cn(
                        "text-sm mb-4",
                        isDark ? "text-zinc-500" : "text-zinc-600"
                      )}>
                        Quick actions:
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {recommendedPrompts.map((item, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: 0.4 + index * 0.1,
                              ease: [0.23, 1, 0.32, 1]
                            }}
                            onClick={() => {
                              handlePromptClick(item.prompt)
                              // Clear notification when clicked
                              if (index === 0) setHasNewMessages(false)
                              if (index === 1) setHasNewContacts(false)
                            }}
                            className={cn(
                              "group flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                              isDark ? [
                                "bg-gradient-to-br from-zinc-800/50 to-zinc-900/50",
                                "hover:from-zinc-800 hover:to-zinc-900",
                                "border border-zinc-800/50 hover:border-zinc-700/50"
                              ] : [
                                "bg-white hover:bg-zinc-50",
                                "border border-zinc-200 hover:border-zinc-300",
                                "shadow-sm hover:shadow"
                              ],
                              "transform hover:-translate-y-0.5 active:translate-y-0",
                              "relative" // Always keep relative positioning
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Only show notification badge if item has new activity */}
                            {item.hasNotification && (
                              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                            )}
                            <span className={cn(
                              "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200",
                              isDark ? [
                                "bg-gradient-to-br from-zinc-700 to-zinc-800",
                                "group-hover:from-zinc-600 group-hover:to-zinc-700"
                              ] : [
                                "bg-zinc-100 group-hover:bg-zinc-200"
                              ]
                            )}>
                              <item.icon className={cn(
                                "h-4 w-4",
                                isDark ? "text-zinc-300 group-hover:text-zinc-100" : "text-zinc-600 group-hover:text-zinc-800"
                              )} />
                            </span>
                            <span className={cn(
                              "text-sm font-medium",
                              isDark ? "text-zinc-300 group-hover:text-zinc-100" : "text-zinc-700 group-hover:text-zinc-900"
                            )}>
                              {item.text}
                            </span>
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
                                "flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 rounded-full",
                                isDark ? "bg-zinc-800" : "bg-zinc-100",
                              )}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 26 26"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M13 2.5C7.20101 2.5 2.5 7.20101 2.5 13C2.5 18.799 7.20101 23.5 13 23.5C18.799 23.5 23.5 18.799 23.5 13C23.5 7.20101 18.799 2.5 13 2.5ZM6.5 13C6.5 14.6 7.09 16.1 8.1 17.2L8.8 16.5C9.5 15.8 10.3 15.3 11.2 15L11.5 14.9C11.8 14.8 12 14.5 12 14.2V13.7C10.8 13.1 10 11.9 10 10.5C10 8.6 11.3 7 13 7C14.7 7.1 16 8.6 16 10.6C16 12 15.2 13.2 14 13.7V14.2C14 14.5 14.2 14.9 14.5 14.9L14.8 15C15.7 15.2 16.5 15.8 17.3 16.4L18 17.1C19 16 19.5 14.5 19.5 13C19.5 9.4 16.6 6.5 13 6.5C9.4 6.5 6.5 9.4 6.5 13Z"
                                  fill={isDark ? "#8e8e8e" : "#1c2536"}
                                />
                          </svg>
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
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 26 26"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13 2.5C7.20101 2.5 2.5 7.20101 2.5 13C2.5 18.799 7.20101 23.5 13 23.5C18.799 23.5 23.5 18.799 23.5 13C23.5 7.20101 18.799 2.5 13 2.5ZM6.5 13C6.5 14.6 7.09 16.1 8.1 17.2L8.8 16.5C9.5 15.8 10.3 15.3 11.2 15L11.5 14.9C11.8 14.8 12 14.5 12 14.2V13.7C10.8 13.1 10 11.9 10 10.5C10 8.6 11.3 7 13 7C14.7 7.1 16 8.6 16 10.6C16 12 15.2 13.2 14 13.7V14.2C14 14.5 14.2 14.9 14.5 14.9L14.8 15C15.7 15.2 16.5 15.8 17.3 16.4L18 17.1C19 16 19.5 14.5 19.5 13C19.5 9.4 16.6 6.5 13 6.5C9.4 6.5 6.5 9.4 6.5 13Z"
                                fill={isDark ? "#8e8e8e" : "#1c2536"}
                              />
                            </svg>
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
              disabled={isLoading || isProcessingAudio}
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
                    disabled={!input.trim() || isLoading || isProcessingAudio}
                    className={cn(
                      "p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200",
                      isDark
                        ? "bg-white/10 text-white hover:bg-white/20 disabled:bg-zinc-800 disabled:text-zinc-500"
                        : "bg-black/5 text-black hover:bg-black/10 disabled:bg-zinc-100 disabled:text-zinc-400",
                      "transform hover:scale-105 active:scale-95"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
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
