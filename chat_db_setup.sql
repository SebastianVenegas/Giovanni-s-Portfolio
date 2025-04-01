-- SQL commands for Neon SQL Editor
-- Create admin_chat_sessions table
CREATE TABLE IF NOT EXISTS admin_chat_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) DEFAULT 'New Chat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_chat_messages table
CREATE TABLE IF NOT EXISTS admin_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES admin_chat_sessions(session_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_chat_sessions_updated_at ON admin_chat_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_admin_chat_messages_session_id ON admin_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_chat_messages_created_at ON admin_chat_messages(created_at);
