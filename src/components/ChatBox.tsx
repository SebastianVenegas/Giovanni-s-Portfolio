"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, MessageSquare, Loader2 } from "lucide-react"
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const mounted = useMounted()

  // Use the Vercel AI SDK useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      { id: 'welcome-message', role: "assistant", content: "Hi there! I'm Giovanni's AI assistant. How can I help you today?" }
    ]
  })

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

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
    
    // Check which section the user is asking about
    const sectionToScrollTo = checkForSectionQuery(input)
    
    // Submit the form using the Vercel AI SDK
    handleSubmit(e)
    
    // If user asked about a specific section, scroll to that section
    if (sectionToScrollTo) {
      // Small delay to ensure the UI updates first
      setTimeout(() => {
        scrollToSection(sectionToScrollTo)
      }, 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>
      handleChatSubmit(formEvent)
    }
  }

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
          isDark 
            ? "bg-white/10 text-white hover:bg-white/20 border border-white/10" 
            : "bg-black/80 text-white hover:bg-black/90 border border-black/10",
          "transition-all duration-300"
        )}
        aria-label="Chat with Giovanni"
      >
        <MessageSquare className="h-6 w-6" />
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed bottom-6 right-6 z-50 flex flex-col",
                "w-[90vw] sm:w-[400px] h-[70vh] sm:h-[500px] rounded-2xl shadow-xl overflow-hidden",
                isDark 
                  ? "bg-black/90 border border-white/10" 
                  : "bg-white/95 border border-black/10",
                "backdrop-blur-md"
              )}
            >
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between px-4 py-3",
                isDark ? "border-b border-white/10" : "border-b border-black/10"
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    "bg-green-500 animate-pulse"
                  )} />
                  <h3 className={cn(
                    "font-medium",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    Chat with Giovanni
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-gray-700 hover:text-black hover:bg-black/10"
                  )}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className={cn(
                "flex-1 overflow-y-auto p-4 space-y-4",
                isDark ? "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" : "scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent"
              )}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      message.role === "user"
                        ? isDark 
                          ? "bg-white/10 text-white" 
                          : "bg-black/80 text-white"
                        : isDark 
                          ? "bg-white/5 text-white/90 border border-white/10" 
                          : "bg-gray-100 text-gray-900 border border-black/5"
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      isDark 
                        ? "bg-white/5 text-white/90 border border-white/10" 
                        : "bg-gray-100 text-gray-900 border border-black/5"
                    )}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleChatSubmit} className={cn(
                "p-3",
                isDark ? "border-t border-white/10" : "border-t border-black/10"
              )}>
                <div className={cn(
                  "flex items-end gap-2",
                  "rounded-xl p-2",
                  isDark ? "bg-white/5" : "bg-black/5"
                )}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className={cn(
                      "flex-1 resize-none max-h-32 overflow-y-auto p-2 text-sm",
                      "bg-transparent border-0 focus:ring-0 focus:outline-none",
                      isDark ? "text-white placeholder:text-white/50" : "text-gray-900 placeholder:text-gray-500"
                    )}
                    rows={1}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      isDark 
                        ? "bg-white/10 text-white hover:bg-white/20" 
                        : "bg-black/80 text-white hover:bg-black/90",
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