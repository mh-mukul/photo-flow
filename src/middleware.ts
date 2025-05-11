import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const LOGIN_COOKIE_NAME = 'admin-session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if trying to access admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get(LOGIN_COOKIE_NAME);

    if (!sessionCookie || sessionCookie.value !== 'true') {
      // Not authenticated, redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If on login page and already authenticated, redirect to admin dashboard
  if (pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get(LOGIN_COOKIE_NAME);
    if (sessionCookie && sessionCookie.value === 'true') {
      const adminUrl = new URL('/admin/photos', request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
