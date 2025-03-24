"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface UserInfoFormProps {
  onSubmit: (name: string, phoneNumber: string) => Promise<void>
  isSubmitting: boolean
}

export function UserInfoForm({ onSubmit, isSubmitting }: UserInfoFormProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: ''
  })
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({
      name: '',
      phoneNumber: ''
    })
    
    // Validate
    let isValid = true
    
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Name is required' }))
      isValid = false
    }
    
    if (!phoneNumber.trim()) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Phone number is required' }))
      isValid = false
    } else {
      // Basic phone validation
      const phoneRegex = /^[\d\+\-\(\) ]{7,20}$/
      if (!phoneRegex.test(phoneNumber)) {
        setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid phone number' }))
        isValid = false
      }
    }
    
    if (!isValid) return
    
    // Submit form
    await onSubmit(name, phoneNumber)
  }
  
  return (
    <div className="p-6 bg-white/90 dark:bg-black/90 rounded-lg shadow-md border border-black/5 dark:border-white/10">
      <h3 className="text-lg font-medium mb-4 text-center">
        Please share your contact information
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm",
              isDark 
                ? "bg-gray-800 border-gray-700 text-white focus:border-blue-600" 
                : "bg-white border-gray-300 text-black focus:border-blue-500",
              errors.name && "border-red-500"
            )}
            placeholder="Enter your name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm",
              isDark 
                ? "bg-gray-800 border-gray-700 text-white focus:border-blue-600" 
                : "bg-white border-gray-300 text-black focus:border-blue-500",
              errors.phoneNumber && "border-red-500"
            )}
            placeholder="Enter your phone number"
            disabled={isSubmitting}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full p-2.5 rounded-md transition-colors",
            isDark 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  )
} 