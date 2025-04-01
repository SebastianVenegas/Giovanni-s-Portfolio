/**
 * Fix for admin chat session issues
 * 
 * This script should be imported at the top of your admin page component.
 * It will fix any problematic session IDs that are causing infinite request loops.
 */

export function fixAdminChatSessions() {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear existing localStorage to stop the request flood
    const oldSessionId = localStorage.getItem('adminChatSessionId');
    
    // If there's an existing session ID, check if it's properly formatted
    if (oldSessionId) {
      console.log('Found existing session ID:', oldSessionId);
      
      // Check if the session ID is malformed (missing random suffix)
      if (!oldSessionId.includes('-') || oldSessionId.split('-').length < 3) {
        console.log('Removing problematic session ID');
        localStorage.removeItem('adminChatSessionId');
        
        // Create a correctly formatted session ID
        const newSessionId = `admin-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('adminChatSessionId', newSessionId);
        console.log('Created new session ID:', newSessionId);
      }
    } else {
      // If no session ID exists, create a new one
      const newSessionId = `admin-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('adminChatSessionId', newSessionId);
      console.log('Created new session ID:', newSessionId);
    }
  } catch (error) {
    console.error('Error fixing admin session:', error);
  }
}

// If you'd prefer to have this execute automatically when imported
// Uncomment the line below
// fixAdminChatSessions(); 