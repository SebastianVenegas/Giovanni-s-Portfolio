import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Check if the path is for the admin page (but not admin-access)
  if (path === '/admin' || path.startsWith('/admin/')) {
    // For security, we'll redirect to the admin-access page if accessed directly
    // The actual authentication happens client-side in the admin page
    const url = request.nextUrl.clone()
    url.pathname = '/admin-access'
    
    // Only redirect if this is a direct browser request (not an API call)
    const isApiRequest = request.headers.get('accept')?.includes('application/json')
    if (!isApiRequest) {
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin', '/admin/:path*'],
} 