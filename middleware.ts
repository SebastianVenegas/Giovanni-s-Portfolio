import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Check if the path is for the admin page
  if (path === '/admin' || path.startsWith('/admin/')) {
    // Skip API routes
    if (path.startsWith('/admin/api/')) {
      return NextResponse.next()
    }
    
    // Get the admin auth cookie
    const hasAuthCookie = request.cookies.has('admin_authenticated')
    
    // Check admin auth
    if (!hasAuthCookie) {
      // Redirect to the admin access page
      const url = request.nextUrl.clone()
      url.pathname = '/admin-access'
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin', '/admin/:path*'],
} 