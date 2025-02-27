"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from 'date-fns'

interface Message {
  id: number
  contact_id: number
  session_id: string
  role: string
  content: string
  created_at: string
}

interface Session {
  sessionId: string
  messages: Message[]
}

interface Contact {
  id: number
  name: string
  phone_number: string
  created_at: string
}

interface ChatData {
  contact: Contact
  sessions: Session[]
}

export default function AdminPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chatData, setChatData] = useState<ChatData[]>([])
  const [error, setError] = useState('')
  
  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // Fetch chat data with API key
      const response = await fetch('/api/admin/chats', {
        headers: {
          'x-api-key': apiKey
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key')
        }
        throw new Error('Failed to fetch chat data')
      }
      
      const data = await response.json()
      setChatData(data.chats)
      setIsAuthenticated(true)
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch (e) {
      return dateString
    }
  }
  
  // Render login form
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your API key to access chat logs</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="apiKey"
                    placeholder="Enter API key"
                    type="password"
                    value={apiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }
  
  // Render chat data
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Chat Logs</h1>
        <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Logout</Button>
      </div>
      
      {chatData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No chat data available</p>
        </div>
      ) : (
        <div className="space-y-8">
          {chatData.map((chat) => (
            <Card key={chat.contact.id} className="overflow-hidden">
              <CardHeader className="bg-gray-100 dark:bg-gray-800">
                <CardTitle>{chat.contact.name}</CardTitle>
                <CardDescription>
                  Phone: {chat.contact.phone_number} | 
                  Joined: {formatDate(chat.contact.created_at)} | 
                  Sessions: {chat.sessions.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue={chat.sessions[0]?.sessionId} className="w-full">
                  <TabsList className="w-full justify-start overflow-auto p-0 h-auto">
                    {chat.sessions.map((session) => (
                      <TabsTrigger 
                        key={session.sessionId} 
                        value={session.sessionId}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Session {session.sessionId.substring(0, 8)}...
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {chat.sessions.map((session) => (
                    <TabsContent key={session.sessionId} value={session.sessionId} className="p-0">
                      <div className="border-t">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900">
                          <p className="text-sm text-gray-500">
                            Session ID: {session.sessionId} | 
                            Messages: {session.messages.length} | 
                            Started: {formatDate(session.messages[0]?.created_at)}
                          </p>
                        </div>
                        <div className="divide-y">
                          {session.messages.map((message) => (
                            <div 
                              key={message.id} 
                              className={`p-4 ${
                                message.role === 'user' 
                                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                                  : 'bg-gray-50 dark:bg-gray-800/50'
                              }`}
                            >
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">
                                  {message.role === 'user' ? 'User' : 'NextGio AI'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(message.created_at)}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 