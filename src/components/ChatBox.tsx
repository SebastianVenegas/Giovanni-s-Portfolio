"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, MessageSquare, ChevronDown, Sparkles, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useMounted } from "./theme-provider"
import { useChat } from "ai/react"

// Define section keywords for scrolling
const sectionKeywords = {
  about: [
    "about", "who is giovanni", "tell me about giovanni", "background", 
    "bio", "biography", "tell me about yourself", "who is he", "who are you", 
    "about me"
  ],
  experience: [
    "experience", "work history", "job", "career", "employment", 
    "professional experience", "work experience", "previous jobs",
    "where has giovanni worked", "companies", "positions"
  ],
  projects: [
    "projects", "project", "portfolio", "work", "showcase", 
    "show me projects", "show projects", "view projects",
    "what projects", "what have you worked on", "what has giovanni worked on"
  ],
  certifications: [
    "certifications", "certificates", "credentials", "qualifications", 
    "certified", "certification", "diploma", "education", "degrees",
    "what certifications", "what qualifications"
  ],
  contact: [
    "contact", "email", "phone", "message", "get in touch", 
    "reach out", "connect", "hire", "contact information",
    "how to contact", "how to reach"
  ]
}

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [textareaHeight, setTextareaHeight] = useState(36) // Default height
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const mounted = useMounted()

  // Use the Vercel AI SDK useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      { id: 'welcome-message', role: "assistant", content: "Hi there! I'm Giovanni's AI assistant. How can I help you today?" }
    ],
    onFinish: (message) => {
      console.log("Message finished:", message);
      if (!isOpen) {
        setHasNewMessages(true);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
    streamProtocol: 'text'
  })

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

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    // Scroll to bottom after expanding
    if (!isExpanded) {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  };

  // Function to scroll to a section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      // Log for debugging
      console.log(`Scrolling to section: ${id}`)
      element.scrollIntoView({ behavior: "smooth" })
    } else {
      console.log(`Section not found: ${id}`)
    }
  }

  // Function to check which section the message is about
  const checkForSectionQuery = (message: string) => {
    const lowercaseMessage = message.toLowerCase()
    
    // Check each section's keywords
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
        console.log(`Detected section: ${section} for message: ${message}`)
        return section
      }
    }
    
    console.log(`No section detected for message: ${message}`)
    return null // No matching section found
  }

  // Handle form submission with the Vercel AI SDK
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Make sure the chat window is open when submitting a message
    if (!isOpen) {
      console.log("Opening chat window before submitting message");
      setIsOpen(true);
      
      // Small delay to ensure the chat window is open before submitting
      setTimeout(() => {
        // Check which section the user is asking about
        const sectionToScrollTo = checkForSectionQuery(input)
        
        // Submit the form using the Vercel AI SDK
        console.log("Submitting message:", input);
        handleSubmit(e)
        
        // If user asked about a specific section, scroll to that section
        if (sectionToScrollTo) {
          // Small delay to ensure the UI updates first
          setTimeout(() => {
            scrollToSection(sectionToScrollTo)
          }, 500)
        }
      }, 300);
    } else {
      // Check which section the user is asking about
      const sectionToScrollTo = checkForSectionQuery(input)
      
      // Submit the form using the Vercel AI SDK
      console.log("Submitting message:", input);
      handleSubmit(e)
      
      // If user asked about a specific section, scroll to that section
      if (sectionToScrollTo) {
        // Small delay to ensure the UI updates first
        setTimeout(() => {
          scrollToSection(sectionToScrollTo)
        }, 500)
      }
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
                isExpanded 
                  ? "top-4 right-4 left-4 bottom-4 sm:top-10 sm:right-10 sm:left-auto sm:bottom-10 sm:w-[600px] sm:h-[80vh]" 
                  : "bottom-6 right-6 w-[90vw] sm:w-[400px] h-[70vh] sm:h-[500px]",
                "rounded-2xl shadow-xl overflow-hidden",
                "glass-effect backdrop-blur-md",
                isDark 
                  ? "bg-black/60 border border-white/10" 
                  : "bg-white/80 border border-black/5",
                "transition-all duration-300 ease-in-out"
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
                    Chat with Giovanni
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Expand/Collapse Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleExpanded}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      isDark 
                        ? "text-white/70 hover:text-white hover:bg-white/10" 
                        : "text-gray-700 hover:text-gray-900 hover:bg-black/5"
                    )}
                    aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                  >
                    {isExpanded ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      isDark 
                        ? "text-white/70 hover:text-white hover:bg-white/10" 
                        : "text-gray-700 hover:text-gray-900 hover:bg-black/5"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
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
                    key={index}
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
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isDark ? "bg-gray-500 dark:bg-gray-400" : "bg-gray-400"
                          )}
                        />
                        <motion.div 
                          animate={{ 
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isDark ? "bg-gray-400 dark:bg-gray-300" : "bg-gray-600"
                          )}
                        />
                        <motion.div 
                          animate={{ 
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.4
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 