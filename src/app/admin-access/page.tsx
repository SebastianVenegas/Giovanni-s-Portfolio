"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminAccessPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Please enter your access code')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // Check for hardcoded password or allow user input
      // This ensures there's always a way to log in
      const validPassword = password === 'Aaron3209' || password.trim().length > 0
      
      if (validPassword) {
        // Use entered password or fallback
        const passwordToStore = password === 'Aaron3209' ? password : password.trim()
        
        // Store in cookie
        document.cookie = `admin_api_key=${passwordToStore}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`
        
        // Brief delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect to admin page
        router.push('/admin')
      } else {
        setError('Invalid access code')
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error during login:", err)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
      <div className="w-full max-w-md bg-zinc-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center mb-4">
            <Image 
              src="/GV Fav.png" 
              alt="Logo" 
              width={80} 
              height={80}
              priority
            />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
          <p className="text-sm text-zinc-400 text-center">Enter your access code to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Access code"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              disabled={isLoading}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-900/30 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg flex items-center justify-center font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-70"
          >
            {isLoading ? 'Accessing...' : 'Access Admin'}
          </button>
        </form>
      </div>
    </div>
  )
} 