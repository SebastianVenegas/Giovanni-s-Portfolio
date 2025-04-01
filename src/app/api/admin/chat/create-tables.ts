import { createClient } from '@vercel/postgres';

/**
 * Creates the necessary database tables for the admin chat functionality.
 * This includes tables for chat sessions and messages.
 * 
 * @returns A string indicating the result of the operation
 */
export async function createAdminChatTables(): Promise<string> {
  try {
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Create admin_chat_sessions table if it doesn't exist
    await client.sql`
      CREATE TABLE IF NOT EXISTS admin_chat_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    
    // Create admin_chat_messages table if it doesn't exist
    await client.sql`
      CREATE TABLE IF NOT EXISTS admin_chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY (session_id) REFERENCES admin_chat_sessions(session_id) ON DELETE CASCADE
      );
    `;

    // Create indexes to improve query performance
    await client.sql`
      CREATE INDEX IF NOT EXISTS idx_admin_chat_sessions_session_id ON admin_chat_sessions(session_id);
    `;
    
    await client.sql`
      CREATE INDEX IF NOT EXISTS idx_admin_chat_messages_session_id ON admin_chat_messages(session_id);
    `;
    
    await client.end();
    return "Admin chat tables created successfully";
  } catch (error) {
    console.error("Error creating admin chat tables:", error);
    return `Error creating admin chat tables: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
} 