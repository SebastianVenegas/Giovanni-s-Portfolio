// This script initializes the database with the required tables
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some Neon connections
  }
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Creating contacts table...');
    
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
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase();