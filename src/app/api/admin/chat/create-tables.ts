import { createClient } from '@vercel/postgres';

/**
 * Validates that the necessary database tables for chat functionality exist.
 * Uses the existing contacts and chat_logs tables.
 * 
 * @returns A string indicating the result of the operation
 */
export async function createAdminChatTables(): Promise<string> {
  try {
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Check if tables exist
    const contactsTableExists = await client.sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contacts'
      );
    `;
    
    const chatLogsTableExists = await client.sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'chat_logs'
      );
    `;
    
    // Log table existence status
    console.log(`Contacts table exists: ${contactsTableExists.rows[0]?.exists}`);
    console.log(`Chat logs table exists: ${chatLogsTableExists.rows[0]?.exists}`);
    
    if (!contactsTableExists.rows[0]?.exists || !chatLogsTableExists.rows[0]?.exists) {
      console.warn('One or more required tables do not exist. The chat functionality may not work correctly.');
    }
    
    await client.end();
    return "Admin chat tables validation complete";
  } catch (error) {
    console.error("Error validating chat tables:", error);
    return `Error validating chat tables: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
} 