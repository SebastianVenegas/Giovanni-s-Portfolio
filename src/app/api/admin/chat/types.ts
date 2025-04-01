export interface ContactStats {
  total_messages: number;
  last_active: string;
}

export interface ChatSession {
  user: string;
  phone: string;
  sessionId: string;
  timestamp: string;
  messages: Array<{ role: string; content: string }>;
} 