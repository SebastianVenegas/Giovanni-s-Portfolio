// Mock database schema

// Contacts table definition
export const contacts = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  created_at: 'created_at'
};

// Conversations table definition
export const conversations = {
  id: 'id',
  contact_id: 'contact_id',
  title: 'title',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

// Messages table definition
export const messages = {
  id: 'id',
  conversation_id: 'conversation_id',
  role: 'role',
  content: 'content',
  created_at: 'created_at'
}; 