// Mock data structure for the edge runtime
export interface Message {
  id: number;
  contact_id: number;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  phone_number: string;
  created_at: string;
}

export interface Session {
  sessionId: string;
  messages: Message[];
}

export interface ChatData {
  contact: Contact;
  sessions: Session[];
}

// Example mock conversation data
export const mockConversations: ChatData[] = [
  {
    contact: {
      id: 1,
      name: "Jane Smith",
      phone_number: "+1234567890",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    },
    sessions: [
      {
        sessionId: "session_1",
        messages: [
          {
            id: 1,
            contact_id: 1,
            session_id: "session_1",
            role: "user",
            content: "Hi, I'm interested in your web development services.",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            contact_id: 1,
            session_id: "session_1",
            role: "assistant",
            content: "Hello Jane! I'd be happy to discuss my web development services. Could you tell me more about your project?",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            contact_id: 1,
            session_id: "session_1",
            role: "user",
            content: "I need a portfolio website similar to yours. I like the clean design.",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString()
          }
        ]
      }
    ]
  },
  {
    contact: {
      id: 2,
      name: "John Doe",
      phone_number: "+0987654321",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    },
    sessions: [
      {
        sessionId: "session_2",
        messages: [
          {
            id: 4,
            contact_id: 2,
            session_id: "session_2",
            role: "user",
            content: "Hello, do you offer consulting services?",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 5,
            contact_id: 2,
            session_id: "session_2",
            role: "assistant",
            content: "Hi John! Yes, I do offer consulting services for web development and design projects. What type of consulting are you looking for?",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString()
          },
          {
            id: 6,
            contact_id: 2,
            session_id: "session_2",
            role: "user",
            content: "I'm interested in UX consulting for my company's app.",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString()
          }
        ]
      }
    ]
  },
  {
    contact: {
      id: 3,
      name: "Emma Johnson",
      phone_number: "+1122334455",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    sessions: [
      {
        sessionId: "session_3",
        messages: [
          {
            id: 7,
            contact_id: 3,
            session_id: "session_3",
            role: "user",
            content: "Are you available for a project starting next month?",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 8,
            contact_id: 3,
            session_id: "session_3",
            role: "assistant",
            content: "Hello Emma! I'd be happy to discuss your project. Could you share more details about what you have in mind and the timeline?",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
          },
          {
            id: 9,
            contact_id: 3,
            session_id: "session_3",
            role: "user",
            content: "It's an e-commerce site, and we're looking to launch in about 2 months.",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString()
          }
        ]
      }
    ]
  }
]; 