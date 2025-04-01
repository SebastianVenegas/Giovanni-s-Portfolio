import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  // This is a mock DB connection - in production you would use real credentials
  connectionString: process.env.DATABASE_URL,
});

// Custom db object with better TypeScript support
const db = {
  /**
   * Execute a SQL query and return properly typed results
   * @param text SQL query to execute
   * @param params Query parameters
   * @returns Array of result objects
   */
  query: async <T extends Record<string, any>>(text: string, params?: any[]): Promise<T[]> => {
    try {
      const result = await pool.query(text, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  /**
   * Get a client from the pool for transaction support
   */
  getClient: async () => {
    const client = await pool.connect();
    return client;
  }
};

export { db }; 