"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { X, Send, ArrowDown, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

// Define the ChatMessage interface
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
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
  "about": ["about", "who is giovanni", "background", "experience", "bio", "biography"],
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
        setTimeout(() => {
          scrollToSection(sectionToScrollTo);
        }, 500);
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

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-50 rounded-full p-4 shadow-lg",
          hasNewMessages && "animate-pulse"
        )}
        aria-label="Open chat"
      >
        <div className="relative">
          {hasNewMessages && (
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </Button>

      {/* Chat modal */}
      {isOpen && mounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20">
          <div
            className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="z-50 grid w-full max-w-lg gap-4 rounded-xl border bg-background p-6 shadow-lg sm:max-w-xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Chat with Giovanni&apos;s AI</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEndChat}
                  className="h-8 w-8"
                  aria-label="End chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="custom-scrollbar h-[300px] space-y-4 overflow-y-auto rounded-md border bg-muted/50 p-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-max max-w-[80%] flex-col gap-2 rounded-lg p-3",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="text-sm">{message.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {showScrollButton && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-[120px] right-8 z-10 h-8 w-8 rounded-full bg-background shadow-md"
                  onClick={scrollToBottom}
                  aria-label="Scroll to bottom"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleChatSubmit} className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[36px] resize-none"
                style={{ height: `${textareaHeight}px` }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="h-9 w-9"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 