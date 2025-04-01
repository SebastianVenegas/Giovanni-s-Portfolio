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
import TextareaAutosize from "react-textarea-autosize"
import "@/styles/chat.css"

// Define the ChatMessage interface
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  isTyping?: boolean;
  name?: string;
  isWelcome?: boolean;
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
  "home": ["overview", "intro", "introduction", "summary", "home", "homepage", "main", "landing", "welcome", "start", "beginning", "front page"],
  "about": ["about", "bio", "biography", "background", "who is", "who am i", "personal", "profile", "history", "information", "description", "journey", "story", "introduction", "myself", "who is giovanni", "about giovanni", "background info"],
  "experience": ["experience", "work", "job", "career", "professional", "employment", "history", "resume", "cv", "curriculum vitae", "work history", "professional experience", "job history", "past roles", "positions", "occupations", "employment history", "career path"],
  "projects": ["projects", "portfolio", "work", "creations", "showcase", "apps", "applications", "software", "websites", "platforms", "developments", "products", "solutions", "case studies", "examples", "project portfolio", "creations", "works", "implementations"],
  "certifications": ["certifications", "certificates", "qualifications", "credentials", "achievements", "education", "degrees", "diplomas", "awards", "recognitions", "accreditations", "training", "skills", "licenses", "professional development", "knowledge"],
  "contact": ["contact", "email", "reach out", "message", "get in touch", "hire", "connect", "talk", "communicate", "phone", "call", "chat", "meet", "appointment", "consultation", "inquire", "inquiry", "request", "availability", "schedule", "booking", "engagement", "services", "opportunity", "project request", "collaboration", "let's talk", "let's connect", "send message", "contact me", "contact giovanni", "reach giovanni", "mail", "send email", "contact info", "contact information", "phone number", "telephone", "text", "sms", "whatsapp", "messenger", "dm", "direct message", "get in contact", "drop a line", "touch base", "connect with", "send a message", "send an email", "lets talk", "lets connect", "lets chat", "email giovanni", "message giovanni", "call giovanni"],
  "blog": ["blog", "articles", "posts", "writings", "thoughts", "insights", "opinions", "publications", "content", "reads", "essays", "journals", "updates", "news", "stories"],
  "skills": ["skills", "abilities", "expertise", "proficiencies", "competencies", "talents", "strengths", "capabilities", "knowledge", "know-how", "aptitudes", "specialties", "technical skills", "soft skills", "hard skills", "programming skills", "development skills"],
  "education": ["education", "school", "university", "college", "degree", "academic", "studies", "learning", "courses", "bootcamp", "training", "educational background", "academic history", "schooling", "academic achievements"],
  "testimonials": ["testimonials", "reviews", "feedback", "recommendations", "endorsements", "references", "praise", "comments", "opinions", "client feedback", "customer reviews", "what others say", "testimonies"]
}

// Function to detect section from message
const detectSection = (message: string): string | null => {
  const lowercaseMessage = message.toLowerCase();
  
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
      return section;
    }
  }
  
  return null;
};

// Add this helper function at the top of the file, after the imports
// Generate a unique ID with timestamp and random string to avoid collisions
const generateUniqueId = (prefix: string = ''): string => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export function ModernChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
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
  const [sidebarDimensions, setSidebarDimensions] = useState({ width: 320, height: 600 })
  
  // Update sidebar dimensions when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSidebarDimensions({ width: 320, height: window.innerHeight })
    }
  }, [])
  
  // Add state for chat window dimensions
  const [chatDimensions, setChatDimensions] = useState(defaultDimensions)
  
  // Add user info state
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    phoneNumber: '',
    submitted: false,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  })
  
  // Add state to control when to show the user form - true by default
  const [shouldShowUserForm, setShouldShowUserForm] = useState(true)
  
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
  
  // Add state variable for contact form mode
  const [isInContactForm, setIsInContactForm] = useState(false);
  
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

  // Load user info from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUserInfo = localStorage.getItem('chatUserInfo');
      if (savedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(savedUserInfo);
          // Only set as submitted if we have both name and phone number
          const isComplete = parsedUserInfo.name && parsedUserInfo.phoneNumber;
          setUserInfo({
            ...parsedUserInfo,
            submitted: isComplete,
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          });
          setShouldShowUserForm(!isComplete);
        } catch (error) {
          console.error('Error parsing saved user info:', error);
          setShouldShowUserForm(true);
        }
      } else {
        // No saved user info, show the form
        setShouldShowUserForm(true);
        // Add initial greeting message
        if (messages.length === 0) {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "👋 Hi! I'm NextGio, your AI assistant. To get started, I'll need your name and contact information.",
            created_at: new Date().toISOString(),
            isWelcome: true
          }]);
        }
      }
    }
  }, []);

  // Add default greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "👋 Hi! I'm NextGio, your AI assistant. To get started, I'll need your name and contact information.",
        created_at: new Date().toISOString(),
        isWelcome: true
      }]);
      // Ensure form is shown
      setShouldShowUserForm(true);
    }
  }, [isOpen]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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
    // TextareaAutosize handles resizing automatically now
    // This function is kept for backward compatibility
    // Just updating the state for components that might use it
    if (inputRef.current) {
      setTextareaHeight(inputRef.current.scrollHeight);
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

  // Add a custom smooth scroll function
  const smoothScrollTo = (targetPosition: number, duration = 1000, element?: HTMLElement) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;
    
    // Easing function for natural motion
    const easeInOutCubic = (t: number) => 
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    
    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * easedProgress);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else if (element) {
        // Add subtle highlight effect when scrolling completes
        addHighlightEffect(element);
      }
    }
    
    requestAnimationFrame(animation);
  };
  
  // Add a subtle highlight effect to draw attention to the section
  const addHighlightEffect = (element: HTMLElement) => {
    // Create and add a temporary outline
    const originalOutline = element.style.outline;
    const originalTransition = element.style.transition;
    
    // Add a subtle pulse animation
    element.style.transition = 'outline 0.5s ease-in-out';
    element.style.outline = '2px solid rgba(59, 130, 246, 0.5)'; // Light blue outline
    
    // Remove the outline after a delay
    setTimeout(() => {
      element.style.outline = 'none';
      
      // Restore original styles after animation completes
      setTimeout(() => {
        element.style.outline = originalOutline;
        element.style.transition = originalTransition;
      }, 500);
    }, 1000);
  };

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
    
    // Special handling for contact section
    if (actualSectionId === 'contact') {
      console.log('🔍 Special handling for contact section');
      
      // Try multiple ways to find the contact section
      const contactSelectors = [
        'section#contact',
        'section[id="contact"]',
        'div#contact',
        '#contact',
        'section.contact',
        'div.contact',
        'section[data-section="contact"]',
        'section:has(h2:contains("Get in Touch"))',
        'section:has(h2:contains("Contact"))',
        'section:has(div:contains("Let\'s Connect"))'
      ];
      
      for (const selector of contactSelectors) {
        try {
          console.log(`🔍 Trying selector: ${selector}`);
          const element = document.querySelector(selector);
          if (element) {
            console.log(`✅ Found contact section with selector: ${selector}`);
            
            // Use custom smooth scrolling for contact section
            try {
              const rect = element.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const targetPosition = scrollTop + rect.top - 80; // 80px offset for headers
              
              // Use a longer duration for smoother scrolling (1200ms)
              smoothScrollTo(targetPosition, 1200, element as HTMLElement);
              
              return;
            } catch (scrollError) {
              console.error('Error during contact scroll:', scrollError);
            }
          }
        } catch (selectorError) {
          console.error(`Error with selector ${selector}:`, selectorError);
        }
      }
      
      // Final fallback: just set the hash and scroll
      console.log('⚠️ Final fallback for contact section');
      window.location.hash = '#contact';
      
      // Also try scrolling to bottom of page as an absolute last resort
      setTimeout(() => {
        const bodyHeight = document.body.scrollHeight;
        smoothScrollTo(bodyHeight - window.innerHeight, 1200, document.body);
        console.log('⚠️ Last resort: scrolling to page bottom');
      }, 500);
      
      return;
    }
    
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
          
          // Use custom smooth scrolling with easing (1200ms duration)
          smoothScrollTo(targetPosition, 1200, section as HTMLElement);
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
        id: generateUniqueId('msg_'),
        created_at: new Date().toISOString()
      }]);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactFormData.email)) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "That email address doesn't look valid. Could you please provide a valid email?",
        id: generateUniqueId('msg_'),
        created_at: new Date().toISOString()
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
        message: contactFormData.message || 'Contact request submitted via chat',
        skipChatLogStorage: true // Add flag to prevent chat log storage
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
        id: generateUniqueId('msg_'),
        created_at: new Date().toISOString()
      }]);
        
      } catch (error) {
      console.error('Error submitting contact form:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble sending your contact information. Please try again or use the contact form at the bottom of the page.",
        id: generateUniqueId('assistant_'),
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsSubmittingInfo(false);
    }
  }

  // Handle contact form input through chat
  const handleContactFormInput = (message: string) => {
    // Add user message to the list
    setMessages(prev => [...prev, {
      id: generateUniqueId('user_'),
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    }]);
    
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
          id: generateUniqueId('typing_'),
      role: 'assistant', 
      content: '', 
      created_at: new Date().toISOString(),
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
              id: generateUniqueId('assistant_'),
              role: 'assistant',
              content: cleanedContent,
              created_at: new Date().toISOString()
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
              id: generateUniqueId('assistant_'),
              role: 'assistant',
              content: "I'm having trouble processing your question right now. Let's try something else.",
              created_at: new Date().toISOString()
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
        id: generateUniqueId('assistant_'),
        created_at: new Date().toISOString()
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
            id: generateUniqueId('assistant_'),
            created_at: new Date().toISOString()
          }]);
        } else {
          // Invalid email
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "I didn't recognize a valid email address. Please provide a valid email so Giovanni can contact you, or type 'cancel' if you'd like to talk about something else.",
            id: generateUniqueId('assistant_'),
            created_at: new Date().toISOString()
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
          id: generateUniqueId('assistant_'),
          created_at: new Date().toISOString()
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

  // Handle submit for regular chat messages
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
    e.preventDefault();
    }
    
    if (!input.trim() || isLoading) {
      return;
    }
    
    // Setup for API call
    const userMessage = input.trim();
    setInput('');
    
    // Special handling for direct scroll requests
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Check for explicit scroll requests like "scroll to experience" or "go to contact"
    const scrollRequestRegex = /(?:scroll|go|navigate|take me|show me|see|view|jump|head|move)(?:\s+(?:to|the|me to|me the))?\s+(?:the\s+)?([a-z]+)(?:\s+section)?/i;
    const scrollMatch = lowercaseMessage.match(scrollRequestRegex);
    
    if (scrollMatch) {
      const targetSection = scrollMatch[1].toLowerCase();
      
      // Add the user's message to the chat
      setMessages(prev => [...prev, { 
        id: generateUniqueId('user_'),
      role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      }]);
      
      // Map common section references to actual section IDs
      const sectionMap: Record<string, string> = {
        'home': 'home',
        'about': 'about',
        'experience': 'experience',
        'work': 'experience',
        'career': 'experience',
        'jobs': 'experience',
        'projects': 'projects',
        'portfolio': 'projects',
        'apps': 'projects',
        'applications': 'projects',
        'certifications': 'certifications',
        'certificates': 'certifications',
        'skills': 'certifications',
        'contact': 'contact',
        'email': 'contact',
        'message': 'contact',
        'touch': 'contact',
        'hire': 'contact'
      };
      
      const sectionId = sectionMap[targetSection] || detectSection(userMessage);
      
      if (sectionId) {
        // Scroll to the specified section
        scrollToSection(sectionId);
        
        // Add typing indicator
        const typingIndicatorId = generateUniqueId('typing_');
        setMessages(prev => [...prev, {
          id: typingIndicatorId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      isTyping: true
        }]);
        
        setIsLoading(true);
        
        // Instead of just confirming navigation, get a response from the API
        // that provides information about the section
        try {
          // Process the message through the API
          const enhancedMessage = `${userMessage} Please provide information about this section.`;
          const requestBody = {
            message: enhancedMessage,
            contactId: userInfo.contactId, 
            sessionId: userInfo.sessionId,
            previousMessages: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            stream: true // Enable streaming by default
          };
          
          // Send request to get actual information
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
          }
          
          // Handle the response similar to the regular API response
          // Check if it's a stream
          if (response.headers.get('Content-Type')?.includes('application/json')) {
            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let streamedMessageId = '';
            
            // Remove typing indicator since we'll show streaming output
            setMessages(prev => prev.filter(msg => msg.id !== typingIndicatorId));
            
            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  break;
                }
                
                // Process the chunks
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                  try {
                    const data = JSON.parse(line);
                    
                    // If this is the first chunk, add a new message
                    if (!streamedMessageId) {
                      streamedMessageId = data.id;
                      
                      // Clean content to remove section tags before displaying
                      const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
                      
                      setMessages(prev => [...prev, {
                        id: data.id,
                        role: 'assistant',
                        content: cleanedContent,
                        created_at: data.created_at,
                        isTyping: false
                      }]);
                      
                      // Add call to scrollWithStreaming for smooth scrolling
                      setTimeout(scrollWithStreaming, 10);
                    } else {
                      // Clean content to remove section tags before displaying
                      const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
                      
                      // Otherwise update the existing message
                      setMessages(prev => prev.map(msg => 
                        msg.id === streamedMessageId 
                          ? { ...msg, content: cleanedContent } 
                          : msg
                      ));
                      
                      // Add call to scrollWithStreaming for continuous smooth scrolling
                      setTimeout(scrollWithStreaming, 10);
                    }
                  } catch (error) {
                    console.error('Error parsing streaming chunk:', error);
                  }
                }
              }
            }
          } else {
            // Handle non-streaming response (fallback)
            const data = await response.json();
            
            // Remove typing indicator
            setMessages(prev => prev.filter(msg => msg.id !== typingIndicatorId));
            
            // Clean the content to remove any section tags
            const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
            
            // Add the response to the chat
            setMessages(prev => [...prev, {
              id: data.id || generateUniqueId('assistant_'),
              role: 'assistant',
              content: cleanedContent,
              created_at: data.created_at || new Date().toISOString(),
              isTyping: false
            }]);
          }
        } catch (error) {
          console.error('Error getting section information:', error);
          
          // Remove typing indicator
          setMessages(prev => prev.filter(msg => msg.id !== typingIndicatorId));
          
          // Fallback to simple confirmation if the API call fails
          setMessages(prev => [...prev, { 
            id: generateUniqueId('assistant_'),
            role: 'assistant',
            content: `I've scrolled to the ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} section for you. Let me know if you need any specific information about this section.`,
            created_at: new Date().toISOString()
          }]);
        } finally {
          setIsLoading(false);
          scrollToBottom();
        }
        
        return;
      }
    }
    
    // Continue with regular message processing
    // Check if the message is a contact request and switch to contact mode
    if (isContactRequest(userMessage) && !isInContactForm) {
      // Add the user's message to the chat
      setMessages(prev => [...prev, { 
        id: generateUniqueId('user_'),
        role: 'user', 
        content: userMessage,
        created_at: new Date().toISOString()
      }]);
      
      // Delay the response slightly to feel more natural
      setTimeout(() => {
        // Automatically start contact form process
        setContactFormStep(1);
        setIsInContactForm(true);
        
        setMessages(prev => [...prev, { 
          id: generateUniqueId('assistant_'),
          role: 'assistant',
          content: `I'll help you get in touch with Giovanni. I already have your name (${userInfo.name}) and phone number (${userInfo.phoneNumber}). Could you please provide your email address?`,
          created_at: new Date().toISOString()
        }]);
      }, 500);
      
      scrollToBottom();
      return;
    }
    
    // If in contact form mode, handle differently
    if (isInContactForm) {
      handleContactFormInput(userMessage);
      return;
    }
    
    // Check if we should process the contact form submission
    if (contactFormStep > 0) {
      return;
    }
    
    // Regular case: Try to detect if the message is asking about a particular section
    const detectedSection = detectSection(userMessage);
    
    // If a section is detected and it's not a question (just a keyword), get AI response while scrolling
    if (detectedSection && !userMessage.includes('?') && userMessage.split(' ').length < 4) {
      // Add the user's message to the chat
      setMessages(prev => [...prev, { 
        id: generateUniqueId('user_'),
        role: 'user', 
        content: userMessage,
        created_at: new Date().toISOString()
      }]);
      
      // Scroll to the detected section
      scrollToSection(detectedSection);
    
    // Add typing indicator
      const sectionTypingId = generateUniqueId('typing_');
      setMessages(prev => [...prev, {
        id: sectionTypingId,
        role: 'assistant', 
        content: '', 
        created_at: new Date().toISOString(),
        isTyping: true 
      }]);
      
      setIsLoading(true);
      
      // Instead of just confirming navigation, get a response from the API
      // that provides information about the section
      try {
        // Process the message through the API
        const enhancedMessage = `Tell me about ${detectedSection}`;
        const requestBody = {
          message: enhancedMessage,
          contactId: userInfo.contactId, 
          sessionId: userInfo.sessionId,
          previousMessages: messages.map(msg => ({
        role: msg.role,
            content: msg.content
          })),
          stream: true // Enable streaming by default
        };
        
        // Send request to get actual information
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify(requestBody),
        });
        
        // Process response the same way as in the regular flow
      if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
        }
        
        // Handle the streaming response
        if (response.headers.get('Content-Type')?.includes('application/json')) {
          // Follow the same streaming pattern as above
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let streamedMessageId = '';
          
          // Remove typing indicator
          setMessages(prev => prev.filter(msg => msg.id !== sectionTypingId));
          
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                break;
              }
              
              // Process the chunks
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() !== '');
              
              for (const line of lines) {
                try {
                  const data = JSON.parse(line);
                  
                  // If this is the first chunk, add a new message
                  if (!streamedMessageId) {
                    streamedMessageId = data.id;
                    
                    // Clean content to remove section tags before displaying
                    const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
                    
                    setMessages(prev => [...prev, {
                      id: data.id,
                      role: 'assistant',
                      content: cleanedContent,
                      created_at: data.created_at,
                      isTyping: false
                    }]);
                    
                    // Add call to scrollWithStreaming for smooth scrolling
                    setTimeout(scrollWithStreaming, 10);
                  } else {
                    // Clean content to remove section tags before displaying
                    const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
                    
                    // Otherwise update the existing message
                    setMessages(prev => prev.map(msg => 
                      msg.id === streamedMessageId 
                        ? { ...msg, content: cleanedContent } 
                        : msg
                    ));
                    
                    // Add call to scrollWithStreaming for continuous smooth scrolling
                    setTimeout(scrollWithStreaming, 10);
                  }
                } catch (error) {
                  console.error('Error parsing streaming chunk:', error);
                }
              }
            }
          }
        } else {
          // Handle non-streaming response
      const data = await response.json();
      
          // Remove typing indicator
          setMessages(prev => prev.filter(msg => msg.id !== sectionTypingId));
          
          // Clean the content to remove any section tags
          const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
          
          // Add the response to the chat
          setMessages(prev => [...prev, {
            id: data.id || generateUniqueId('assistant_'),
            role: 'assistant',
            content: cleanedContent,
            created_at: data.created_at || new Date().toISOString(),
            isTyping: false
          }]);
        }
      } catch (error) {
        console.error('Error getting section information:', error);
        
        // Remove typing indicator
        setMessages(prev => prev.filter(msg => msg.id !== sectionTypingId));
        
        // Fallback to simple confirmation if the API call fails
        setMessages(prev => [...prev, { 
          id: generateUniqueId('assistant_'),
          role: 'assistant',
          content: `I've scrolled to the ${detectedSection.charAt(0).toUpperCase() + detectedSection.slice(1)} section for you. Let me know if you need any specific information about this section.`,
          created_at: new Date().toISOString()
        }]);
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
      
      return;
    }
    
    // Add the user's message to the chat (for standard API case)
    setMessages(prev => [...prev, { 
      id: generateUniqueId('user_'),
      role: 'user', 
      content: userMessage,
      created_at: new Date().toISOString()
    }]);
    
    // Add typing indicator for non-streaming responses
    const typingIndicatorId = generateUniqueId('typing_');
    setMessages(prev => [...prev, {
      id: typingIndicatorId,
      role: 'assistant', 
      content: '', 
      created_at: new Date().toISOString(),
      isTyping: true 
    }]);
    
    setIsLoading(true);
    
    try {
      // If a section is detected but we're asking a question about it, 
      // scroll to it while also getting AI response
      if (detectedSection) {
        scrollToSection(detectedSection);
      }
      
      // Process the message through the API - ENSURE we pass contactId and sessionId
      // but do NOT pass skipChatLogStorage flag for normal chat messages
      const requestBody = {
        message: userMessage,
        contactId: userInfo.contactId, 
        sessionId: userInfo.sessionId,
        previousMessages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: true // Enable streaming by default
      };
      
      // For streaming responses, we need to handle the response differently
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }
      
      // Check if the response is a stream
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let streamedMessageId = '';
        
        // Remove typing indicator since we'll show streaming output
        setMessages(prev => prev.filter(msg => msg.id !== typingIndicatorId));
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            // Process the chunks
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                
                // If this is the first chunk, add a new message
                if (!streamedMessageId) {
                  streamedMessageId = data.id;
                  
                  // Clean content to remove section tags before displaying
                  const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
                  
                  setMessages(prev => [...prev, {
                    id: data.id,
                    role: 'assistant',
                    content: cleanedContent,
                    created_at: data.created_at,
                    isTyping: false
                  }]);
                  
                  // Add call to scrollWithStreaming for smooth scrolling
                  setTimeout(scrollWithStreaming, 10);
                } else {
                  // Clean content to remove section tags before displaying
                  const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
                  
                  // Otherwise update the existing message
                  setMessages(prev => prev.map(msg => 
                    msg.id === streamedMessageId 
                      ? { ...msg, content: cleanedContent } 
                      : msg
                  ));
                  
                  // Add call to scrollWithStreaming for continuous smooth scrolling
                  setTimeout(scrollWithStreaming, 10);
                }
                
                // If this is the final chunk, check for section references
                if (data.done && data.content) {
                  // Use the new extraction function to check for section tags in either format
                  const sectionName = extractSectionFromResponse(data.content);
                  
                  if (sectionName) {
                    console.log(`AI suggested navigating to section: ${sectionName}`);
                    scrollToSection(sectionName);
                  }
                  
                  break;
                }
    } catch (error) {
                console.error('Error parsing streaming chunk:', error);
              }
            }
          }
        }
      } else {
        // Handle non-streaming response (fallback)
        const data = await response.json();
        
        // Remove typing indicator
        setMessages(prev => prev.filter(msg => msg.id !== typingIndicatorId));
        
        // Clean the content to remove any section tags
        const cleanedContent = data.content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
        
        // Add the response to the chat
        setMessages(prev => [...prev, {
          id: generateUniqueId('assistant_'),
          role: 'assistant',
          content: cleanedContent,
          created_at: data.created_at || new Date().toISOString(),
          isTyping: false
        }]);
        
        // Check for section tag in the format [SECTION:sectionname]
        const sectionMatch = data.content.match(/\[SECTION:([a-z]+)\]$/i);
        
        if (sectionMatch && sectionMatch[1]) {
          const sectionName = sectionMatch[1].toLowerCase();
          console.log(`AI suggested navigating to section: ${sectionName}`);
          scrollToSection(sectionName);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.isTyping));
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: generateUniqueId('assistant_'),
        role: 'assistant',
        content: "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment.",
          created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>
      handleSubmit(formEvent)
    }
  }

  // Update the scrollToBottom function for more responsive and smoother scrolling
  const scrollToBottom = (instant = false) => {
    if (!messagesContainerRef.current) return;
    
      const container = messagesContainerRef.current;
      
    // If instant is true, skip animation
    if (instant) {
      container.scrollTop = container.scrollHeight;
      return;
    }
    
    const smoothScrollToBottom = () => {
      const startPosition = container.scrollTop;
      const targetPosition = container.scrollHeight - container.clientHeight;
      const distance = targetPosition - startPosition;
      
      // Use dynamic duration based on distance for more natural feel
      const duration = Math.min(400, Math.max(150, distance * 0.3));
      
      // Only animate if we're not already at the bottom and there's a significant distance
      if (distance > 5) {
        let startTime: number | null = null;
        
        // Enhanced easing function for a more natural motion
        const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
        
        const scroll = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const easedProgress = easeOutQuint(progress);
          
          if (!container) return; // Safety check
          container.scrollTop = startPosition + distance * easedProgress;
          
          if (timeElapsed < duration && container.scrollTop < targetPosition) {
            requestAnimationFrame(scroll);
          } else {
            // Final check to ensure we're at the bottom
        container.scrollTop = container.scrollHeight;
          }
        };
        
        requestAnimationFrame(scroll);
      } else {
        // For small distances, just jump to the bottom
        container.scrollTop = container.scrollHeight;
      }
    };
    
    // Use immediate execution for scrolling rather than setTimeout
    requestAnimationFrame(smoothScrollToBottom);
  };

  // Add a specialized streaming scroll function
  const scrollWithStreaming = () => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    
    // Only auto-scroll if user is already near bottom
    if (isNearBottom) {
      // For streaming, use gentler, smoother scrolling
      const startPosition = container.scrollTop;
      const targetPosition = container.scrollHeight - container.clientHeight;
      const distance = targetPosition - startPosition;
      
      // Increased duration for slower streaming animation
      const duration = Math.min(400, Math.max(150, distance * 0.4));
      
      if (distance > 2) {
        let startTime: number | null = null;
        
        const easeLinear = (t: number) => t; // Linear for streaming feels more natural
        
        const scroll = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const easedProgress = easeLinear(progress);
          
          if (!container) return;
          container.scrollTop = startPosition + distance * easedProgress;
          
          if (timeElapsed < duration && progress < 1) {
            requestAnimationFrame(scroll);
          }
        };
        
        requestAnimationFrame(scroll);
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // Add scroll effect for new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Add scroll effect when chat opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  // Add effect to handle new message scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      // Check if user is near bottom before auto-scrolling
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        scrollToBottom();
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

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

  // Update handleUserInfoSubmit to make it clear we're storing contact info only
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
    
    try {
      // Send user info to API - store only contact info, not chat logs
      const response = await fetch('/api/chat/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userInfo.name,
          phoneNumber: userInfo.phoneNumber,
          sessionId: userInfo.sessionId,
          storeContactOnly: true // Add flag to only store contact info
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit user info');
      }
      
      const data = await response.json();
      
      // Update user info with contact ID and submitted status
      const updatedUserInfo = {
        ...userInfo,
        contactId: data.contactId,
        submitted: true,
        sessionId: data.sessionId || userInfo.sessionId
      };
      
      setUserInfo(updatedUserInfo);
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatUserInfo', JSON.stringify(updatedUserInfo));
      }
      
      // Hide the form
      setShouldShowUserForm(false);
      
      // Add welcome message after form submission
      setMessages([{
        id: generateUniqueId('assistant_'),
        role: 'assistant',
        content: `Hi ${userInfo.name}! 👋 I'm NextGio, Giovanni's AI assistant. I can help you learn about Giovanni's experience, projects, and skills. What would you like to know?`,
        created_at: new Date().toISOString()
      }]);
      
    } catch (error) {
      console.error('Error submitting user info:', error);
      
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

  // Grid background animation effect
  useEffect(() => {
    // Listen for custom event to open chat in sidebar mode
    const handleOpenChat = (e: any) => {
      if (!isOpen) {
        setIsOpen(true);
        
        // If sidebar mode is requested, enable it after a short delay
        if (e.detail?.sidebarMode) {
          setTimeout(() => {
            setSidebarMode(true);
            setChatDimensions(sidebarDimensions);
            document.body.classList.add('with-chat-sidebar');
          }, 50);
        }
      }
    };
    
    document.addEventListener('nextgio:openchat', handleOpenChat);
    
    return () => {
      document.removeEventListener('nextgio:openchat', handleOpenChat);
    };
  }, [isOpen, sidebarDimensions]);

  // Function to process section tags and handle both formats consistently
  const extractSectionFromResponse = (content: string) => {
    // First try the standard format [SECTION:sectionname]
    const standardMatch = content.match(/\[SECTION:([a-z]+)\]$/i);
    if (standardMatch && standardMatch[1]) {
      return standardMatch[1].toLowerCase();
    }
    
    // Then try the alternative format [SECTIONNAME]
    const alternativeMatch = content.match(/\[([A-Z]+)\]$/);
    if (alternativeMatch && alternativeMatch[1]) {
      return alternativeMatch[1].toLowerCase();
    }
    
    return null;
  };

  return (
    <div className="chat-box-container prevent-scroll-propagation">
      {/* Set CSS variables for dynamic styling */}
      <style jsx global>{`
        :root {
          --chat-bg-color: rgba(255, 255, 255, 0.95);
          --logo-filter: brightness(0);
        }
        
        .dark {
          --chat-bg-color: rgb(0, 0, 0);
          --logo-filter: none;
        }

        .chat-logo {
          border-radius: 9999px;
          filter: var(--logo-filter);
        }

        .chat-logo-original {
          border-radius: 9999px;
        }
      `}</style>
      
      {/* Add global styles for sidebar mode */}
      <style jsx global>{`
        /* Sidebar mode styles */
        body.with-chat-sidebar {
          transition: padding-right 0.3s ease;
          padding-right: 320px;
          position: relative;
        }
        
        /* Adjust navbar to stay centered with content when sidebar is active */
        body.with-chat-sidebar .fixed.top-0.left-0.right-0.z-\[100\] {
          transition: padding-right 0.3s ease;
          padding-right: 320px;
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

      {/* Chat button - keep black in light mode */}
      <Button
        onClick={toggleExpanded}
        className={cn(
          "fixed bottom-4 right-4 z-50 rounded-full shadow-xl transition-all duration-300",
          (isOpen && isMobile) && "chat-button-hidden",
          isOpen 
            ? "translate-y-20 opacity-0 pointer-events-none" 
            : "translate-y-0 opacity-100 pointer-events-auto",
          isDark 
            ? "bg-gradient-to-tr from-gray-800 via-gray-900 to-black text-white hover:from-gray-700 hover:to-gray-900 border border-gray-700" 
            : "bg-gradient-to-tr from-black to-gray-800 text-white hover:from-gray-900 hover:to-black border border-white/10",
          hasNewMessages && "animate-bounce",
          "p-0 overflow-hidden group"
        )}
        style={{
          width: "56px",
          height: "56px",
          boxShadow: isDark 
            ? "0 0 20px rgba(255, 255, 255, 0.1), 0 10px 20px -10px rgba(0, 0, 0, 0.5)" 
            : "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        }}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Pulse effect behind icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                "absolute w-10 h-10 rounded-full",
                isDark ? "bg-white/5" : "bg-white/15",
                "animate-pulse opacity-75 duration-1000 group-hover:opacity-100"
              )}></span>
            </div>
            
            {/* Icon container with glow effect */}
            <div className={cn(
              "relative z-10 flex items-center justify-center",
              "transition-transform duration-500 group-hover:scale-110",
              "rounded-full p-2"
            )}>
              <Image 
                src="/GV Fav.png" 
                alt="GV" 
                width={36} 
                height={36} 
                className={cn(
                  "rounded-full",
                  isDark ? "brightness-100 filter drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]" : "brightness-100 filter drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]",
                  "transform transition-all duration-300 group-hover:scale-105"
                )}
              />
            </div>
            
            {/* Notification badge */}
            {hasNewMessages && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500 items-center justify-center text-[8px] font-bold border border-white/20">
                  {isDark ? "!" : "!"}
                </span>
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
                  : "bottom-4 right-2" // Move closer to the right edge
            )}
            style={{
              zIndex: isMobile || sidebarMode ? 1100 : 50,
              pointerEvents: "auto",
              maxWidth: isMobile ? '100%' : sidebarMode ? '320px' : '380px', // Slightly smaller max width
              width: isMobile ? '100%' : '100%',
              transform: !isMobile && !sidebarMode ? 'none' : undefined,
              margin: !isMobile && !sidebarMode ? '0' : undefined
            }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
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
                minConstraints={isMobile ? [window.innerWidth, 400] : [280, 400]}
                maxConstraints={
                  isMobile 
                    ? [window.innerWidth, viewportHeight]
                    : (sidebarMode 
                      ? [320, window.innerHeight] 
                      : [500, 800])
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
                      ? "bg-zinc-900 border border-zinc-800" // Darker zinc
                      : "bg-zinc-900/90 border border-zinc-800 backdrop-blur-md" // Darker zinc
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
                
              {/* Chat header - original color */}
                <div className={cn(
                  "flex items-center justify-between px-4 py-2.5 relative z-20",
                  sidebarMode || isMobile
                    ? isDark 
                      ? "bg-zinc-900 border-b border-zinc-800" // Darker zinc
                      : "bg-white border-b border-gray-200"
                    : isDark 
                      ? "bg-zinc-900/95 backdrop-blur-xl" // Darker zinc
                      : "bg-white/95 backdrop-blur-xl",
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
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden",
                        isDark 
                          ? "bg-white" 
                          : "bg-gray-800" // Changed from bg-black to bg-gray-800
                      )}>
                        <Image 
                          src="/GV Fav.png" 
                          alt="AI" 
                          width={24} 
                          height={24} 
                          className={cn(
                            "w-6 h-6 object-contain transform hover:scale-110 transition-transform duration-200",
                            isDark ? "brightness-0" : "brightness-100"
                          )}
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-[1.5px] border-white dark:border-black"></div>
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-medium text-sm flex items-center gap-2",
                        isDark ? "text-white" : "text-black"
                      )}>
                        NextGio
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-md text-[10px] font-medium",
                          isDark ? "bg-white/10 text-white" : "bg-black/10 text-black"
                        )}>
                          AI
                        </span>
                      </h3>
                      <div className="flex items-center text-[10px] mt-0.5">
                        <span className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full mr-1.5 animate-pulse",
                          "bg-emerald-500"
                        )}></span>
                        <span className={cn(
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>Online • Ready to assist</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-0.5">
                    {/* Sidebar mode toggle */}
                    {!isMobile && (
                  <button
                        onClick={toggleSidebarMode}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isDark 
                            ? "hover:bg-gray-800 text-gray-400" 
                            : "hover:bg-black/5 text-gray-500"
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
                          ? "hover:bg-gray-800 text-gray-400" 
                          : "hover:bg-black/5 text-gray-500"
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
                          ? "hover:bg-gray-800 text-gray-400" 
                          : "hover:bg-black/5 text-gray-500"
                    )}
                    aria-label="Close chat"
                  >
                      <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
                {/* Show user form or chat messages */}
                {shouldShowUserForm ? (
                  <div className="flex-1 flex items-center justify-center bg-white/10 dark:bg-gray-800/10 backdrop-blur-md">
                    <div className="w-11/12 max-w-md p-6 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-black/5 dark:border-white/10">
                      <h3 className={cn(
                        "text-xl font-semibold mb-6 text-center",
                        isDark ? "text-white" : "text-black"
                      )}>
                        Please share your contact info
                      </h3>
                      
                      <form 
                        onSubmit={handleUserInfoSubmit}
                        className="space-y-5"
                      >
                        <div>
                          <input
                            type="text"
                            name="name"
                            value={userInfo.name}
                            onChange={handleUserInfoChange}
                            placeholder="Your name"
                            className={cn(
                              "w-full px-4 py-3 rounded-lg text-base transition-all duration-200",
                              isDark 
                                ? "bg-gray-800/50 text-white placeholder-gray-400 focus:bg-gray-800" 
                                : "bg-gray-50 text-black placeholder-gray-500 focus:bg-white",
                              "border-2",
                              validationErrors.name 
                                ? "border-red-500" 
                                : isDark 
                                  ? "border-gray-700 focus:border-blue-500" 
                                  : "border-gray-200 focus:border-blue-500",
                              "outline-none focus:ring-2 focus:ring-blue-500/20"
                            )}
                            style={{ fontSize: '15px' }}
                            disabled={isSubmittingInfo}
                          />
                          {validationErrors.name && (
                            <p className="mt-2 text-sm text-red-500">{validationErrors.name}</p>
                          )}
                        </div>
                        
                        <div>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={userInfo.phoneNumber}
                            onChange={handleUserInfoChange}
                            placeholder="Your phone number"
                            className={cn(
                              "w-full px-4 py-3 rounded-lg text-base transition-all duration-200",
                              isDark 
                                ? "bg-gray-800/50 text-white placeholder-gray-400 focus:bg-gray-800" 
                                : "bg-gray-50 text-black placeholder-gray-500 focus:bg-white",
                              "border-2",
                              validationErrors.phoneNumber 
                                ? "border-red-500" 
                                : isDark 
                                  ? "border-gray-700 focus:border-blue-500" 
                                  : "border-gray-200 focus:border-blue-500",
                              "outline-none focus:ring-2 focus:ring-blue-500/20"
                            )}
                            style={{ fontSize: '15px' }}
                            disabled={isSubmittingInfo}
                          />
                          {validationErrors.phoneNumber && (
                            <p className="mt-2 text-sm text-red-500">{validationErrors.phoneNumber}</p>
                          )}
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmittingInfo}
                          className={cn(
                            "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
                            isDark 
                              ? "bg-white text-black hover:bg-gray-200" 
                              : "bg-gray-800 text-white hover:bg-gray-700", // Changed from black to gray-800
                            "transform hover:translate-y-[-1px] active:translate-y-[1px]",
                            isSubmittingInfo && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isSubmittingInfo ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              <span>Submitting...</span>
                            </div>
                          ) : (
                            "Start Chatting"
                          )}
                        </button>
                        
                        <p className={cn(
                          "text-sm text-center mt-4",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          Your information helps Giovanni connect with interested visitors
                        </p>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    {/* Chat messages */}
                    <div 
                      ref={messagesContainerRef}
                    className={cn(
                        "flex-1 overflow-y-auto p-4 space-y-4 relative z-10",
                        "flex flex-col",
                        "scrollbar-thin",
                        isDark 
                          ? "scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20" 
                          : "scrollbar-thumb-black/10 hover:scrollbar-thumb-black/20",
                        "scrollbar-track-transparent",
                        "isolate" // Prevent scroll propagation
                    )}
                    style={{
                        background: isDark 
                          ? sidebarMode
                            ? 'rgb(24, 24, 27)' // Darker zinc-900
                            : 'rgba(24, 24, 27, 0.7)' // Darker with transparency
                          : sidebarMode
                            ? 'rgb(255, 255, 255)' 
                            : 'transparent',
                        height: 'calc(100% - 60px)', // Reduce height to account for smaller header
                        maxHeight: 'calc(100% - 60px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch',
                        msOverflowStyle: '-ms-autohiding-scrollbar',
                        willChange: 'scroll-position', // Optimize scrolling performance
                        contain: 'strict' // Improve scroll performance
                      }}
                      onWheel={(e) => {
                        e.stopPropagation();
                      }}
                      onTouchMove={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {messages.map((message, index) => (
                        <div
                          key={message.id || `fallback_${index}_${Math.random()}`}
                          className={cn(
                            "flex w-full",
                            message.role === "user" ? "justify-end" : "justify-start",
                            "items-end gap-2",
                            "transform-gpu",
                            message.isWelcome && "mb-6"
                          )}
                          style={{
                            minHeight: message.isTyping ? '40px' : 'auto',
                            opacity: message.isTyping ? 0.7 : 1
                          }}
                        >
                          {message.role === "assistant" && (
                            <div className="flex-shrink-0 w-8 h-8">
                              <div className="w-8 h-8 rounded-full overflow-hidden">
                                <Image 
                                  src="/GV Fav.png" 
                                  alt="AI" 
                                  width={32} 
                                  height={32}
                                  className={cn(
                                    "w-full h-full object-cover",
                                    !isDark && "brightness-0"
                                  )}
                                />
                              </div>
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                              message.role === "user" 
                                ? "bg-zinc-800 text-white ml-auto rounded-br-sm" // Darker zinc
                                : isDark
                                  ? "bg-zinc-800 text-gray-100 rounded-bl-sm" // Darker zinc
                                  : "bg-gray-100 text-gray-900 rounded-bl-sm",
                              message.isTyping && "min-w-[60px]",
                              "transform-gpu"
                            )}
                            style={{
                              minHeight: message.isTyping ? '32px' : 'auto'
                            }}
                          >
                            {message.isTyping ? (
                              <div className="flex items-center justify-center h-[20px]">
                                <motion.div
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isDark ? "bg-gray-400" : "bg-gray-500"
                                  )}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity }}
                                />
                                <motion.div
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full mx-1",
                                    isDark ? "bg-gray-400" : "bg-gray-500"
                                  )}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                                />
                                <motion.div
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isDark ? "bg-gray-400" : "bg-gray-500"
                                  )}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }}
                                />
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                          </div>
                          {message.role === "user" && (
                            <div className="flex-shrink-0 w-8 h-8">
                    <div className={cn(
                                "w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-sm font-medium" // Darker zinc
                              )}>
                                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Chat input */}
                    <div 
                      className={cn(
                        "relative z-20 bg-transparent",
                        "sticky bottom-0 left-0 right-0",
                        "border-t",
                        isDark ? "border-gray-800" : "border-gray-200"
                      )}
                      style={{
                        backgroundColor: isDark ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.95)', // Darker zinc
                        backdropFilter: 'blur(12px)',
                        paddingBottom: '0'
                      }}
                    >
                      <form onSubmit={handleSubmit} className={cn(
                        "flex items-center gap-3 relative z-20 backdrop-blur-lg p-3",
                      isDark 
                          ? "bg-zinc-900/30" // Darker zinc
                          : "bg-white/30"
                      )}>
                        <div className={cn(
                          "flex-1 relative group overflow-hidden",
                          "rounded-xl",
                          "border",
                          isDark
                            ? "bg-zinc-900/70 border-zinc-800 group-focus-within:border-zinc-700" // Darker zinc
                            : "bg-white/80 border-gray-200 group-focus-within:border-gray-300", 
                          "transition-all duration-200",
                          "focus-within:shadow-sm",
                          isDark
                            ? "focus-within:shadow-gray-800/50"
                            : "focus-within:shadow-gray-200"
                        )}>
                          {/* Subtle background gradient */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-300",
                            isDark 
                              ? "bg-gradient-to-tr from-zinc-700/10 to-zinc-600/5" 
                              : "bg-gradient-to-tr from-gray-100/50 to-white/80"
                          )} />
                          
                          <TextareaAutosize
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                          placeholder="Message Giovanni's AI..."
                            minRows={1}
                            maxRows={isMobile ? 4 : 6}
                            cacheMeasurements
                        className={cn(
                              "w-full resize-none bg-transparent",
                              "px-4 py-3",
                              "text-sm",
                          isDark 
                                ? "text-white placeholder:text-gray-500" 
                                : "text-gray-900 placeholder:text-gray-400",
                              "focus:outline-none focus:ring-0",
                          isMobile && "mobile-textarea"
                        )}
                        style={{ 
                              fontSize: '14px',
                              lineHeight: '1.5',
                            }}
                          />
                          
                          {/* Character count indicator - only show when typing */}
                          {input.length > 0 && (
                            <div className={cn(
                              "absolute bottom-1 right-2 text-[10px] px-1.5 py-0.5 rounded",
                              "transition-opacity duration-200",
                              isDark ? "text-gray-500 bg-zinc-800/50" : "text-gray-400 bg-gray-100/80",
                              input.length > 280 ? "text-amber-500" : ""
                            )}>
                              {input.length} {input.length > 280 ? "(long)" : ""}
                            </div>
                          )}
                        </div>
                        
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                          aria-label="Send message"
                        className={cn(
                            "flex items-center justify-center",
                            "rounded-full p-0 w-10 h-10",
                            "transition-all duration-200",
                          isDark 
                              ? "bg-gradient-to-tr from-gray-800 to-gray-900 text-white hover:from-gray-700" 
                              : "bg-gradient-to-tr from-gray-900 to-black text-white hover:from-gray-800",
                            "hover:shadow-md active:scale-95",
                            "border",
                            isDark 
                              ? "border-gray-700" 
                              : "border-gray-800",
                            (isLoading || !input.trim()) && "opacity-50 cursor-not-allowed hover:shadow-none",
                            "group overflow-hidden"
                          )}
                          style={{
                            boxShadow: isDark 
                              ? "0 2px 10px rgba(0, 0, 0, 0.3)" 
                              : "0 2px 10px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          {/* Subtle pulse effect behind icon */}
                          <span className={cn(
                            "absolute w-5 h-5 rounded-full",
                            isDark ? "bg-white/5" : "bg-white/15",
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          )}></span>
                          <Send className="h-4 w-4 transform translate-x-px -translate-y-px relative z-10 group-hover:scale-110 transition-transform duration-200" />
                      </button>
                      </form>
                    </div>
                      </div>
                )}
            </ResizableBox>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}