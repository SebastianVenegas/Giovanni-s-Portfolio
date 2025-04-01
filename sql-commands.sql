-- Create admin_chat_sessions table to store chat sessions
CREATE TABLE IF NOT EXISTS admin_chat_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_chat_messages table to store messages for each session
CREATE TABLE IF NOT EXISTS admin_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES admin_chat_sessions(session_id) ON DELETE CASCADE
);

-- Create index for faster queries on session_id
CREATE INDEX IF NOT EXISTS idx_admin_chat_messages_session_id ON admin_chat_messages(session_id);

-- Sample query to get all sessions ordered by most recent first
SELECT 
  session_id, 
  title, 
  created_at, 
  updated_at,
  (
    SELECT COUNT(*) 
    FROM admin_chat_messages 
    WHERE admin_chat_messages.session_id = admin_chat_sessions.session_id
  ) as message_count
FROM admin_chat_sessions
ORDER BY updated_at DESC;

-- Sample query to get all messages for a specific session
SELECT id, session_id, role, content, created_at
FROM admin_chat_messages
WHERE session_id = 'your-session-id'
ORDER BY created_at ASC;

-- Sample query to update session title
UPDATE admin_chat_sessions
SET title = 'New Custom Title', updated_at = CURRENT_TIMESTAMP
WHERE session_id = 'your-session-id';

-- Sample query to delete a session and all its messages (CASCADE will handle related messages)
DELETE FROM admin_chat_sessions
WHERE session_id = 'your-session-id'; 