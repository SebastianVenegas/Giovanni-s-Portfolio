import { Pool } from 'pg';

// Create a connection configuration using the connection string from environment variables
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Required for some Neon connections
    : false
};

// For serverless environments, create a new client for each request
export async function getClient() {
  const { Client } = await import('pg');
  const client = new Client(connectionConfig);
  await client.connect();
  return client;
}

// Initialize the database by creating the necessary tables if they don't exist
export async function initializeDatabase() {
  const client = await getClient();
  try {
    // Create the contacts table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create the chat_logs table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_logs (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id),
        session_id VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.end();
  }
}

// Save contact information to the database
export async function saveContact(name: string, phoneNumber: string) {
  const client = await getClient();
  try {
    const result = await client.query(
      'INSERT INTO contacts (name, phone_number) VALUES ($1, $2) RETURNING id',
      [name, phoneNumber]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving contact:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Save a chat message to the database
export async function saveChatMessage(contactId: number, sessionId: string, role: string, content: string) {
  const client = await getClient();
  try {
    const result = await client.query(
      'INSERT INTO chat_logs (contact_id, session_id, role, content) VALUES ($1, $2, $3, $4) RETURNING id',
      [contactId, sessionId, role, content]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Save multiple chat messages in a batch
export async function saveChatMessages(messages: { contactId: number, sessionId: string, role: string, content: string }[]) {
  if (!messages.length) return [];
  
  const client = await getClient();
  try {
    // Create a batch insert query
    const values = messages.map((_, i) => 
      `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
    ).join(', ');
    
    const params = messages.flatMap(m => [m.contactId, m.sessionId, m.role, m.content]);
    
    const query = `
      INSERT INTO chat_logs (contact_id, session_id, role, content) 
      VALUES ${values}
      RETURNING id
    `;
    
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error saving chat messages:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Get chat history for a specific contact and session
export async function getChatHistory(contactId: number, sessionId: string) {
  const client = await getClient();
  try {
    const result = await client.query(
      'SELECT * FROM chat_logs WHERE contact_id = $1 AND session_id = $2 ORDER BY created_at ASC',
      [contactId, sessionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Get all contacts from the database
export async function getContacts() {
  const client = await getClient();
  try {
    const result = await client.query(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  } finally {
    await client.end();
  }
} 