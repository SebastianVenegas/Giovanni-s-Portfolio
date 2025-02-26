"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useMounted } from "./theme-provider"

type Message = {
  role: "user" | "assistant"
  content: string
}

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi there! I'm Giovanni's AI assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const mounted = useMounted()

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

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user" as const, content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Add assistant response
      setMessages(prev => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error. Please try again later." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
              <div className={cn(
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
                    onChange={(e) => setInput(e.target.value)}
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
                    onClick={handleSendMessage}
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 