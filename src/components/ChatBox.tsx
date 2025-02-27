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
    submitted: false // Set to false by default so we show the form
  })
  
  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    phoneNumber: ''
  })
  
  // Add loading state for form submission
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false)
  
  // Custom chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Add initial welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { id: 'welcome-message', role: "assistant", content: "Hi there! I'm Giovanni's AI assistant. How can I help you today?" }
      ]);
    }
  }, [messages.length]);

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
    
    // Reset messages to empty array
    setMessages([]);
    
    // Close the chat window
    setIsOpen(false);
    
    // Reset any other state as needed
    setHasNewMessages(false);
  }

  // Handle user info submission
  const handleUserInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({
      name: '',
      phoneNumber: ''
    });
    
    // Validate inputs
    let hasErrors = false;
    
    if (!userInfo.name.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        name: 'Name is required'
      }));
      hasErrors = true;
    }
    
    if (!userInfo.phoneNumber.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        phoneNumber: 'Phone number is required'
      }));
      hasErrors = true;
    } else {
      // Basic phone number validation
      const phoneRegex = /^[\d\+\-\(\) ]{7,20}$/;
      if (!phoneRegex.test(userInfo.phoneNumber)) {
        setValidationErrors(prev => ({
          ...prev,
          phoneNumber: 'Please enter a valid phone number'
        }));
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      return;
    }
    
    // Set loading state
    setIsSubmittingInfo(true);
    
    try {
      // Save user info to the database
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userInfo.name,
          phoneNumber: userInfo.phoneNumber
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save contact information');
      }
      
      // Mark the user info as submitted
      setUserInfo(prev => ({ ...prev, submitted: true }))
    } catch (error) {
      console.error("Error submitting user info:", error)
      
      // Add an error message to the chat
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 15),
        role: "assistant",
        content: "I'm sorry, but I'm having trouble connecting right now. Please try again later."
      }])
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  // Handle user info input changes
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user types
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-lg transition-all duration-300",
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90",
          hasNewMessages && !isOpen && "animate-pulse"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            {hasNewMessages && (
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
            )}
          </div>
        )}
      </Button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-20 right-4 z-50 flex h-[500px] w-[350px] flex-col rounded-xl shadow-2xl",
              isDark ? "bg-zinc-900 text-white border border-zinc-800" : "bg-white text-black border border-zinc-200"
            )}
          >
            {/* Chat header */}
            <div className={cn(
              "flex items-center justify-between rounded-t-xl p-4",
              isDark ? "bg-zinc-800" : "bg-zinc-100"
            )}>
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-1.5 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">Giovanni's AI Assistant</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  onClick={handleEndChat}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  aria-label="End chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full hover:bg-zinc-500/10 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat content */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-lg p-3",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : isDark
                      ? "bg-zinc-800"
                      : "bg-zinc-100"
                  )}
                >
                  <span className="text-xs opacity-70 mb-1">
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollButton && (
              <Button
                onClick={scrollToBottom}
                variant="outline"
                size="sm"
                className="absolute bottom-[80px] right-4 h-8 w-8 rounded-full opacity-80 shadow-md"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}

            {/* Chat input or user info form */}
            {userInfo.submitted ? (
              <form onSubmit={handleChatSubmit} className="p-3 pt-2 border-t">
                <div className="relative">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className={cn(
                      "min-h-[36px] w-full resize-none pr-10",
                      isDark ? "bg-zinc-800" : "bg-white"
                    )}
                    style={{ height: `${textareaHeight}px` }}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute bottom-1 right-1 h-8 w-8"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUserInfoSubmit} className="p-4 pt-2 border-t">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={userInfo.name}
                      onChange={handleUserInfoChange}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-sm",
                        isDark 
                          ? "bg-zinc-800 border-zinc-700 text-white" 
                          : "bg-white border-zinc-300 text-black",
                        validationErrors.name && "border-red-500"
                      )}
                      placeholder="Enter your name"
                      disabled={isSubmittingInfo}
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={userInfo.phoneNumber}
                      onChange={handleUserInfoChange}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-sm",
                        isDark 
                          ? "bg-zinc-800 border-zinc-700 text-white" 
                          : "bg-white border-zinc-300 text-black",
                        validationErrors.phoneNumber && "border-red-500"
                      )}
                      placeholder="Enter your phone number"
                      disabled={isSubmittingInfo}
                    />
                    {validationErrors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-500">{validationErrors.phoneNumber}</p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmittingInfo}
                  >
                    {isSubmittingInfo ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      "Continue to Chat"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 