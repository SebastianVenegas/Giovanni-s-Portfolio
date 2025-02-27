"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { X, Send, ChevronDown, MessageSquare, Sparkles, Trash2, Layout } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"
import { ResizableBox } from 'react-resizable'
import 'react-resizable/css/styles.css'
import Image from "next/image"
import "@/styles/chat.css"

// Define the ChatMessage interface
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
}

// Add new interface for user information
interface UserInfo {
  name: string;
  phoneNumber: string;
  submitted: boolean;
  sessionId: string;
  contactId?: number;
}

// Custom hook for mounted state
function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

// Add typing indicator component
const TypingIndicator = () => {
  return (
    <div className="flex space-x-1.5 items-center px-3 py-2">
      <span className="w-2 h-2 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: "0ms" }}></span>
      <span className="w-2 h-2 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: "300ms" }}></span>
      <span className="w-2 h-2 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: "600ms" }}></span>
    </div>
  )
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

export function ModernChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [textareaHeight, setTextareaHeight] = useState(36) // Default height
  const [sidebarMode, setSidebarMode] = useState(false) // Add state for sidebar mode
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const mounted = useMounted()
  
  // Default dimensions
  const defaultDimensions = { width: 380, height: 500 }
  
  // Sidebar dimensions - initialize with default values to avoid window not defined error
  const [sidebarDimensions, setSidebarDimensions] = useState({ width: 350, height: 600 })
  
  // Update sidebar dimensions when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSidebarDimensions({ width: 350, height: window.innerHeight })
    }
  }, [])
  
  // Add state for chat window dimensions
  const [chatDimensions, setChatDimensions] = useState(defaultDimensions)
  
  // Add user info state
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    phoneNumber: '',
    submitted: false, // Changed to false so we require user info
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` // Add unique session ID
  })
  
  // Add state to control when to show the user form
  const [shouldShowUserForm, setShouldShowUserForm] = useState(false)
  
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

  // Handle resize with custom styling for resize handles
  const handleResize = (e: any, { size }: { size: { width: number, height: number } }) => {
    setChatDimensions({
      width: size.width,
      height: size.height
    })
  }

  // Toggle expanded state
  const toggleExpanded = () => {
    // If closing the chat, reset dimensions to default and exit all modes
    if (isOpen) {
      setChatDimensions(defaultDimensions)
      setSidebarMode(false)
      // Remove body class when closing
      document.body.classList.remove('with-chat-sidebar')
    } else {
      // When opening, check if we should go directly to sidebar mode
      if (sidebarMode) {
        document.body.classList.add('with-chat-sidebar')
      }
    }
    setIsOpen(!isOpen)
  }
  
  // Toggle sidebar mode
  const toggleSidebarMode = () => {
    if (sidebarMode) {
      // Return to default dimensions
      setChatDimensions(defaultDimensions)
      document.body.classList.remove('with-chat-sidebar')
    } else {
      // Set to sidebar dimensions
      setChatDimensions(sidebarDimensions)
      document.body.classList.add('with-chat-sidebar')
    }
    setSidebarMode(!sidebarMode)
  }
  
  // Update body class when sidebar mode changes
  useEffect(() => {
    if (isOpen && sidebarMode) {
      document.body.classList.add('with-chat-sidebar')
    } else {
      document.body.classList.remove('with-chat-sidebar')
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('with-chat-sidebar')
    }
  }, [isOpen, sidebarMode])

  // Add initial welcome message when component mounts
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "👋 Hi there! I'm Giovanni's Personal AI Assistant. How can I help you today?"
        }
      ])
    }
  }, [isOpen, messages.length])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
    
    // Check for experience-related terms first (with common misspellings)
    if (lowercaseMessage.includes("experience") || 
        lowercaseMessage.includes("expirience") || 
        lowercaseMessage.includes("experiance") ||
        lowercaseMessage.includes("expireance") ||
        lowercaseMessage.includes("expirance") ||
        lowercaseMessage.includes("work history") || 
        lowercaseMessage.includes("job history") ||
        lowercaseMessage.includes("career") ||
        lowercaseMessage.includes("where have you worked") || 
        lowercaseMessage.includes("show me experience") ||
        lowercaseMessage.includes("show experience") ||
        lowercaseMessage.includes("your experience")) {
      console.log("Detected experience section via direct check")
      return "experience"
    }
    
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
    
    // Check if user info has been submitted
    if (!userInfo.submitted && !shouldShowUserForm) {
      // Save the user's message for later
      const savedMessage = input.trim();
      
      // Show the user info form
      setShouldShowUserForm(true);
      
      // Add user message to chat
      const userMessage: ChatMessage = {
        role: 'user',
        content: input,
        id: Date.now().toString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // Add assistant message asking for contact info
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Before I answer, could you please share your name and phone number? This helps Giovanni keep track of who's interested in his work.",
          id: Date.now().toString()
        }]);
      }, 500);
      
      return;
    }
    
    // If user info form is showing, don't process new messages
    if (shouldShowUserForm) {
      return;
    }
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      id: Date.now().toString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Add typing indicator immediately
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '', 
      id: `typing-${Date.now().toString()}`,
      isTyping: true 
    }]);
    
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
      
      // Send message to API with retry logic
      let response;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: messages.filter(msg => !msg.isTyping).concat(userMessage),
              userInfo: userInfo // Include user info with the request
            }),
          });
          
          // If successful, break out of retry loop
          if (response.ok) break;
          
          // If we get here, the response wasn't ok
          console.warn(`API responded with status ${response.status}, retry ${retryCount + 1}/${maxRetries}`);
          retryCount++;
          
          // Wait before retrying (exponential backoff)
          if (retryCount <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          retryCount++;
          
          // Wait before retrying
          if (retryCount <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
          }
        }
      }
      
      // Log for debugging
      console.log('Sent chat message with user info:', {
        submitted: userInfo.submitted,
        contactId: userInfo.contactId,
        sessionId: userInfo.sessionId
      });

      // Handle case where all retries failed
      if (!response || !response.ok) {
        throw new Error(`API request failed after ${maxRetries} retries`);
      }
      
      const data = await response.json();
      
      // Calculate a minimal response delay for a more responsive experience
      const responseDelay = Math.min(100 + data.content.length * 1, 500);
      
      // Add occasional "thinking pause" (5% chance of adding 0.2-0.5 second)
      const thinkingPause = Math.random() < 0.05 ? Math.random() * 300 + 200 : 0;
      
      // Add a small delay before showing the response to simulate thinking/typing
      setTimeout(() => {
        // Add assistant message to chat
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content,
          id: Date.now().toString()
        };
        
        setMessages(prev => [...prev.filter(msg => !msg.isTyping), assistantMessage]);
        
        // Notify if chat is closed
        if (!isOpen) {
          setHasNewMessages(true);
        }
      }, responseDelay + thinkingPause);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Hmm, looks like I\'m having connection issues right now. Sorry about that! As Giovanni\'s AI assistant, I sometimes run into technical hiccups. Maybe try again in a bit? 🙄',
          id: Date.now().toString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>
      handleSubmit(formEvent)
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
          phoneNumber: userInfo.phoneNumber,
          sessionId: userInfo.sessionId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save contact information');
      }
      
      // Get the contact ID from the response
      const data = await response.json();
      
      // Mark the user info as submitted and store the contact ID
      setUserInfo(prev => ({ 
        ...prev, 
        submitted: true,
        contactId: data.contactId
      }));
      
      // Hide the user info form
      setShouldShowUserForm(false);
      
      // Save the user's initial message if there is one
      const savedMessage = input.trim();
      
      // Add a personalized greeting with the user's name
      setTimeout(() => {
        // Show typing indicator first
        setMessages([{ 
          id: 'greeting-typing', 
          role: 'assistant', 
          content: '', 
          isTyping: true 
        }]);
        
        // Then show the actual greeting after a delay
        setTimeout(() => {
          // Replace with more human-sounding messages
          const humanGreetings = [
            `Great to meet you, ${userInfo.name}! I'm Giovanni's AI assistant. Giovanni is currently open to job opportunities. What would you like to know about his work?`,
            `Thanks ${userInfo.name}! I'm an AI assistant built by Giovanni. He's currently available for new opportunities. What brings you to his portfolio today? 😊`,
            `Hi ${userInfo.name}! I'm Giovanni's AI assistant. Giovanni is open to job opportunities and ready to work. How can I help you explore his portfolio?`,
            `Nice to meet you, ${userInfo.name}! I'm an AI assistant built and trained by Giovanni. He's currently seeking new opportunities. Feel free to ask me anything about his projects, skills, or experience. 👨‍💻`,
            `Thanks for connecting, ${userInfo.name}! I'm Giovanni's AI assistant. Giovanni is available for new roles. What would you like to explore in his portfolio?`,
            `${userInfo.name}, it's great to connect! I'm an AI assistant built by Giovanni to tell you about his work. He's currently open to job opportunities. What are you interested in? 🚀`,
            `Hey ${userInfo.name}! Thanks for sharing your info. I'm Giovanni's AI assistant - Giovanni is available for new opportunities. What part of his background or projects would you like to know more about?`,
            `Oh hey, ${userInfo.name}! I'm an AI assistant built and trained by Giovanni. He's currently seeking new roles. What can I tell you about his experience or projects?`,
            `Great, thanks ${userInfo.name}! I'm Giovanni's AI assistant here to help. Giovanni is open to job opportunities. Anything specific you're curious about?`,
            `Nice to meet you, ${userInfo.name}! I'm an AI assistant built by Giovanni. He's currently available for work. What brings you to his portfolio? Anything I can help with?`,
            `Hey there ${userInfo.name}! I'm Giovanni's AI assistant. Giovanni is open to new opportunities. What would you like to know about his work? 😊`,
            `${userInfo.name}! Great to connect with you. I'm an AI assistant built by Giovanni. He's currently seeking new roles. What would you like to know about his background or projects?`
          ];
          
          // Pick a random greeting
          const randomGreeting = humanGreetings[Math.floor(Math.random() * humanGreetings.length)];
          
          setMessages([{
            id: 'greeting-message',
            role: 'assistant',
            content: randomGreeting
          }]);
          
          // Process the user's initial message if there was one
          if (savedMessage) {
            setTimeout(() => {
              // Create a synthetic form event to submit the saved message
              const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
              
              // Set the input to the saved message
              setInput(savedMessage);
              
              // Small delay to ensure the input is set
              setTimeout(() => {
                handleSubmit(formEvent);
              }, 50);
            }, 800);
          }
        }, 300);
      }, 100);
      
    } catch (error) {
      console.error("Error submitting user info:", error)
      
      // Add an error message to the chat
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 15),
        role: "assistant",
        content: "Hmm, looks like I'm having connection issues right now. Sorry about that! As Giovanni's AI assistant, I sometimes run into technical hiccups. Maybe try again in a bit? 🙄"
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

  // Add a custom style for the resize handle
  const resizeHandleStyles = {
    '.react-resizable-handle': {
      position: 'absolute',
      width: '20px',
      height: '20px',
      top: '0',
      left: '0',
      cursor: 'nw-resize',
    },
    '.react-resizable-handle::after': {
      content: '""',
      position: 'absolute',
      left: '5px',
      top: '5px',
      width: '8px',
      height: '8px',
      borderLeft: '2px solid rgba(127, 127, 127, 0.5)',
      borderTop: '2px solid rgba(127, 127, 127, 0.5)',
      borderRadius: '1px'
    }
  };

  return (
    <>
      {/* Add global styles for sidebar mode */}
      <style jsx global>{`
        /* Sidebar mode styles */
        body.with-chat-sidebar {
          transition: padding-right 0.3s ease;
          padding-right: 350px;
          position: relative;
        }
        
        @media (max-width: 768px) {
          body.with-chat-sidebar {
            padding-right: 0;
          }
        }
        
        /* Fix for sidebar mode interaction */
        .sidebar-mode-active {
          pointer-events: auto !important;
        }
      `}</style>
    
      {/* Chat button */}
      <Button
        onClick={toggleExpanded}
        className={cn(
          "fixed bottom-4 right-4 z-50 rounded-full p-3.5 shadow-xl transition-all duration-300 hover:scale-105",
          isOpen 
            ? "bg-red-500 hover:bg-red-600" 
            : isDark
              ? "bg-white hover:bg-white/90 text-black"
              : "bg-black hover:bg-black/90 text-white",
          hasNewMessages && !isOpen && "animate-pulse"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <div className="flex items-center justify-center">
              <Image 
                src="/GV Fav.png" 
                alt="GV" 
                width={32} 
                height={32} 
                className={cn(
                  "rounded-full",
                  isDark ? "brightness-0" : ""
                )}
              />
            </div>
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
              "fixed z-50",
              sidebarMode 
                ? "top-0 bottom-0 right-0 h-full" 
                : "bottom-20 right-4"
            )}
            style={{
              zIndex: sidebarMode ? 1100 : 50,
              pointerEvents: "auto"
            }}
          >
            <ResizableBox
              width={chatDimensions.width}
              height={sidebarMode ? window.innerHeight : chatDimensions.height}
              minConstraints={[300, 400]}
              maxConstraints={
                sidebarMode 
                  ? [350, window.innerHeight] 
                  : [600, 800]
              }
              resizeHandles={sidebarMode ? [] : ['nw']}
              onResize={handleResize}
              className={cn(
                "flex flex-col overflow-hidden relative futuristic-border",
                sidebarMode && "sidebar-mode sidebar-mode-active",
                sidebarMode 
                  ? isDark 
                    ? "bg-black border-l border-white/10" 
                    : "bg-white border-l border-black/10"
                  : isDark 
                    ? "bg-black/40 border border-white/10 rounded-xl backdrop-blur-md" 
                    : "bg-white/60 border border-black/10 rounded-xl backdrop-blur-md"
              )}
            >
              {/* Neural network background pattern */}
              {!sidebarMode && <div className="absolute inset-0 neural-bg opacity-10 pointer-events-none" />}
              
              {/* Chat header */}
              <div className={cn(
                "flex items-center justify-between px-4 py-3 relative z-20",
                sidebarMode
                  ? isDark 
                    ? "bg-black" 
                    : "bg-white"
                  : isDark 
                    ? "bg-black/30" 
                    : "bg-white/50"
              )}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl ai-pulse",
                      isDark 
                        ? "bg-white text-black" 
                        : "bg-black text-white"
                    )}>
                      <Image 
                        src="/GV Fav.png" 
                        alt="GV" 
                        width={24} 
                        height={24} 
                        className={cn(
                          "rounded-full",
                          isDark ? "brightness-0" : ""
                        )}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-black"></div>
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-semibold text-base",
                      isDark ? "text-white" : "text-black"
                    )}>Giovanni's Personal AI Assistant</h3>
                    <div className="flex items-center text-xs">
                      <span className={cn(
                        "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
                        isDark ? "bg-green-400" : "bg-green-500"
                      )}></span>
                      <span className={cn(
                        isDark ? "text-gray-300" : "text-gray-600"
                      )}>
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 relative z-30">
                  {/* Toggle sidebar mode button */}
                  <button
                    onClick={toggleSidebarMode}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isDark 
                        ? "hover:bg-white/10 text-gray-300" 
                        : "hover:bg-black/10 text-gray-600",
                      sidebarMode && "bg-primary/20"
                    )}
                    aria-label={sidebarMode ? "Exit sidebar mode" : "Enter sidebar mode"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  </button>
                  
                  {/* End chat button */}
                  <button
                    onClick={() => {
                      setMessages([]);
                      setChatDimensions(defaultDimensions);
                      setSidebarMode(false);
                      setIsOpen(false);
                      document.body.classList.remove('with-chat-sidebar');
                    }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isDark 
                        ? "hover:bg-white/10 text-gray-300" 
                        : "hover:bg-black/10 text-gray-600"
                    )}
                    aria-label="End chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  {/* Close button */}
                  <button
                    onClick={toggleExpanded}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isDark 
                        ? "hover:bg-white/10 text-gray-300" 
                        : "hover:bg-black/10 text-gray-600"
                    )}
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Chat messages */}
              <div 
                ref={messagesContainerRef}
                className={cn(
                  "flex-1 overflow-y-auto p-4 space-y-4 relative z-10 chat-scrollbar",
                  isDark ? "scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20" : "scrollbar-thumb-black/10 hover:scrollbar-thumb-black/20"
                )}
                style={{ 
                  background: sidebarMode
                    ? isDark 
                      ? 'rgb(0, 0, 0)' 
                      : 'rgb(255, 255, 255)'
                    : isDark 
                      ? 'rgba(0, 0, 0, 0.1)' 
                      : 'rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[85%] message-animation",
                      message.role === "user" 
                        ? "ml-auto" 
                        : "mr-auto flex"
                    )}
                    style={{ 
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {message.role === "assistant" && (
                      <div className={cn(
                        "flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center mr-2 mt-1",
                        isDark 
                          ? "bg-white text-black" 
                          : "bg-black text-white"
                      )}>
                        <Image 
                          src="/GV Fav.png" 
                          alt="GV" 
                          width={20} 
                          height={20} 
                          className={cn(
                            "rounded-full",
                            isDark ? "brightness-0" : ""
                          )}
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "p-3.5 shadow-sm transition-all duration-200",
                        message.role === "user" 
                          ? "rounded-2xl rounded-br-sm backdrop-blur-sm" 
                          : "rounded-2xl rounded-bl-sm backdrop-blur-sm",
                        message.role === "user"
                          ? isDark 
                            ? "bg-white/10 border border-white/5 text-white" 
                            : "bg-black/10 border border-black/5 text-black"
                          : isDark
                            ? "bg-black/30 border border-white/5 text-white" 
                            : "bg-white/50 border border-black/5 text-black"
                      )}
                    >
                      {message.isTyping ? (
                        <div className="flex space-x-1.5 items-center px-3 py-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full typing-dot",
                            isDark ? "bg-white/70" : "bg-black/70"
                          )}></span>
                          <span className={cn(
                            "w-2 h-2 rounded-full typing-dot",
                            isDark ? "bg-white/70" : "bg-black/70"
                          )}></span>
                          <span className={cn(
                            "w-2 h-2 rounded-full typing-dot",
                            isDark ? "bg-white/70" : "bg-black/70"
                          )}></span>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed">
                    {message.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
                    </div>
              
              {/* User info form */}
              {shouldShowUserForm ? (
                <form 
                  onSubmit={handleUserInfoSubmit}
                  className={cn(
                    "p-6 relative z-20 glass-effect",
                    sidebarMode
                      ? isDark 
                        ? "bg-black" 
                        : "bg-white"
                      : isDark 
                        ? "bg-black/20" 
                        : "bg-white/40"
                  )}
                >
                  <div className="mb-5">
                    <h4 className={cn(
                      "text-base font-medium mb-4 text-center animate-fadeIn",
                      isDark ? "text-white" : "text-black"
                    )}>
                      Please share your contact information
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
                        <input
                          type="text"
                          name="name"
                          value={userInfo.name}
                          onChange={handleUserInfoChange}
                          placeholder="Your name"
                          className={cn(
                            "form-input w-full px-4 py-3 rounded-lg transition-all",
                            isDark 
                              ? "bg-black/30 text-white border-white/20 focus:border-white/40" 
                              : "bg-white/70 text-black border-black/10 focus:border-black/30"
                          )}
                          disabled={isSubmittingInfo}
                        />
                        {validationErrors.name && (
                          <div className="form-error mt-1">{validationErrors.name}</div>
                        )}
                      </div>
                      
                      <div className="animate-fadeIn" style={{ animationDelay: "200ms" }}>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={userInfo.phoneNumber}
                          onChange={handleUserInfoChange}
                          placeholder="Your phone number"
                          className={cn(
                            "form-input w-full px-4 py-3 rounded-lg transition-all",
                            isDark 
                              ? "bg-black/30 text-white border-white/20 focus:border-white/40" 
                              : "bg-white/70 text-black border-black/10 focus:border-black/30"
                          )}
                          disabled={isSubmittingInfo}
                        />
                        {validationErrors.phoneNumber && (
                          <div className="form-error mt-1">{validationErrors.phoneNumber}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingInfo}
                    className={cn(
                      "w-full p-3 rounded-lg transition-all shadow-sm hover:shadow-md text-sm font-medium animate-fadeIn",
                      isDark 
                        ? "bg-white hover:bg-white/90 text-black" 
                        : "bg-black hover:bg-black/90 text-white",
                      isSubmittingInfo && "opacity-50 cursor-not-allowed"
                    )}
                    style={{ animationDelay: "300ms" }}
                  >
                    {isSubmittingInfo ? "Submitting..." : "Continue Conversation"}
                  </button>
                  
                  <p className={cn(
                    "text-xs mt-4 text-center animate-fadeIn",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                  style={{ animationDelay: "400ms" }}
                  >
                    Your information helps Giovanni connect with interested visitors.
                  </p>
                </form>
              ) : (
                /* Chat input */
                <form 
                  onSubmit={handleSubmit} 
                  className={cn(
                    "p-4 relative z-20 glass-effect",
                    sidebarMode
                      ? isDark 
                        ? "bg-black" 
                        : "bg-white"
                      : isDark 
                        ? "bg-black/20" 
                        : "bg-white/40"
                  )}
                >
                  <div className={cn(
                    "flex items-center space-x-2 rounded-xl p-1.5 relative z-20",
                    isDark 
                      ? "bg-black/30 border border-white/10" 
                      : "bg-white/50 border border-black/10"
                  )}>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything..."
                      className={cn(
                        "flex-1 p-2.5 rounded-lg resize-none text-sm modern-input",
                        isDark 
                          ? "bg-transparent border-none focus:ring-0 placeholder-gray-500 text-white" 
                          : "bg-transparent border-none focus:ring-0 placeholder-gray-500 text-black",
                        "focus:outline-none"
                      )}
                      style={{ height: `${textareaHeight}px` }}
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className={cn(
                        "p-2.5 rounded-xl transition-all shadow-sm hover:shadow",
                        isDark 
                          ? "bg-white hover:bg-white/90 text-black" 
                          : "bg-black hover:bg-black/90 text-white",
                        (isLoading || !input.trim()) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* AI capabilities hint */}
                  <div className="mt-2 flex justify-center">
                    <div className="text-xs flex items-center space-x-4">
                      <span className={cn(
                        "flex items-center",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}>
                        <span className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
                          isDark ? "bg-white/70" : "bg-black/70"
                        )}></span>
                        Ask about projects
                      </span>
                      <span className={cn(
                        "flex items-center",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}>
                        <span className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
                          isDark ? "bg-white/50" : "bg-black/50"
                        )}></span>
                        Explore skills
                      </span>
                    </div>
                  </div>
                </form>
              )}
            </ResizableBox>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
