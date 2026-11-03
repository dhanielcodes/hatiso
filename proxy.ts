import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutePrefix = '/dashboard';
const authRoutes = new Set(['/auth/login', '/auth/register']);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get('hasito_auth_token')?.value);

  if (pathname.startsWith(protectedRoutePrefix) && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (authRoutes.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/register'],
};
