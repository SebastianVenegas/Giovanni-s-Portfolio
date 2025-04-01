-- Script to fix admin chat session tables
-- This can be run manually in the Neon SQL Editor if the application is having session issues

-- 1. Create admin_chat_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_chat_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) DEFAULT 'New Chat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create admin_chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES admin_chat_sessions(session_id) ON DELETE CASCADE
);

-- 3. Create a test/default session to prevent 404 errors
INSERT INTO admin_chat_sessions (session_id, title)
VALUES ('admin-session-default', 'Default Admin Session')
ON CONFLICT (session_id) DO NOTHING;

-- 4. Insert a welcome message for this default session
INSERT INTO admin_chat_messages (session_id, role, content)
SELECT 'admin-session-default', 'assistant', 'Welcome to the admin chat. This is a default session created by the system.'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_chat_messages 
  WHERE session_id = 'admin-session-default' 
  AND role = 'assistant'
);

-- 5. Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_admin_chat_sessions_updated_at ON admin_chat_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_admin_chat_messages_session_id ON admin_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_chat_messages_created_at ON admin_chat_messages(created_at); 