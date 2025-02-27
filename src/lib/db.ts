import { Pool } from 'pg';

// Create a connection configuration using the connection string from environment variables
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Required for some Neon connections
    : false
};

// Create a connection pool that can be reused across requests
const pool = new Pool({
  ...connectionConfig,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// For serverless environments, create a new client for each request
export async function getClient() {
  const { Client } = await import('pg');
  const client = new Client(connectionConfig);
  await client.connect();
  return client;
}

// Get a client from the pool (much faster than creating a new connection)
export async function getPoolClient() {
  return await pool.connect();
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
  const client = await getPoolClient();
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
    client.release(); // Release client back to pool instead of ending connection
  }
}

// Save a chat message to the database
export async function saveChatMessage(contactId: number, sessionId: string, role: string, content: string) {
  const client = await getPoolClient();
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
    client.release(); // Release client back to pool instead of ending connection
  }
}

// Save multiple chat messages in a batch
export async function saveChatMessages(messages: { contactId: number, sessionId: string, role: string, content: string }[]) {
  if (!messages.length) return [];
  
  const client = await getPoolClient();
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
    client.release(); // Release client back to pool instead of ending connection
  }
}

// Get chat history for a specific contact and session
export async function getChatHistory(contactId: number, sessionId: string | null) {
  const client = await getPoolClient();
  try {
    let query = 'SELECT * FROM chat_logs WHERE contact_id = $1';
    const params: (number | string)[] = [contactId];
    
    // If sessionId is provided, filter by it
    if (sessionId) {
      query += ' AND session_id = $2';
      params.push(sessionId);
    }
    
    query += ' ORDER BY created_at ASC';
    
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  } finally {
    client.release(); // Release client back to pool instead of ending connection
  }
}

// Get all contacts from the database
export async function getContacts() {
  const client = await getPoolClient();
  try {
    const result = await client.query(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  } finally {
    client.release(); // Release client back to pool instead of ending connection
  }
} 