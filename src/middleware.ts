import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('infistyle_session')?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/checkout');

  // 1. Redirect to login if token is missing on protected routes
  if (!sessionToken && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (sessionToken) {
    const claims = parseJwt(sessionToken);
    
    // Check if token has expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (!claims || (claims.exp && claims.exp < currentTimestamp)) {
      if (isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('next', path);
        // Clear expired session cookie
        const response = NextResponse.redirect(url);
        response.cookies.delete('infistyle_session');
        return response;
      }
    }

    // 2. Redirect non-admins trying to access /admin
    if (path.startsWith('/admin')) {
      const groups = claims?.['cognito:groups'] || [];
      const isAdmin = claims && (groups.includes('Admin') || claims.email === 'admin@infistyle.com' || claims.isAdmin === true);
      
      if (!isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/checkout/:path*',
  ],
};
