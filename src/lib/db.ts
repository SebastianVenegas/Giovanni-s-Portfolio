import { Pool } from 'pg';

// Create a PostgreSQL pool
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined
});

let pool: Pool | null = null;
const connectionConfig = {
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
};

// Initialize database connection pool
export async function initializeDatabase() {
  try {
    if (pool) {
      console.log('Database pool already exists, skipping initialization');
      return pool;
    }

    // Create a new pool
    pool = new Pool({
      ...connectionConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    // Add error handler to pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Test the connection
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    // Create necessary tables if they don't exist
    await createTablesIfNotExist(client);
    
    client.release();
    console.log('Database initialized successfully');
    
    return pool;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Get pool client
export async function getPoolClient() {
  if (!pool) {
    await initializeDatabase();
  }
  return pool;
}

// For serverless environments, create a new client for each request
export async function getClient() {
  const { Client } = await import('pg');
  // Create client with proper type handling
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });
  await client.connect();
  return client;
}

// Create necessary tables if they don't exist
async function createTablesIfNotExist(client: any) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_logs (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id),
        session_id VARCHAR(100),
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Save contact information
export async function saveContact(name: string, phoneNumber: string) {
  try {
    if (!pool) {
      await initializeDatabase();
    }
    
    const result = await pool!.query(
      'INSERT INTO contacts (name, phone_number) VALUES ($1, $2) RETURNING id',
      [name, phoneNumber]
    );
    
    console.log('Contact saved successfully with ID:', result.rows[0].id);
    return { id: result.rows[0].id };
  } catch (error) {
    console.error('Error saving contact:', error);
    throw error;
  }
}

// Save individual chat message
export async function saveChatMessage(
  contactId: number,
  sessionId: string | undefined,
  role: string,
  content: string
) {
  try {
    console.log(`DB: Saving message: contactId=${contactId}, sessionId=${sessionId}, role=${role}, content length=${content.length}`);
    
    if (!pool) {
      console.log('DB: No pool exists, initializing database...');
      await initializeDatabase();
      console.log('DB: Database initialized successfully');
    }
    
    // Make sure we have a valid sessionId (use UUID if none provided)
    const finalSessionId = sessionId || `session-${Date.now()}`;
    
    console.log('DB: Executing INSERT query...');
    console.log('DB: Connection details:', {
      poolSize: pool?.totalCount,
      idleCount: pool?.idleCount,
      waitingCount: pool?.waitingCount
    });
    
    const result = await pool!.query(
      'INSERT INTO chat_logs (contact_id, session_id, role, content) VALUES ($1, $2, $3, $4) RETURNING id',
      [contactId, finalSessionId, role, content]
    );
    
    console.log('DB: Chat message saved successfully with ID:', result.rows[0].id);
    return { id: result.rows[0].id };
  } catch (error) {
    console.error('DB ERROR: Error saving chat message:', error);
    console.error('DB ERROR: Message details:', { contactId, sessionId, role, contentLength: content?.length });
    console.error('DB ERROR: Stack trace:', new Error().stack);
    
    // Try to get database status
    try {
      console.error('DB ERROR: Database pool status:', {
        poolExists: !!pool,
        poolSize: pool?.totalCount,
        idleCount: pool?.idleCount,
        waitingCount: pool?.waitingCount,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set'
      });
    } catch (statusError) {
      console.error('DB ERROR: Could not get pool status:', statusError);
    }
    
    throw error;
  }
}

// Save multiple chat messages in a batch
export async function saveChatMessages(messages: any[]) {
  try {
    if (!pool) {
      await initializeDatabase();
    }
    
    // Use Promise.all to run multiple inserts in parallel
    const results = await Promise.all(
      messages.map(msg => 
        pool!.query(
          'INSERT INTO chat_logs (contact_id, session_id, role, content) VALUES ($1, $2, $3, $4) RETURNING id',
          [msg.contactId, msg.sessionId || `session-${Date.now()}`, msg.role, msg.content]
        )
      )
    );
    
    console.log(`Saved ${results.length} chat messages`);
    return results.map(result => ({ id: result.rows[0].id }));
  } catch (error) {
    console.error('Error saving chat messages batch:', error);
    throw error;
  }
}

// Get all messages for a specific contact and session
export async function getChatMessages(contactId: number, sessionId?: string) {
  try {
    if (!pool) {
      await initializeDatabase();
    }
    
    let query = 'SELECT * FROM chat_logs WHERE contact_id = $1';
    const params: (number | string)[] = [contactId];
    
    if (sessionId) {
      query += ' AND session_id = $2';
      params.push(sessionId);
    }
    
    query += ' ORDER BY created_at ASC';
    
    const result = await pool!.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving chat messages:', error);
    throw error;
  }
}

// Get chat history for a specific contact and session
export async function getChatHistory(contactId: number, sessionId: string | null) {
  try {
    if (!pool) {
      await initializeDatabase();
    }
    
    let query = 'SELECT * FROM chat_logs WHERE contact_id = $1';
    const params: (number | string)[] = [contactId];
    
    if (sessionId) {
      query += ' AND session_id = $2';
      params.push(sessionId);
    }
    
    query += ' ORDER BY created_at ASC';
    
    const result = await pool!.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    throw error;
  }
}

// Get all contacts
export async function getContacts() {
  try {
    if (!pool) {
      await initializeDatabase();
    }
    
    const result = await pool!.query('SELECT * FROM contacts ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    throw error;
  }
} 