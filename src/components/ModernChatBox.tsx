"use client"

import { useEffect, useRef, useState, useLayoutEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { X, Send, ChevronDown, MessageSquare, Sparkles, Trash2, Layout, PanelLeftClose, PanelLeftOpen } from "lucide-react"
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
      <span className={cn(
        "w-2 h-2 rounded-full typing-dot",
        "bg-black/70"
      )}></span>
      <span className={cn(
        "w-2 h-2 rounded-full typing-dot",
        "bg-black/70"
      )}></span>
      <span className={cn(
        "w-2 h-2 rounded-full typing-dot",
        "bg-black/70"
      )}></span>
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
  
  // Custom chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Add a new state variable to track mobile view
  const [isMobile, setIsMobile] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Add a minimized state for mobile
  const [minimizedOnMobile, setMinimizedOnMobile] = useState(false)

  // Handle resize with custom styling for resize handles
  const handleResize = (e: any, { size }: { size: { width: number, height: number } }) => {
    setChatDimensions({
      width: size.width,
      height: size.height
    })
  }

  // Detect mobile screen and adjust layout
  const checkMobileScreen = () => {
    const mobileView = window.innerWidth < 768
    setIsMobile(mobileView)
    setViewportHeight(window.innerHeight)
    
    // If transitioning to mobile, automatically open in full screen sidebar mode
    if (mobileView && !sidebarMode && isOpen) {
      setSidebarMode(true)
      document.body.classList.add('with-chat-sidebar')
    }
    
    // Force re-layout on orientation change
    if (mobileView) {
      // Adjust layout immediately for orientation changes
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
      }, 100)
    }
  }

  // Add this useEffect for mobile detection
  useEffect(() => {
    // Initial check
    checkMobileScreen()
    
    // Set up listeners for resize and viewport changes (for mobile keyboard)
    window.addEventListener('resize', checkMobileScreen)
    window.visualViewport?.addEventListener('resize', () => {
      // Check if keyboard is likely open based on visual viewport height change
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height
        setKeyboardOpen(heightDiff > 150) // Threshold to detect keyboard
        setViewportHeight(window.visualViewport.height)
        
        // Scroll to bottom when keyboard opens
        if (heightDiff > 150) {
          setTimeout(() => scrollToBottom(), 100)
        }
      }
    })
    
    return () => {
      window.removeEventListener('resize', checkMobileScreen)
      window.visualViewport?.removeEventListener('resize', () => {})
    }
  }, [])

  // REMOVE automatic opening on mobile - only set mobile mode when manually opened
  useEffect(() => {
    if (isMobile && isOpen) {
      setSidebarMode(true)
      document.body.classList.add('with-chat-sidebar')
    }
  }, [isMobile, isOpen])

  // Update toggleExpanded to handle minimization on mobile
  const toggleExpanded = () => {
    // If closing the chat, reset dimensions to default and exit all modes
    if (isOpen) {
      // Close the chat on mobile instead of just minimizing it
      if (isMobile) {
        // Reset states
        setChatDimensions(defaultDimensions)
        setSidebarMode(false)
        document.body.classList.remove('with-chat-sidebar')
        setMinimizedOnMobile(false)
        setIsOpen(false)
        return
      }
      
      setChatDimensions(defaultDimensions)
      setSidebarMode(false)
      // Remove body class when closing
      document.body.classList.remove('with-chat-sidebar')
    } else {
      // When opening, auto switch to sidebar mode on mobile
      if (isMobile) {
        setSidebarMode(true)
        setMinimizedOnMobile(false)
        document.body.classList.add('with-chat-sidebar')
      } else if (sidebarMode) {
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
    // Only add welcome message if there are no messages and the chat is open
    if (isOpen && messages.length === 0) {
      // Set a single welcome message regardless of user status
      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          content: "👋 Hello! I'm NextGio AI, Giovanni's custom-trained AI assistant. Welcome to his portfolio website!"
        }
      ]);
    }
  }, [isOpen, messages.length])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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

  // Scroll to bottom when chat is opened or minimized state changes
  useEffect(() => {
    if (isOpen && !minimizedOnMobile) {
      // First immediate scroll
      scrollToBottom();
      
      // Then another scroll after a delay to ensure everything is rendered
      const timer1 = setTimeout(() => {
        scrollToBottom();
      }, 300);
      
      // One more scroll after a longer delay for safety
      const timer2 = setTimeout(() => {
        scrollToBottom();
      }, 600);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, minimizedOnMobile]);

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
    
    if (!id) {
      console.error('Invalid section ID: empty or undefined');
      return;
    }
    
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
        `#${actualSectionId}`,
        `[data-section="${actualSectionId}"]`,
        `section[data-id="${actualSectionId}"]`
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
        
        // Log all sections for debugging
        console.log(`Found ${sections.length} sections to check`);
        sections.forEach((section, index) => {
          console.log(`Section ${index}: id=${(section as HTMLElement).id}, className=${section.className}`);
        });
        
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
        
        // Also try using the element's scrollIntoView method as a backup
        setTimeout(() => {
          try {
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log('Used scrollIntoView as backup');
          } catch (scrollError) {
            console.error('ScrollIntoView failed:', scrollError);
          }
        }, 500);
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
    
    // Don't trigger contact form for job availability questions
    if (isJobAvailabilityQuestion(message)) {
      return false;
    }
    
    // Check for email addresses in the message - strong indicator of contact intent
    const containsEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message);
    
    // Strong contact intent phrases (these almost certainly indicate a desire to contact)
    const strongContactPhrases = [
      'i want to contact', 'i need to contact', 'i would like to contact',
      'can i contact', 'how do i contact', 'i want to get in touch',
      'i need to get in touch', 'i would like to get in touch',
      'can i get in touch', 'how do i get in touch', 'i want to reach out',
      'i need to reach out', 'i would like to reach out', 'can i reach out',
      'how do i reach out', 'i want to hire', 'i need to hire',
      'i would like to hire', 'can i hire', 'how do i hire',
      'send my info', 'send my contact', 'send my email',
      'contact form', 'contact info', 'contact information',
      'email him', 'email giovanni', 'call him', 'call giovanni'
    ];
    
    // Check for strong contact intent
    const hasStrongContactIntent = strongContactPhrases.some(phrase => 
      lowercaseMessage.includes(phrase)
    );
    
    // If there's an email or strong contact intent, it's definitely a contact request
    if (containsEmail || hasStrongContactIntent) {
      return true;
    }
    
    // Weaker contact keywords that might be mentioned in other contexts
    const contactKeywords = [
      'contact', 'hire', 'work with', 'get in touch', 'reach out',
      'email', 'phone', 'call', 'message', 'project', 'opportunity',
      'connect', 'talk to', 'speak with', 'meet', 'schedule', 'appointment',
      'consultation', 'quote', 'estimate', 'proposal', 'services'
    ];
    
    // Question patterns that indicate contact intent
    const contactQuestionPatterns = [
      'how can i', 'how do i', 'can i', 'is it possible', 
      'would it be possible', 'i want to', 'i would like to',
      'i need to', 'i\'d like to', 'i\'m interested in'
    ];
    
    // Check if the message contains both a contact keyword and a question pattern
    // This helps filter out casual mentions of contact-related words
    const hasContactKeyword = contactKeywords.some(keyword => 
      lowercaseMessage.includes(keyword)
    );
    
    const hasQuestionPattern = contactQuestionPatterns.some(pattern => 
      lowercaseMessage.includes(pattern)
    );
    
    // If the message has both a contact keyword and a question pattern,
    // it's likely a genuine contact request
    if (hasContactKeyword && hasQuestionPattern) {
      return true;
    }
    
    // Special case for very direct messages
    if (lowercaseMessage === 'contact' || 
        lowercaseMessage === 'contact giovanni' || 
        lowercaseMessage === 'i want to contact giovanni') {
      return true;
    }
    
    // For other cases, require at least 2 contact keywords to reduce false positives
    let contactKeywordCount = 0;
    for (const keyword of contactKeywords) {
      if (lowercaseMessage.includes(keyword)) {
        contactKeywordCount++;
        if (contactKeywordCount >= 2) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Function to check if message is asking about Giovanni's job availability
  const isJobAvailabilityQuestion = (message: string) => {
    const lowercaseMessage = message.toLowerCase().trim();
    
    const jobKeywords = [
      'job', 'jobs', 'hiring', 'available for work', 'looking for work',
      'open to work', 'employment', 'open for jobs', 'new job', 'new position',
      'job hunting', 'job search', 'seeking employment', 'job opportunity',
      'job opportunities', 'available for hire', 'available for jobs'
    ];
    
    return jobKeywords.some(keyword => lowercaseMessage.includes(keyword));
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
    
    // Enhanced exit detection - check if user wants to exit the contact form flow
    // or if they're talking about something completely different
    const exitKeywords = [
      'cancel', 'exit', 'stop', 'quit', 'no thanks', 'nevermind', 'never mind', 
      'no', 'don\'t want to', 'i don\'t want', 'not interested', 'not now',
      'maybe later', 'some other time', 'changed my mind', 'forget it',
      'don\'t send', 'don\'t email', 'don\'t contact', 'i don\'t want to send an email',
      'i don\'t want to contact', 'i don\'t need to contact', 'i don\'t need to get in touch',
      'don\'t want', 'not now', 'skip', 'pass', 'i\'ll pass', 'let\'s skip', 'move on',
      'don\'t need', 'not necessary', 'not needed', 'not required', 'not important',
      'don\'t worry', 'forget about it', 'let\'s forget', 'let\'s not', 'i\'d rather not'
    ];
    
    // Check if the message is completely off-topic from contact form
    const isOffTopic = () => {
      // If the message is very short, it's likely not a proper response to form questions
      if (message.length < 5 && !message.includes('@')) return true;
      
      // Check for common conversation starters that indicate topic change
      const topicChangeIndicators = [
        'tell me about', 'what is', 'how do', 'can you', 'i want to know',
        'question', 'different topic', 'instead', 'actually', 'by the way',
        'speaking of', 'on another note', 'changing subjects', 'moving on',
        'let\'s talk about', 'what about', 'tell me more about', 'explain',
        'portfolio', 'projects', 'experience', 'skills', 'background', 'education',
        'something else', 'different', 'difftand', 'disregard', 'disgard',
        'talk about', 'change subject', 'not interested', 'something completely',
        'another topic', 'other topic', 'other subject', 'something different',
        'who is', 'who are', 'what are', 'where is', 'when is', 'why is',
        'how is', 'do you', 'could you', 'would you', 'should you'
      ];
      
      // If in email step, but message doesn't look like an email and contains topic changers
      if (contactFormStep === 1 && !message.includes('@')) {
        // Check if the message is a question (contains question words or question mark)
        const isQuestion = lowercaseMessage.includes('?') || 
                          lowercaseMessage.includes('who') || 
                          lowercaseMessage.includes('what') || 
                          lowercaseMessage.includes('how') || 
                          lowercaseMessage.includes('when') || 
                          lowercaseMessage.includes('where') || 
                          lowercaseMessage.includes('why');
                          
        // If it's a question, treat it as off-topic
        if (isQuestion) return true;
        
        return topicChangeIndicators.some(indicator => lowercaseMessage.includes(indicator)) || 
               exitKeywords.some(keyword => lowercaseMessage.includes(keyword));
      }
      
      // If in service or message step, but message is asking a question or changing topic
      if ((contactFormStep === 2 || contactFormStep === 3) && 
          (lowercaseMessage.includes('?') || 
           topicChangeIndicators.some(indicator => lowercaseMessage.includes(indicator)) ||
           exitKeywords.some(keyword => lowercaseMessage.includes(keyword)))) {
        return true;
      }
      
      // Check for explicit mentions of wanting to talk about something else
      if (lowercaseMessage.includes('something else') || 
          lowercaseMessage.includes('different topic') ||
          lowercaseMessage.includes('talk about') ||
          lowercaseMessage.includes('disregard') ||
          lowercaseMessage.includes('disgard') ||
          lowercaseMessage.includes('difftand') ||
          lowercaseMessage.includes('something completely')) {
        return true;
      }
      
      return false;
    };
    
    // Exit if explicit exit keywords or detected off-topic conversation
    if (exitKeywords.some(keyword => lowercaseMessage.includes(keyword)) || isOffTopic()) {
      // Reset contact form
      setContactFormStep(0);
      setContactFormData({
        email: '',
        service: '',
        message: ''
      });
      
      // Check if the message is a question
      const isQuestion = lowercaseMessage.includes('?') || 
                         lowercaseMessage.includes('who') || 
                         lowercaseMessage.includes('what') || 
                         lowercaseMessage.includes('how') || 
                         lowercaseMessage.includes('when') || 
                         lowercaseMessage.includes('where') || 
                         lowercaseMessage.includes('why');
      
      if (isQuestion) {
        // Process the question through the API
        // Add typing indicator
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
      role: 'assistant', 
      content: '', 
      isTyping: true 
    }]);
    
        // Process the message through the API
        (async () => {
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: message,
                userInfo: userInfo
              }),
            });
            
            if (!response.ok) {
              throw new Error('Failed to send message');
            }
            
            const data = await response.json();
            
            // Remove typing indicator
            setMessages(prev => prev.filter(msg => !msg.isTyping));
            
            // Clean the content to remove any remaining scroll tags
            const cleanedContent = data.content.replace(/\[SCROLL_TO:[a-z]+\]/g, '').trim();
            
            // Add the response to the chat
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: cleanedContent
            }]);
            
            // If there's a scroll tag, scroll to that section
            if (data.scrollTag) {
              const sectionId = data.scrollTag.match(/\[SCROLL_TO:([a-z]+)\]/)?.[1];
              if (sectionId) {
                scrollToSection(sectionId);
              }
            }
            
            // Scroll to bottom
            scrollToBottom();
          } catch (error) {
            console.error('Error processing question:', error);
            
            // Remove typing indicator
            setMessages(prev => prev.filter(msg => !msg.isTyping));
            
            // Add error message
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: "I'm having trouble processing your question right now. Let's try something else."
            }]);
            
            // Scroll to bottom
            scrollToBottom();
          }
        })();
        
        return;
      }
      
      // Send a response acknowledging the change of topic
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "No problem at all! I'm happy to talk about something else. Would you like to know about Giovanni's work experience, tech skills, projects, or certifications? Feel free to ask about any aspect of his professional background.",
        id: Date.now().toString()
      }]);
      
      setTimeout(scrollToBottom, 100);
      return;
    }
    
    // Process based on current step
    switch (contactFormStep) {
      case 1: // Email step
        // Check if message contains an email
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const emailMatch = message.match(emailRegex);
        
        if (emailMatch) {
          const email = emailMatch[0];
          
          // Save email
          setContactFormData(prev => ({
            ...prev,
            email: email
          }));
          
          // Move to service step
          setContactFormStep(2);
          
          // Send response
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Thanks for your email (${email}). What service are you interested in? (Web Development, Mobile App, Consulting, etc.)`,
            id: Date.now().toString()
          }]);
        } else {
          // Invalid email
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "I didn't recognize a valid email address. Please provide a valid email so Giovanni can contact you, or type 'cancel' if you'd like to talk about something else.",
            id: Date.now().toString()
          }]);
        }
        break;
        
      case 2: // Service step
        // Save service
        setContactFormData(prev => ({
          ...prev,
          service: message
        }));
        
        // Move to message step
        setContactFormStep(3);
        
        // Send response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Great! Finally, please provide a brief message about your project or inquiry.",
          id: Date.now().toString()
        }]);
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
    
    setTimeout(scrollToBottom, 100);
  };

  // Update handleSubmit to handle contact requests
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      id: Date.now().toString(),
      isTyping: false
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    // Check if this is a contact request when not already in contact form flow
    if (contactFormStep === 0 && isContactRequest(input)) {
      console.log("Contact request detected:", input);
      
      // Add assistant response about contact form
      setMessages((prev) => [
        ...prev.filter(msg => !msg.isTyping),
        {
          role: 'assistant', 
          content: "I'd be happy to help you get in touch with Giovanni. Could you please provide your email address so he can contact you?",
          id: Date.now().toString(),
          isTyping: false
        }
      ]);
      
      // Start contact form flow
      setContactFormStep(1);
      
      // Scroll to contact section
        setTimeout(() => {
        console.log("Scrolling to contact section for contact request");
        scrollToSection('contact');
      }, 500);
      
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
      return;
    }
    
    // Process contact form input if already in contact form flow
    if (contactFormStep > 0) {
      handleContactFormInput(input);
      return;
    }
    
    // Show typing indicator
    const typingIndicator: ChatMessage = {
      role: 'assistant',
      content: '',
      id: (Date.now() + 1).toString(),
      isTyping: true
    };
    
    setMessages((prev) => [...prev, typingIndicator]);
    
    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          userInfo: contactFormStep > 0 && userInfo.name ? userInfo : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Remove typing indicator
      setMessages((prev) => prev.filter(msg => !msg.isTyping));
      
      // Handle scroll tag if present
      if (data.scrollTag) {
        const sectionMatch = data.scrollTag.match(/\[SCROLL_TO:([a-z]+)\]/);
        if (sectionMatch && sectionMatch[1]) {
          const section = sectionMatch[1];
          console.log(`Found scroll tag in handleSubmit: ${data.scrollTag}, section: ${section}`);
          
          // Scroll to the section after a short delay to ensure the DOM is updated
      setTimeout(() => {
            console.log(`Executing scrollToSection for: ${section}`);
            scrollToSection(section);
          }, 1000);
        }
      }
      
      // Add assistant's response to chat with required properties
      // Only add the response if it's not a quick response that might be duplicated
      if (!data.isQuickResponse || (data.isQuickResponse && !messages.some(msg => 
        msg.role === 'assistant' && msg.content === data.content
      ))) {
        // Clean the content to remove any remaining scroll tags
        const cleanedContent = data.content.replace(/\[SCROLL_TO:[a-z]+\]/g, '').trim();
        
        setMessages((prev) => [
          ...prev,
          { 
            role: 'assistant',
            content: cleanedContent,
            id: Date.now().toString(),
            isTyping: false
          },
        ]);
      }
      
      // Scroll to bottom of chat
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator
      setMessages((prev) => prev.filter(msg => !msg.isTyping));
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          id: Date.now().toString(),
          isTyping: false
        },
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
    // Use a more reliable approach with multiple attempts
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      // Immediate scroll attempt
      container.scrollTop = container.scrollHeight;
      
      // Follow-up attempts with increasing delays to ensure scrolling works
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
      
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 150);
    }
    
    // Also try the scrollIntoView approach as backup
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
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

  // Add minimized chat styles
  <style jsx global>{`
    @media (max-width: 768px) {
      // ... existing mobile styles ...
      
      /* Minimized chat on mobile */
      .minimized-mobile-chat {
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2) !important;
      }
      
      .minimized-header {
        border-radius: 12px 12px 0 0 !important;
        border-bottom: 1px solid rgba(127, 127, 127, 0.1);
        padding-top: 12px !important;
      }
      
      /* Show only header when minimized */
      .minimized-mobile-chat .chat-scrollbar,
      .minimized-mobile-chat form {
        display: none !important;
      }
      
      /* When the chat is minimized, allow body scrolling again */
      body.with-chat-sidebar.allow-scroll {
        overflow: auto !important;
        position: static !important;
      }
      
      /* Keyboard visible class */
      .keyboard-visible {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 2100 !important;
        transition: bottom 0.2s ease-out;
        background-color: var(--chat-bg-color, rgba(255, 255, 255, 0.95)) !important;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15) !important;
        padding-bottom: calc(10px + env(safe-area-inset-bottom)) !important;
        margin: 0 !important;
      }
    }
  `}</style>
  
  // Add effect to handle body overflow when chat is minimized on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      if (minimizedOnMobile) {
        document.body.classList.add('allow-scroll');
      } else {
        document.body.classList.remove('allow-scroll');
      }
    }
  }, [minimizedOnMobile, isMobile, isOpen]);

  // Scroll to bottom when chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen]);

  return (
    <div className="chat-box-container prevent-scroll-propagation">
      {/* Set CSS variables for dynamic styling */}
      <style jsx global>{`
        :root {
          --chat-bg-color: rgba(255, 255, 255, 0.95);
        }
        
        .dark {
          --chat-bg-color: rgb(0, 0, 0);
        }
      `}</style>
      
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
            overflow: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
          }
          
          body.with-chat-sidebar .fixed.top-0.left-0.right-0.z-\[100\] {
            padding-right: 0;
          }
          
          /* Mobile chat styles */
          .mobile-chat-box {
            border-radius: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100% !important;
            max-height: 100% !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 2000 !important;
            margin: 0 !important;
            transform: none !important;
            background-color: var(--chat-bg-color, rgba(255, 255, 255, 0.95)) !important;
          }
          
          /* Adjust keyboard handling */
          .keyboard-visible {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 2100 !important;
            transition: bottom 0.2s ease-out;
            background-color: var(--chat-bg-color, rgba(255, 255, 255, 0.95)) !important;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15) !important;
            padding-bottom: calc(10px + env(safe-area-inset-bottom)) !important;
            margin: 0 !important;
          }
          
          /* Hide the chat button when in mobile view */
          body.with-chat-sidebar .chat-button-hidden {
            display: none !important;
          }
          
          /* Ensure message container takes proper space */
          .mobile-chat-box .chat-scrollbar {
            flex: 1 1 auto !important;
            min-height: 0 !important;
          }
          
          /* Improved textarea on mobile */
          .mobile-textarea {
            font-size: 16px !important; /* Prevent iOS zoom */
            padding: 12px !important;
            margin-bottom: 0 !important;
            line-height: 1.3 !important;
          }
          
          /* Fix chat input container positioning */
          .mobile-chat-box form {
            padding: 8px !important;
            border-top: 1px solid rgba(127, 127, 127, 0.1);
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            position: sticky !important;
            bottom: 0 !important;
            background-color: var(--chat-bg-color, rgba(255, 255, 255, 0.95)) !important;
          }
          
          /* When keyboard is visible, ensure content remains accessible */
          .keyboard-visible textarea {
            max-height: 60px !important;
          }
          
          /* Ensure the chat remains fixed on mobile */
          .mobile-chat-box.sidebar-mode-active {
            position: fixed !important;
            width: 100vw !important;
            height: 100vh !important;
            transform: none !important;
            transition: none !important;
            top: 0 !important;
            left: 0 !important;
            margin: 0 !important;
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
          (isOpen && isMobile) && "chat-button-hidden",
          isOpen 
            ? "translate-y-20 opacity-0 pointer-events-none" 
            : "translate-y-0 opacity-100 pointer-events-auto",
          isDark 
            ? "bg-white text-black hover:bg-gray-200" 
            : "bg-black text-white hover:bg-gray-900",
          hasNewMessages && "animate-bounce"
        )}
        aria-label="Open chat"
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
              "fixed z-50 prevent-scroll-propagation",
              isMobile
                ? "top-0 left-0 right-0 bottom-0 w-full h-full"
                : sidebarMode 
                  ? "top-0 bottom-0 right-0 h-full" 
                  : "bottom-20 right-4"
            )}
            style={{
              zIndex: isMobile || sidebarMode ? 1100 : 50,
              pointerEvents: "auto"
            }}
            onWheel={(e) => {
              // Prevent the wheel event from propagating to the parent elements
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              // For touch devices
              e.stopPropagation();
            }}
          >
            <div 
              className="chat-container-wrapper"
              onWheel={(e) => {
                // Prevent the wheel event from propagating to the parent elements
                e.stopPropagation();
              }}
              onTouchMove={(e) => {
                // For touch devices
                e.stopPropagation();
              }}
          >
            <ResizableBox
                width={isMobile ? window.innerWidth : chatDimensions.width}
                height={isMobile ? viewportHeight : (sidebarMode ? window.innerHeight : chatDimensions.height)}
                minConstraints={isMobile ? [window.innerWidth, 400] : [300, 400]}
                maxConstraints={
                  isMobile 
                    ? [window.innerWidth, viewportHeight]
                    : (sidebarMode 
                      ? [350, window.innerHeight] 
                      : [600, 800])
                }
                resizeHandles={isMobile || sidebarMode ? [] : ['nw']}
              onResize={handleResize}
              className={cn(
                  "flex flex-col overflow-hidden relative futuristic-border prevent-scroll-propagation",
                  sidebarMode && "sidebar-mode sidebar-mode-active",
                  isMobile && "mobile-chat-box",
                  minimizedOnMobile && "minimized-mobile-chat",
                isDark 
                    ? sidebarMode 
                      ? "bg-black border border-gray-800" // Pure black for sidebar mode (dark)
                      : "bg-gray-900/90 border border-gray-800 backdrop-blur-md" // Keep semi-transparent for normal mode (dark)
                    : sidebarMode
                      ? "bg-white border border-black/10" // Pure white for sidebar mode (light)
                      : "bg-white/60 border border-black/10 backdrop-blur-md", // Keep semi-transparent for normal mode (light)
                  !sidebarMode && !isMobile && "rounded-xl"
                )}
                style={isMobile ? {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: minimizedOnMobile ? 'calc(100% - 60px)' : 0,
                  width: '100%',
                  height: minimizedOnMobile ? 'auto' : '100%',
                  zIndex: 1200,
                  borderRadius: 0,
                  transition: 'all 0.3s ease-in-out',
                  margin: 0,
                  transform: 'none',
                  display: 'flex',
                  flexDirection: 'column'
                } : {}}
              >
                {/* Neural network background pattern */}
                {!sidebarMode && <div className="absolute inset-0 neural-bg opacity-10 pointer-events-none" />}
                
              {/* Chat header */}
                <div className={cn(
                  "flex items-center justify-between px-4 py-3 relative z-20",
                  sidebarMode || isMobile
                    ? isDark 
                      ? "bg-black text-white" 
                      : "bg-white"
                    : isDark 
                      ? "bg-gray-900/90" 
                      : "bg-white/50",
                  minimizedOnMobile && "minimized-header"
                )}>
                  {isMobile && minimizedOnMobile && (
                    <div 
                      className="absolute top-0 left-0 right-0 flex justify-center p-1 cursor-pointer"
                      onClick={() => setMinimizedOnMobile(false)}
                    >
                      <div className="w-12 h-1 bg-gray-500 rounded-full opacity-50"></div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl ai-pulse",
                        isDark 
                          ? "bg-primary text-white" 
                          : "bg-black text-white"
                      )}>
                        <Image 
                          src="/GV Fav.png" 
                          alt="GV" 
                          width={24} 
                          height={24} 
                          className="rounded-full"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-semibold text-base",
                        isDark ? "text-white" : "text-black"
                      )}>Giovanni's Personal AI Assistant</h3>
                      <div className="flex items-center text-xs">
                        <span className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
                          "bg-green-500"
                        )}></span>
                        <span className={cn(
                          isDark ? "text-gray-300" : "text-gray-600"
                        )}>Online</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {/* Sidebar mode toggle */}
                    {!isMobile && (
                  <button
                        onClick={toggleSidebarMode}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isDark 
                            ? "hover:bg-gray-800 text-gray-300" 
                            : "hover:bg-black/10 text-gray-600"
                        )}
                        aria-label="Toggle sidebar mode"
                      >
                        {sidebarMode ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                      </button>
                    )}
                    
                    {/* End chat button */}
                    <button
                      onClick={handleEndChat}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isDark 
                          ? "hover:bg-gray-800 text-gray-300" 
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
                          ? "hover:bg-gray-800 text-gray-300" 
                          : "hover:bg-black/10 text-gray-600",
                      isMobile && "p-2.5" // Larger touch target on mobile
                    )}
                    aria-label="Close chat"
                  >
                    <X className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
                  </button>
                </div>
              </div>
              
              {/* Chat messages */}
                <div 
                  ref={messagesContainerRef}
                  className={cn(
                    "flex-1 overflow-y-auto p-4 space-y-4 relative z-10 chat-scrollbar prevent-scroll-propagation",
                    "flex flex-col",
                    isMobile ? "justify-end" : "justify-start",
                    isDark ? "scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20" : "scrollbar-thumb-black/10 hover:scrollbar-thumb-black/20"
                  )}
                  style={{ 
                    background: isDark 
                      ? sidebarMode
                        ? 'rgb(0, 0, 0)' // Pure black for sidebar mode (dark)
                        : 'rgba(18, 18, 18, 0.7)' // Keep semi-transparent for normal mode (dark)
                      : sidebarMode
                        ? 'rgb(255, 255, 255)' // Pure white for sidebar mode (light)
                        : 'transparent', // Keep transparent for normal mode (light)
                    height: isMobile ? 'calc(100vh - 180px)' : 'calc(100% - 150px)', // Increase space for input area
                    maxHeight: '100%',
                    overflowY: 'auto',
                    paddingBottom: '0px',
                    flexGrow: 1,
                    flexShrink: 1,
                    position: 'relative',
                    minHeight: isMobile ? 'auto' : '300px'
                  }}
                  onWheel={(e) => {
                    // Prevent the wheel event from propagating to the parent elements
                    e.stopPropagation();
                  }}
                  onTouchMove={(e) => {
                    // For touch devices
                    e.stopPropagation();
                  }}
                >
                  {/* This div pushes content to the bottom on mobile only */}
                  {isMobile && <div className="flex-1"></div>}
                  <div className="space-y-4 pb-20"> {/* Increase bottom padding to ensure no overlap */}
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
                              ? "bg-gray-900 text-white" 
                              : "bg-black text-white"
                          )}>
                            <Image 
                              src="/GV Fav.png" 
                              alt="GV" 
                              width={20} 
                              height={20} 
                              className="rounded-full"
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
                                ? "bg-gray-900/80 border border-gray-800 text-white" 
                                : "bg-black/10 border border-black/5 text-black"
                              : isDark
                                ? "bg-gray-800 border border-gray-700 text-white" 
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
                
                    {/* Scroll to bottom button */}
                    {showScrollButton && (
                      <Button
                        onClick={scrollToBottom}
                        variant="outline"
                        size="sm"
                        className="fixed bottom-24 right-4 h-10 w-10 rounded-full opacity-90 shadow-md z-20 bg-white dark:bg-gray-800"
                        aria-label="Scroll to bottom"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    )}
                    
                    {/* Added proper spacing to ensure messages aren't cut off */}
                    <div ref={messagesEndRef} className="h-20 w-full" />
                    </div>
                  </div>
                
                {/* User info form */}
                {shouldShowUserForm ? (
                  <form 
                    onSubmit={handleUserInfoSubmit}
                    className={cn(
                      "p-6 relative z-20 glass-effect",
                      sidebarMode || isMobile
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
                              "form-input w-full px-4 py-3 rounded-lg transition-all text-base",
                              isDark 
                                ? "bg-black/30 text-white border-white/20 focus:border-white/40" 
                                : "bg-white/70 text-black border-black/10 focus:border-black/30"
                            )}
                            style={{ fontSize: '16px' }}
                            disabled={isSubmittingInfo}
                          />
                          {validationErrors.name && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
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
                              "form-input w-full px-4 py-3 rounded-lg transition-all text-base",
                              isDark 
                                ? "bg-black/30 text-white border-white/20 focus:border-white/40" 
                                : "bg-white/70 text-black border-black/10 focus:border-black/30"
                            )}
                            style={{ fontSize: '16px' }}
                            disabled={isSubmittingInfo}
                          />
                          {validationErrors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
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
                      "relative z-20",
                      keyboardOpen && "keyboard-visible"
                    )}
                    style={{
                      position: 'absolute', // Change from fixed to absolute
                      bottom: 0,
                      left: sidebarMode && !isMobile ? 'auto' : 0,
                      right: 0,
                      width: sidebarMode && !isMobile ? chatDimensions.width : '100%',
                      padding: '8px 8px 10px 8px',
                      borderTop: isDark ? '1px solid rgba(75, 75, 75, 0.3)' : '1px solid rgba(127, 127, 127, 0.1)',
                      backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'rgba(255, 255, 255, 0.95)',
                      zIndex: 100,
                      boxShadow: isDark ? '0 -2px 10px rgba(0, 0, 0, 0.2)' : '0 -2px 10px rgba(0, 0, 0, 0.05)',
                      paddingBottom: 'calc(8px + env(safe-area-inset-bottom))'
                    }}
                  >
                    <div className={cn(
                      "flex items-center space-x-2 rounded-xl p-1.5 relative z-20",
                      isDark 
                        ? "bg-black border border-gray-700" 
                        : "bg-white/80 border border-black/5"
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
                          ? "bg-transparent border-none focus:ring-0 placeholder-gray-400 text-white" 
                          : "bg-transparent border-none focus:ring-0 placeholder-gray-500 text-black",
                        "focus:outline-none",
                        isMobile && "mobile-textarea"
                      )}
                      style={{ 
                        height: textareaHeight, 
                        maxHeight: isMobile ? '80px' : '200px',
                        paddingRight: '40px',
                        fontSize: '16px'
                      }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={cn(
                          "p-2.5 rounded-xl transition-all shadow-sm hover:shadow",
                      isDark 
                            ? "bg-gray-900 hover:bg-gray-800 text-white" 
                            : "bg-black hover:bg-black/90 text-white",
                      (isLoading || !input.trim()) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                        <Send className="h-4 w-4" />
                  </button>
                  </div>
                    
                    {/* AI capabilities hint */}
                    <div className="mt-2 mb-2 flex justify-center">
                      <div className="text-xs flex items-center space-x-4">
                        <span className={cn(
                          "flex items-center",
                          isDark ? "text-gray-300" : "text-gray-600"
                        )}>
                          <span className={cn(
                            "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
                            isDark ? "bg-gray-300" : "bg-black/70"
                          )}></span>
                          Ask about projects
                        </span>
                        <span className={cn(
                          "flex items-center",
                          isDark ? "text-gray-300" : "text-gray-600"
                        )}>
                          <span className={cn(
                            "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
                            isDark ? "bg-gray-300" : "bg-black/70"
                          )}></span>
                          Explore skills
                        </span>
                      </div>
                </div>
              </form>
                )}
            </ResizableBox>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

