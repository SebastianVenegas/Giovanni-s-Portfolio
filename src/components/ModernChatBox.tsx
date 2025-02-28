"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { X, Send, ChevronDown, MessageSquare, Sparkles, Trash2, Layout, Minimize2, Maximize2 } from "lucide-react"
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
  "contact": ["contact", "email", "reach out", "message", "get in touch", "hire"],
  "certificates": ["certificate", "certification", "credentials", "qualifications"]
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
  
  // Load user info from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUserInfo = localStorage.getItem('chatUserInfo');
      if (savedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(savedUserInfo);
          // Create a new session ID for this chat session
          setUserInfo({
            ...parsedUserInfo,
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          });
        } catch (error) {
          console.error('Error parsing saved user info:', error);
        }
      }
    }
  }, []);
  
  // Add state to control when to show the user form
  const [shouldShowUserForm, setShouldShowUserForm] = useState(false)
  
  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    phoneNumber: ''
  })
  
  // Add state for contact form
  const [contactFormData, setContactFormData] = useState({
    email: '',
    service: '',
    message: ''
  })
  
  // Add state for contact form step
  const [contactFormStep, setContactFormStep] = useState(0)
  
  // Add loading state for form submission
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false)
  
  // Add state to track if device is mobile
  const [isMobile, setIsMobile] = useState(false)
  
  // Custom chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Detect mobile devices and set appropriate mode
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // If mobile and chat is open, automatically set to sidebar/fullscreen mode
      if (mobile && isOpen) {
        setSidebarMode(true)
        setChatDimensions({ width: window.innerWidth, height: window.innerHeight })
        document.body.classList.add('with-chat-sidebar')
      }
    }
    
    // Check on initial load
    if (typeof window !== 'undefined') {
      checkMobile()
      
      // Add resize listener
      window.addEventListener('resize', checkMobile)
    }
    
    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile)
      }
    }
  }, [isOpen])

  // Handle resize with custom styling for resize handles
  const handleResize = (e: any, { size }: { size: { width: number, height: number } }) => {
    // Don't allow resize on mobile
    if (!isMobile) {
      setChatDimensions({
        width: size.width,
        height: size.height
      })
    }
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
      if (isMobile || sidebarMode) {
        setSidebarMode(true)
        setChatDimensions({ width: window.innerWidth, height: window.innerHeight })
        document.body.classList.add('with-chat-sidebar')
      }
    }
    setIsOpen(!isOpen)
  }

  // Toggle sidebar mode
  const toggleSidebarMode = () => {
    // Don't allow toggling out of sidebar mode on mobile
    if (isMobile && !sidebarMode) {
      setSidebarMode(true)
      setChatDimensions({ width: window.innerWidth, height: window.innerHeight })
      document.body.classList.add('with-chat-sidebar')
      return
    }
    
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
      if (userInfo.submitted) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `👋 Welcome back, ${userInfo.name}! I'm NextGio AI, Giovanni's custom-trained AI assistant. How can I help you today?`
          }
        ]);
      } else {
        setMessages([
          {
            id: "welcome-1",
            role: "assistant",
            content: "👋 Hello! I'm NextGio AI, Giovanni's custom-trained AI assistant. Welcome to his portfolio website!"
          },
          {
            id: "welcome-3",
            role: "assistant",
            content: "🚀 Giovanni is currently available for new projects and collaborations. How can I help you learn more about his expertise or answer any questions about his services?"
          }
        ]);
      }
    }
  }, [isOpen, messages.length, userInfo.submitted, userInfo.name])
  
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
    // This function is now deprecated as we're letting the AI decide when to scroll
    // We'll keep it for backward compatibility but it will always return null
    console.log("Section detection now handled by AI, skipping client-side detection")
    return null
  }

  // Function to scroll to a section
  const scrollToSection = (id: string) => {
    console.log(`Attempting to scroll to section: ${id}`);
    
    // Map section names to actual section IDs used in the page
    const sectionIdMap: Record<string, string> = {
      "about": "about",
      "experience": "experience",
      "skills": "certifications", // Skills are shown in certifications section
      "projects": "projects",
      "contact": "contact",
      "certificates": "certifications"
    };
    
    // Get the actual section ID to look for
    const actualSectionId = sectionIdMap[id] || id;
    console.log(`Mapped section ${id} to actual section ID: ${actualSectionId}`);
    
    // Log all section IDs in the document for debugging
    console.log("All section IDs in document:");
    document.querySelectorAll('[id]').forEach(el => {
      console.log(`- ${el.id} (${el.tagName})`);
    });
    
    // Try to find the element by ID
    let element = document.getElementById(actualSectionId);
    
    if (element) {
      console.log(`Found element with id: ${actualSectionId}, scrolling now`);
    } else {
      console.log(`Element with id ${actualSectionId} not found, trying alternative selectors`);
      
      // Try alternative selectors if element not found by ID
      const selectors = [
        `section#${actualSectionId}`,
        `section[id="${actualSectionId}"]`,
        `div#${actualSectionId}`,
        `div[id="${actualSectionId}"]`,
        `#${actualSectionId}`
      ];
      
      for (const selector of selectors) {
        const foundElement = document.querySelector(selector);
        if (foundElement) {
          console.log(`Found element using selector: ${selector}`);
          element = foundElement as HTMLElement;
          break;
        }
      }
      
      // If still not found, try looking for sections with matching text content
      if (!element) {
        console.log(`Still couldn't find element, looking for sections with matching text`);
        const sections = document.querySelectorAll('section, div.section');
        for (const section of sections) {
          const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
          for (const heading of headings) {
            const headingText = heading.textContent?.toLowerCase() || '';
            if (headingText.includes(actualSectionId.toLowerCase()) || 
                (actualSectionId === 'contact' && headingText.includes('get in touch'))) {
              console.log(`Found section with matching heading text: "${headingText}"`);
              element = section as HTMLElement;
              break;
            }
          }
          if (element) break;
        }
      }
    }
    
    if (element) {
      // Use a direct scrolling method without any transitions or animations that could affect theme
      try {
        // Get the element's position
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = scrollTop + rect.top - 80; // 80px offset for headers
        
        console.log(`Scrolling directly to position: ${targetPosition}`);
        
        // Use a single scrollTo operation with smooth behavior
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } catch (error) {
        console.error(`Error scrolling to section ${actualSectionId}:`, error);
        
        // Last resort fallback
        try {
          console.log(`Using hash navigation as fallback: #${actualSectionId}`);
          // Use hash navigation without triggering history changes
          const currentUrl = window.location.href.split('#')[0];
          window.location.replace(`${currentUrl}#${actualSectionId}`);
        } catch (hashError) {
          console.error(`Hash navigation also failed:`, hashError);
        }
      }
    } else {
      console.error(`Could not find any element for section: ${actualSectionId}`);
      
      // Try to find any section that might match as a last resort
      const allSections = document.querySelectorAll('section');
      console.log(`Looking through ${allSections.length} sections for a partial match`);
      
      for (const section of allSections) {
        const sectionId = section.id || '';
        if (sectionId.includes(actualSectionId) || actualSectionId.includes(sectionId)) {
          console.log(`Found partial match with section id: ${sectionId}`);
          
          // Get the element's position
          const rect = section.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = scrollTop + rect.top - 80; // 80px offset for headers
          
          // Use a single scrollTo operation with smooth behavior
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          break;
        }
      }
    }
  };

  // Function to check if message is about contacting Giovanni
  const isContactRequest = (message: string) => {
    const lowercaseMessage = message.toLowerCase().trim();
    
    const contactKeywords = [
      'contact', 'hire', 'work with', 'get in touch', 'reach out',
      'email', 'phone', 'call', 'message', 'project', 'job', 'opportunity',
      'connect', 'talk to', 'speak with', 'meet', 'schedule', 'appointment',
      'consultation', 'quote', 'estimate', 'proposal', 'services',
      'lets contact', 'let\'s contact', 'contact in the chat', 'continue in the chat',
      'continue here', 'through the chat', 'chat option', 'first option'
    ];
    
    return contactKeywords.some(keyword => lowercaseMessage.includes(keyword));
  }

  // Handle contact form submission through chat
  const handleChatContactSubmit = async () => {
    // Validate inputs
    let valid = true;
    const errors = {
      name: '',
      phoneNumber: ''
    };
    
    if (!userInfo.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    }
    
    if (!userInfo.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
      valid = false;
    }
    
    if (!contactFormData.email.trim()) {
      // Add error message to chat instead of form validation
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'll need your email address to proceed. Could you please provide it?",
        id: Date.now().toString()
      }]);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactFormData.email)) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "That email address doesn't look valid. Could you please provide a valid email?",
        id: Date.now().toString()
      }]);
      return;
    }
    
    // Show loading state
    setIsSubmittingInfo(true);
    
    try {
      // Prepare the contact data
      const contactData = {
        name: userInfo.name,
        email: contactFormData.email,
        phone: userInfo.phoneNumber,
        service: contactFormData.service || 'Not specified',
        message: contactFormData.message || 'Contact request submitted via chat'
      };
      
      // Send data to the API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send contact request');
      }
      
      // Reset contact form
      setContactFormData({
        email: '',
        service: '',
        message: ''
      });
      
      setContactFormStep(0);
      
      // Add success message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Great! I've sent your contact information to Giovanni. He'll get back to you as soon as possible. Is there anything else you'd like to know about his work or experience?",
        id: Date.now().toString()
      }]);
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble sending your contact information. Please try again or use the contact form at the bottom of the page.",
        id: Date.now().toString()
      }]);
    } finally {
      setIsSubmittingInfo(false);
    }
  }

  // Handle contact form input through chat
  const handleContactFormInput = (message: string) => {
    const lowercaseMessage = message.toLowerCase().trim();
    
    // Check if user wants to exit the contact form flow
    const exitKeywords = ['cancel', 'exit', 'stop', 'quit', 'no thanks', 'nevermind', 'never mind', 'no', 'don\'t want to'];
    
    if (exitKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
      // Reset contact form
      setContactFormStep(0);
      setContactFormData({
        email: '',
        service: '',
        message: ''
      });
      
      // Add message to chat
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "No problem! I've canceled the contact form. Is there anything else I can help you with about Giovanni's experience or services?",
          id: Date.now().toString()
        }]);
        
        // Scroll to the messages end
        scrollToBottom();
      }, 500);
      
      return;
    }
    
    // Process based on current step
    switch (contactFormStep) {
      case 1: // Email step
        // Check if this is a conversational response rather than an email
        const conversationalPhrases = [
          'lets continue', 'let\'s continue', 'continue', 'go ahead', 'proceed',
          'lets chat', 'let\'s chat', 'chat', 'talk', 'discuss', 'help me',
          'i want to', 'i would like', 'i\'d like', 'yes', 'sure', 'okay', 'ok',
          'lets do it', 'let\'s do it', 'do it', 'sounds good', 'alright',
          'lets contact', 'let\'s contact', 'contact in the chat', 'continue in the chat',
          'continue here', 'through the chat', 'chat option', 'first option'
        ];
        
        // If it's a conversational response, ask for email again more clearly
        if (conversationalPhrases.some(phrase => lowercaseMessage.includes(phrase))) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "I'll need your email address to proceed with the contact form. Please provide a valid email address (like example@domain.com) or type 'cancel' to exit this process.",
              id: Date.now().toString()
            }]);
            scrollToBottom();
          }, 500);
          return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(message)) {
          // Save email
          setContactFormData(prev => ({
            ...prev,
            email: message
          }));
          
          // Move to next step
          setContactFormStep(2);
          
          // Ask for service interest
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "Great! What type of service are you interested in? (e.g., Web Development, Mobile App, AI Integration, Consulting, etc.) Or type 'cancel' if you want to stop the contact process.",
              id: Date.now().toString()
            }]);
            
            // Scroll to the messages end
            scrollToBottom();
          }, 500);
        } else {
          // Invalid email format
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "I need a valid email address to continue (like example@domain.com). If you'd prefer not to provide an email, you can type 'cancel' to exit and use the contact form below instead.",
              id: Date.now().toString()
            }]);
            
            // Scroll to the messages end
            scrollToBottom();
          }, 500);
        }
        break;
        
      case 2: // Service step
        // Save service
        setContactFormData(prev => ({
          ...prev,
          service: message
        }));
        
        // Move to next step
        setContactFormStep(3);
        
        // Ask for project description
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Thanks! Please provide a brief description of your project or what you'd like to discuss with Giovanni. Or type 'cancel' if you want to stop the contact process.",
            id: Date.now().toString()
          }]);
          
          // Scroll to the messages end
          scrollToBottom();
        }, 500);
        break;
        
      case 3: // Message step
        // Save message
        setContactFormData(prev => ({
          ...prev,
          message: message
        }));
        
        // Submit the form
        handleChatContactSubmit();
        break;
        
      default:
        break;
    }
  }

  // Update handleSubmit to handle contact requests
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const currentInput = input.trim();
    if (!currentInput) return;
    
    // Check if user info has been submitted
    if (!userInfo.submitted && !shouldShowUserForm) {
      // Save the user's message for later
      const savedMessage = currentInput;
      
      // Show the user info form
      setShouldShowUserForm(true);
      
      // Add user message to chat
      const userMessage: ChatMessage = {
        role: 'user',
        content: currentInput,
        id: Date.now().toString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // Add assistant message asking for contact info
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Sure, but could you please share your name and phone number first? This helps Giovanni keep track of who's interested in his work.",
          id: Date.now().toString()
        }]);
      }, 500);
      
      return;
    }
    
    // If we're in contact form flow, handle that separately
    if (contactFormStep > 0) {
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
        content: currentInput,
      id: Date.now().toString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
      
      // Process the contact form input
      handleContactFormInput(currentInput);
      return;
    }
    
    // If we get here, either user info is submitted or we're showing the form
    // If we're showing the form, don't process the message yet
    if (shouldShowUserForm) {
      return;
    }
    
    // Add user message to chat (skip if it's already in the messages array)
    const messageExists = messages.some(msg => 
      msg.role === 'user' && msg.content === currentInput
    );
    
    let userMessage: ChatMessage;
    
    if (!messageExists) {
      userMessage = {
        role: 'user' as const,
        content: currentInput,
        id: Date.now().toString()
      };
      
      setMessages(prev => [...prev, userMessage]);
    } else {
      userMessage = messages.find(msg => 
        msg.role === 'user' && msg.content === currentInput
      ) as ChatMessage;
    }
    
    setInput('');
    
    // Check if this is a contact request
    if (isContactRequest(currentInput) && userInfo.submitted) {
      // Scroll to contact section first
      console.log("Contact request detected, scrolling to contact section");
      setTimeout(() => {
        scrollToSection("contact");
      }, 100);
      
      // Start contact form flow
      setContactFormStep(1);
      
      // Ask for email and offer both options
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'd be happy to help you get in touch with Giovanni! You have two options:\n\n1. Continue here in the chat and I'll guide you through a simple form (I already have your name and phone number)\n2. Use the contact form below that you can fill out directly\n\nIf you'd like to continue through the chat, please provide your email address. Or you can type 'cancel' at any time to exit this process.",
          id: Date.now().toString()
        }]);
        
        // Scroll to the messages end
        scrollToBottom();
      }, 500);
      
      return;
    }
    
    setIsLoading(true);
    
    // Add typing indicator immediately
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '', 
      id: `typing-${Date.now().toString()}`,
      isTyping: true 
    }]);
    
    try {
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
        
        // Check if the AI response contains a scroll instruction
        const scrollMatch = data.content.match(/\[SCROLL_TO:(\w+)\]/i);
        console.log("Checking for scroll tag in response:", data.content.substring(0, 100));
        
        if (scrollMatch && scrollMatch[1]) {
          const sectionToScrollTo = scrollMatch[1].toLowerCase();
          console.log(`AI requested scroll to section: ${sectionToScrollTo}`);
          
          // Remove the scroll instruction from the displayed message
          const cleanedContent = data.content.replace(/\[SCROLL_TO:\w+\]/i, '').trim();
          
          // Update the message with cleaned content
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? {...msg, content: cleanedContent} 
                : msg
            )
          );
          
          // Scroll to the requested section with a slight delay to ensure the DOM is ready
          setTimeout(() => {
            console.log(`Executing scroll to ${sectionToScrollTo} from AI instruction`);
            scrollToSection(sectionToScrollTo);
          }, 500); // Increased delay to ensure DOM is ready
        } else {
          // Check for section-specific keywords in the message as a fallback
          console.log("No scroll tag found, checking for section keywords in message");
          
          // Extract the first 50 characters of the message for keyword checking
          const messageStart = data.content.substring(0, 50).toLowerCase();
          
          if (messageStart.includes("work experience") || 
              messageStart.includes("work history") || 
              messageStart.includes("companies") ||
              messageStart.includes("employment")) {
            console.log("Detected experience-related content, scrolling to experience section");
            setTimeout(() => scrollToSection("experience"), 500);
          } else if (messageStart.includes("certification") || 
                     messageStart.includes("credential") || 
                     messageStart.includes("certificate")) {
            console.log("Detected certificate-related content, scrolling to certificates section");
            setTimeout(() => scrollToSection("certificates"), 500);
          }
        }
        
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
    
    if (isSubmittingInfo) return;
    
    setIsSubmittingInfo(true);
    
    // Validate inputs
    let valid = true;
    const errors = {
      name: '',
      phoneNumber: ''
    };
    
    if (!userInfo.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    }
    
    if (!userInfo.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
      valid = false;
    } else {
      // Basic phone validation
      const phoneRegex = /^\+?[0-9\s\-\(\)]{7,}$/;
      if (!phoneRegex.test(userInfo.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid phone number';
        valid = false;
      }
    }
    
    if (!valid) {
      setValidationErrors(errors);
      setIsSubmittingInfo(false);
      return;
    }
    
    // Add a temporary message to show submission is in progress
    const submittingMessageId = Date.now().toString();
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Submitting your information...',
      id: submittingMessageId
    }]);
    
    try {
      // Send user info to API - using the new endpoint
      const response = await fetch('/api/chat/user', {
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
        throw new Error(errorData.error || 'Failed to submit contact information');
      }
      
      const data = await response.json();
      
      // Update user info with contact ID and submitted status
      const updatedUserInfo = {
        ...userInfo,
        submitted: true,
        contactId: data.contactId || data.id
      };
      
      setUserInfo(updatedUserInfo);
      
      // Save user info to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatUserInfo', JSON.stringify(updatedUserInfo));
      }
      
      // Hide the form
      setShouldShowUserForm(false);
      
      // Find the welcome message and user's first message
      const welcomeMessage = messages.find(msg => msg.id === "welcome");
      const userFirstMessage = messages.find(msg => msg.role === "user");
      
      // Create a new messages array with the welcome message and thank you message
      const newMessages: ChatMessage[] = [];
      
      // Keep the welcome message
      if (welcomeMessage) {
        newMessages.push(welcomeMessage);
      }
      
      // Keep the user's first message if it exists
      if (userFirstMessage) {
        newMessages.push(userFirstMessage);
      }
      
      // Add the thank you message
      newMessages.push({
        role: 'assistant' as const,
        content: `Thanks ${userInfo.name}! Now, how can I help you learn more about Giovanni's experience and skills?`,
        id: Date.now().toString()
      });
      
      // Update messages
      setMessages(newMessages);
      
      // Process the user's first question if it exists
      if (userFirstMessage) {
        // Add a small delay before processing the first question
              setTimeout(() => {
          // Call handleSubmit programmatically with the first question
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
          setInput(userFirstMessage.content);
          handleSubmit(fakeEvent);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error submitting user info:', error);
      
      // Remove the submitting message
      setMessages(prev => prev.filter(msg => msg.id !== submittingMessageId));
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error submitting your information. Please try again.',
        id: Date.now().toString()
      }]);
      
      // Show validation error if any
      if (error instanceof Error) {
        setValidationErrors({
          ...errors,
          phoneNumber: error.message
        });
      }
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
        
        /* Adjust navbar to stay centered with content when sidebar is active */
        body.with-chat-sidebar .fixed.top-0.left-0.right-0.z-\[100\] {
          transition: padding-right 0.3s ease;
          padding-right: 350px;
        }
        
        /* Adjust navbar's inner container to maintain proper width */
        body.with-chat-sidebar .fixed.top-0.left-0.right-0.z-\[100\] .max-w-5xl {
          margin-left: auto;
          margin-right: auto;
        }
        
        @media (max-width: 768px) {
          body.with-chat-sidebar {
            padding-right: 0;
          }
          
          body.with-chat-sidebar .fixed.top-0.left-0.right-0.z-\[100\] {
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
              resizeHandles={sidebarMode || isMobile ? [] : ['nw']}
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
                        alt="NextGio AI" 
                        width={24} 
                        height={24} 
                        className={cn(
                          "rounded-full",
                          isDark ? "brightness-0 invert" : ""
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">NextGio AI</h3>
                    <p className="text-xs opacity-70">Giovanni's AI Assistant</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Only show sidebar toggle on non-mobile */}
                  {!isMobile && (
                    <Button
                      onClick={toggleSidebarMode}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8"
                      aria-label={sidebarMode ? "Exit sidebar mode" : "Enter sidebar mode"}
                    >
                      {sidebarMode ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={toggleExpanded}
                    size="sm"
                    variant={isMobile ? "default" : "ghost"}
                    className={cn(
                      "h-8 w-8",
                      isMobile && (isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90")
                    )}
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
            
            {/* Mobile exit button at bottom of screen */}
            {isMobile && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[1200]">
                <Button
                  onClick={toggleExpanded}
                  size="default"
                  variant="default"
                  className={cn(
                    "px-6 py-2 rounded-full shadow-lg",
                    isDark 
                      ? "bg-white text-black hover:bg-white/90" 
                      : "bg-black text-white hover:bg-black/90"
                  )}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close Chat
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
