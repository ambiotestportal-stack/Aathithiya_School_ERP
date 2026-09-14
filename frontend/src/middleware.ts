import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  let role = null;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Malformed token — treat as unauthenticated
        role = null;
      } else {
        const payload = parts[1];
        // Convert Base64Url to Base64
        let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with '='
        while (base64.length % 4) {
          base64 += '=';
        }
        const decodedPayload = JSON.parse(atob(base64));
        role = decodedPayload.role;
      }
    } catch (e) {
      console.error("Failed to decode token in middleware", e);
    }
  }
  
  const { pathname } = request.nextUrl;

  // Authentication redirects
  if (!token && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/admin') && role !== 'SUPER_ADMIN' && role !== 'SUB_ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (pathname.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/teacher') && role !== 'TEACHER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/parent') && role !== 'PARENT') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access landing page while already logged in
  if (pathname === '/' && token) {
    switch(role) {
      case 'SUPER_ADMIN':
      case 'SUB_ADMIN': return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      case 'STUDENT': return NextResponse.redirect(new URL('/student/dashboard', request.url));
      case 'TEACHER': return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
      case 'PARENT': return NextResponse.redirect(new URL('/parent/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/parent/:path*'
  ],
};
