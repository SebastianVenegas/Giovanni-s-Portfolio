export interface ContactStats {
  total_messages: number;
  last_active: string;
  total_sessions: number;
  total_contacts?: number;
}

export interface ChatSession {
  id: string;
  user: string;
  phone: string;
  title: string;
  sessionId: string;
  timestamp: string;
  created_at: string | Date;
  first_message?: string;
  messages: Array<{ role: string; content: string }>;
} 