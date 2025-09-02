import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/blogs/create',
  '/submit-tool',
  '/profile',
  '/settings',
  '/set-password'
];

// Define auth routes that authenticated users shouldn't access
const authRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/blogs',
  '/tools',
  '/learn',
  '/test-connection'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has session cookie (basic check)
  const hasSession = request.cookies.has('a_session_console') || 
                     request.cookies.has('a_session_console_legacy');

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle auth routes - redirect to dashboard if already authenticated
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (hasSession) {
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Allow access to public routes and other paths
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};
