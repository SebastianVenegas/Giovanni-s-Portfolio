'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error page caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-900 text-white">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Something went wrong</h1>
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-6 text-left overflow-auto">
          <pre className="text-xs text-red-300 whitespace-pre-wrap">{error.message}</pre>
        </div>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 