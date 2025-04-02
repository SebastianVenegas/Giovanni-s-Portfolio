import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Check if the path is for the admin page
  if (path === '/admin' || path.startsWith('/admin/')) {
    // Skip API routes - API routes handle their own authentication
    if (path.startsWith('/admin/api/')) {
      return NextResponse.next()
    }
    
    // Check if coming from admin-access page
    const fromAdminAccess = request.headers.get('referer')?.includes('/admin-access')
    
    // Check if the admin_api_key cookie exists
    const hasAuthCookie = request.cookies.has('admin_api_key')
    
    console.log(`Admin access attempt: Path=${path}, FromAdminAccess=${fromAdminAccess}, HasAuthCookie=${hasAuthCookie}`)
    
    // If no auth cookie and not coming from admin-access, redirect
    if (!hasAuthCookie && !fromAdminAccess) {
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