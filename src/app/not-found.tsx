'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4">
      <div className="w-16 h-16 mb-6 opacity-60">
        <Image 
          src="/GV Fav.png" 
          alt="Logo" 
          width={64} 
          height={64}
          className="dark:invert-0 invert"
        />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center max-w-md">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/"
          className="px-6 py-3 rounded-lg bg-zinc-800 dark:bg-zinc-700 text-white font-medium hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
        >
          Go to Homepage
        </Link>
        
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  )
} 