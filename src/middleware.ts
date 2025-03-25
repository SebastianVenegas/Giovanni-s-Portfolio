import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Check if the path is for the admin page (but not admin-access)
  if (path === '/admin' || path.startsWith('/admin/')) {
    // Get the referer to check if user is coming from admin-access page
    const referer = request.headers.get('referer') || '';
    const isFromAdminAccess = referer.includes('/admin-access');
    
    // Only redirect if this is a direct browser request (not an API call)
    // AND not coming from the admin-access page
    const isApiRequest = request.headers.get('accept')?.includes('application/json');
    
    // Add a check for a potential cookie we can set to verify authentication
    const hasAuthCookie = request.cookies.has('admin_authenticated');
    
    console.log(`Admin access attempt: Path=${path}, FromAdminAccess=${isFromAdminAccess}, HasAuthCookie=${hasAuthCookie}`);
    
    if (!isApiRequest && !isFromAdminAccess && !hasAuthCookie) {
      // For security, we'll redirect to the admin-access page if accessed directly
      const url = request.nextUrl.clone();
      url.pathname = '/admin-access';
      
      return NextResponse.redirect(url);
    }
    
    // If coming from admin-access, set a cookie to maintain auth state
    if (isFromAdminAccess && !hasAuthCookie) {
      const response = NextResponse.next();
      // Set a simple cookie to maintain authenticated state
      response.cookies.set('admin_authenticated', 'true', {
        maxAge: 3600, // 1 hour
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
      });
      return response;
    }
  }
  
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin', '/admin/:path*'],
} 