"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { X, Send, ChevronDown, MessageSquare, Sparkles, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"

// Define the ChatMessage interface
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// Add new interface for user information
interface UserInfo {
  name: string;
  phoneNumber: string;
  submitted: boolean;
}

// Custom hook for mounted state
function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

// Custom textarea component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

// Section keywords for navigation
const sectionKeywords = {
  "about": ["about", "who is giovanni", "background", "bio", "biography"],
  "experience": ["experience", "work history", "job history", "career", "professional background", "work experience", "expireance", "expirience", "experiance"],
  "skills": ["skills", "technologies", "tech stack", "programming", "languages", "frameworks"],
  "projects": ["projects", "portfolio", "work", "applications", "apps", "websites"],
  "contact": ["contact", "email", "reach out", "message", "get in touch", "hire"]
}

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [textareaHeight, setTextareaHeight] = useState(36) // Default height
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const mounted = useMounted()
  
  // Add user info state
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    phoneNumber: '',
    submitted: false
  })
  
  // Custom chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome-message', role: "assistant", content: "Hi there! I'm Giovanni's AI assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  // Check if scroll button should be shown
  useEffect(() => {
    const checkScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isScrollable = scrollHeight > clientHeight;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
        
        setShowScrollButton(isScrollable && isScrolledUp);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setHasNewMessages(false)
    }
  }, [isOpen])

  // Auto-resize textarea based on content
  const handleTextareaResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, 120); // Max height of 120px
      setTextareaHeight(newHeight);
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  // Update textarea height when input changes
  useEffect(() => {
    handleTextareaResize();
  }, [input]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Function to check which section the message is about
  const checkForSectionQuery = (message: string) => {
    const lowercaseMessage = message.toLowerCase()
    
    console.log("Checking for section in message:", lowercaseMessage)
    
    // Check each section's keywords
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
        console.log(`Detected section: ${section} for message: ${message}`)
        return section
      }
    }
    
    // Additional checks for common variations
    if (lowercaseMessage.includes("about you") || 
        lowercaseMessage.includes("who are you") || 
        lowercaseMessage.includes("tell me about") || 
        lowercaseMessage.includes("your background")) {
      console.log("Detected about section via additional check")
      return "about"
    }
    
    if (lowercaseMessage.includes("your experience") || 
        lowercaseMessage.includes("where have you worked") || 
        lowercaseMessage.includes("work history") || 
        lowercaseMessage.includes("show me experience") ||
        lowercaseMessage.includes("show me expireance") ||
        lowercaseMessage.includes("show experience")) {
      console.log("Detected experience section via additional check")
      return "experience"
    }
    
    if (lowercaseMessage.includes("your projects") || 
        lowercaseMessage.includes("what have you built") || 
        lowercaseMessage.includes("portfolio") || 
        lowercaseMessage.includes("show me your work")) {
      console.log("Detected projects section via additional check")
      return "projects"
    }
    
    if (lowercaseMessage.includes("your skills") || 
        lowercaseMessage.includes("what can you do") || 
        lowercaseMessage.includes("tech stack") || 
        lowercaseMessage.includes("technologies")) {
      console.log("Detected skills section via additional check")
      return "skills"
    }
    
    if (lowercaseMessage.includes("how to contact") || 
        lowercaseMessage.includes("get in touch") || 
        lowercaseMessage.includes("email") || 
        lowercaseMessage.includes("reach out")) {
      console.log("Detected contact section via additional check")
      return "contact"
    }
    
    console.log(`No section detected for message: ${message}`)
    return null // No matching section found
  }

  // Function to scroll to a section
  const scrollToSection = (id: string) => {
    console.log(`Attempting to scroll to section: ${id}`)
    
    // Try to find the element by ID
    const element = document.getElementById(id)
    
    if (element) {
      console.log(`Found element with id: ${id}, scrolling now`)
      
      // Use a more reliable scrolling method
      try {
        // First try scrollIntoView
        element.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        })
        
        // Also add a fallback with window.scrollTo
        setTimeout(() => {
          const rect = element.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const targetPosition = scrollTop + rect.top - 100 // 100px offset for headers
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          })
          
          console.log(`Fallback scroll to position: ${targetPosition}`)
        }, 100)
        
      } catch (error) {
        console.error(`Error scrolling to section ${id}:`, error)
        
        // Last resort fallback
        try {
          window.location.hash = `#${id}`
        } catch (hashError) {
          console.error("Hash navigation failed:", hashError)
        }
      }
    } else {
      // Try alternative section IDs
      const alternativeIds = {
        "about": ["about-section", "about-me", "bio"],
        "skills": ["skills-section", "technologies", "tech-stack"],
        "projects": ["projects-section", "work", "portfolio"],
        "contact": ["contact-section", "contact-me", "get-in-touch"]
      }
      
      const alternatives = alternativeIds[id as keyof typeof alternativeIds] || []
      
      for (const altId of alternatives) {
        const altElement = document.getElementById(altId)
        if (altElement) {
          console.log(`Found alternative element with id: ${altId}, scrolling now`)
          altElement.scrollIntoView({ behavior: "smooth" })
          return
        }
      }
      
      // If still not found, try looking for sections or headings with matching text
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, section')
      for (const heading of headings) {
        const headingText = heading.textContent?.toLowerCase() || ''
        if (headingText.includes(id.toLowerCase())) {
          console.log(`Found heading with matching text: "${headingText}", scrolling now`)
          heading.scrollIntoView({ behavior: "smooth" })
          return
        }
      }
      
      console.error(`Section not found: ${id}`)
    }
  }

  // Custom submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      id: Date.now().toString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Check which section the user is asking about
      const sectionToScrollTo = checkForSectionQuery(userMessage.content);
      
      // If user asked about a specific section, scroll to that section
      if (sectionToScrollTo) {
        // Keep the chat window open as requested
        console.log(`Scrolling to ${sectionToScrollTo} section while keeping chat open`);
        
        // Scroll to the section without closing the chat
        setTimeout(() => {
          scrollToSection(sectionToScrollTo);
        }, 300);
      }
      
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content,
        id: Date.now().toString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Notify if chat is closed
      if (!isOpen) {
        setHasNewMessages(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
          id: Date.now().toString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Make sure the chat window is open when submitting a message
    if (!isOpen) {
      console.log("Opening chat window before submitting message");
      setIsOpen(true);
      
      // Small delay to ensure the chat window is open before submitting
      setTimeout(() => {
        handleSubmit(e);
      }, 300);
    } else {
      handleSubmit(e);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>
      handleChatSubmit(formEvent)
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Add a debug effect to monitor messages
  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);

  // Add a debug effect to monitor loading state
  useEffect(() => {
    console.log("Loading state:", isLoading);
  }, [isLoading]);

  // Function to end chat - clear messages and close window
  const handleEndChat = () => {
    console.log("Ending chat session");
    
    // Reset messages to initial state
    setMessages([
      { id: 'welcome-message', role: "assistant", content: "Hi there! I'm Giovanni's AI assistant. How can I help you today?" }
    ]);
    
    // Close the chat window
    setIsOpen(false);
    
    // Reset any other state as needed
    setHasNewMessages(false);
  }

  // Handle user info submission
  const handleUserInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate inputs
    if (!userInfo.name.trim() || !userInfo.phoneNumber.trim()) {
      return;
    }
    
    // Update user info state to mark as submitted
    setUserInfo(prev => ({
      ...prev,
      submitted: true
    }));
    
    // Add personalized welcome message
    setMessages([
      { 
        id: 'welcome-message', 
        role: "assistant", 
        content: `Hi ${userInfo.name}! I'm Giovanni's AI assistant. How can I help you today?` 
      }
    ]);
  };

  // Handle user info input changes
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg",
          "glass-effect backdrop-blur-md",
          isDark 
            ? "bg-black/40 border border-white/10 hover:bg-black/50" 
            : "bg-white/70 border border-black/5 hover:bg-white/80",
          "transition-all duration-300"
        )}
        aria-label="Chat with Giovanni"
      >
        <div className="relative">
          <MessageSquare className={cn(
            "h-6 w-6",
            isDark ? "text-white/90" : "text-gray-900"
          )} />
          {hasNewMessages && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            />
          )}
        </div>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "fixed z-50 flex flex-col",
                "bottom-6 right-6 w-[90vw] sm:w-[400px] h-[70vh] sm:h-[500px] rounded-2xl",
                "shadow-xl overflow-hidden",
                "glass-effect backdrop-blur-md",
                isDark 
                  ? "bg-black/60 border border-white/10" 
                  : "bg-white/80 border border-black/5",
              )}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gray-500/5 dark:bg-gray-300/5 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-gray-500/5 dark:bg-gray-300/5 rounded-full blur-3xl -z-10" />
              
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between px-5 py-4",
                "border-b",
                isDark 
                  ? "border-white/10 bg-black/20" 
                  : "border-black/5 bg-white/20"
              )}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full",
                      isDark ? "bg-white/10" : "bg-black/5"
                    )}>
                      <Sparkles className={cn(
                        "h-4 w-4",
                        isDark ? "text-white/90" : "text-gray-900"
                      )} />
                    </div>
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                      className={cn(
                        "absolute inset-0 rounded-full -z-10",
                        isDark ? "bg-white/5" : "bg-black/5"
                      )}
                    />
                  </div>
                  <h3 className={cn(
                    "font-medium text-base",
                    isDark ? "text-white/90" : "text-gray-900"
                  )}>
                    Giovanni's Assistant
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* End Chat button - Only show when user has submitted info */}
                  {userInfo.submitted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEndChat}
                      className={cn(
                        "h-8 px-3 rounded-full flex items-center gap-1",
                        isDark 
                          ? "text-white/70 hover:text-white hover:bg-white/10" 
                          : "text-gray-700 hover:text-gray-900 hover:bg-black/5"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="text-xs">End Chat</span>
                    </Button>
                  )}
                  
                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 rounded-full",
                      isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                    )}
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                  >
                    <X className={cn(
                      "h-4 w-4",
                      isDark ? "text-white/80" : "text-gray-700"
                    )} />
                  </Button>
                </div>
              </div>
              
              {/* User Info Form or Chat Content */}
              {!userInfo.submitted ? (
                <div className="flex-1 p-5 overflow-y-auto">
                  <div className="mb-4 text-center">
                    <h3 className={cn(
                      "text-lg font-medium mb-2",
                      isDark ? "text-white/90" : "text-gray-900"
                    )}>
                      Before we chat
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-white/70" : "text-gray-600"
                    )}>
                      Please provide your information to continue
                    </p>
                  </div>
                  
                  <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label 
                        htmlFor="name" 
                        className={cn(
                          "block text-sm font-medium",
                          isDark ? "text-white/80" : "text-gray-700"
                        )}
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userInfo.name}
                        onChange={handleUserInfoChange}
                        required
                        className={cn(
                          "w-full px-3 py-2 rounded-lg",
                          "border focus:outline-none focus:ring-2",
                          isDark 
                            ? "bg-black/20 border-white/10 text-white focus:ring-white/30" 
                            : "bg-white/80 border-black/10 text-gray-900 focus:ring-black/20"
                        )}
                        placeholder="Enter your name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label 
                        htmlFor="phoneNumber" 
                        className={cn(
                          "block text-sm font-medium",
                          isDark ? "text-white/80" : "text-gray-700"
                        )}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={userInfo.phoneNumber}
                        onChange={handleUserInfoChange}
                        required
                        className={cn(
                          "w-full px-3 py-2 rounded-lg",
                          "border focus:outline-none focus:ring-2",
                          isDark 
                            ? "bg-black/20 border-white/10 text-white focus:ring-white/30" 
                            : "bg-white/80 border-black/10 text-gray-900 focus:ring-black/20"
                        )}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className={cn(
                        "w-full py-2 rounded-lg transition-all",
                        isDark 
                          ? "bg-white/10 hover:bg-white/20 text-white" 
                          : "bg-black/80 hover:bg-black text-white"
                      )}
                    >
                      Start Chatting
                    </Button>
                  </form>
                </div>
              ) : (
                <>
                  {/* Messages Container */}
                  <div 
                    ref={messagesContainerRef}
                    className={cn(
                      "flex-1 overflow-y-auto p-5 space-y-5",
                      "scrollbar-thin",
                      isDark 
                        ? "scrollbar-thumb-white/10 scrollbar-track-transparent" 
                        : "scrollbar-thumb-black/10 scrollbar-track-transparent"
                    )}
                  >
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.05 * (index % 3),
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                        className={cn(
                          "flex",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? isDark 
                              ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-md border border-white/10" 
                              : "bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-md"
                            : isDark 
                              ? "bg-white/5 text-white/90 border border-white/10 shadow-sm" 
                              : "bg-white/80 text-gray-900 border border-black/5 shadow-sm backdrop-blur-sm"
                        )}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="flex justify-start"
                      >
                        <div className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3",
                          isDark 
                            ? "bg-white/5 text-white/90 border border-white/10 shadow-sm" 
                            : "bg-white/80 text-gray-900 border border-black/5 shadow-sm backdrop-blur-sm"
                        )}>
                          <div className="flex space-x-2">
                            <motion.div 
                              animate={{ 
                                y: [0, -3, 0],
                                opacity: [0.6, 1, 0.6]
                              }}
                              transition={{ 
                                duration: 1.2, 
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                                times: [0, 0.5, 1],
                                delay: 0
                              }}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                isDark ? "bg-gray-500 dark:bg-gray-400" : "bg-gray-400"
                              )}
                            />
                            <motion.div 
                              animate={{ 
                                y: [0, -3, 0],
                                opacity: [0.6, 1, 0.6]
                              }}
                              transition={{ 
                                duration: 1.2, 
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                                times: [0, 0.5, 1],
                                delay: 0.15
                              }}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                isDark ? "bg-gray-400 dark:bg-gray-300" : "bg-gray-600"
                              )}
                            />
                            <motion.div 
                              animate={{ 
                                y: [0, -3, 0],
                                opacity: [0.6, 1, 0.6]
                              }}
                              transition={{ 
                                duration: 1.2, 
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                                times: [0, 0.5, 1],
                                delay: 0.3
                              }}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                isDark ? "bg-gray-300 dark:bg-gray-200" : "bg-gray-800"
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Scroll to bottom button */}
                  <AnimatePresence>
                    {showScrollButton && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        onClick={scrollToBottom}
                        className={cn(
                          "absolute bottom-20 right-4 z-10 p-2 rounded-full shadow-md",
                          "backdrop-blur-sm",
                          isDark 
                            ? "bg-black/60 text-white/90 hover:bg-black/80 border border-white/10" 
                            : "bg-white/80 text-gray-900 hover:bg-white/90 border border-black/5"
                        )}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Input */}
                  <form onSubmit={handleChatSubmit} className={cn(
                    "p-4",
                    "border-t",
                    isDark ? "border-white/10" : "border-black/5"
                  )}>
                    <div className={cn(
                      "flex items-end gap-2",
                      "rounded-xl p-2",
                      isDark ? "bg-white/5" : "bg-black/5"
                    )}>
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                          handleInputChange(e);
                          handleTextareaResize();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        style={{ height: `${textareaHeight}px` }}
                        className={cn(
                          "flex-1 resize-none overflow-y-auto py-2 px-3 text-sm",
                          "bg-transparent border-0 focus:ring-0 focus:outline-none rounded-lg",
                          isDark ? "text-white/90 placeholder:text-white/50" : "text-gray-900 placeholder:text-gray-500"
                        )}
                        rows={1}
                      />
                      <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center",
                          "transition-all duration-300",
                          isDark 
                            ? "bg-white/10 text-white/90 hover:bg-white/20 border border-white/10" 
                            : "bg-black/10 text-gray-900 hover:bg-black/20 border border-black/5",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 