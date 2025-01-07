import type {NextRequest} from 'next/server';
import {notFound} from 'next/navigation';

import {auth0} from '../lib/auth0';

/**
 * AUTH0 middleware
 * @param {NextRequest} request
 * @return {NextResponse} res
 */
export async function middleware(request: NextRequest) {
  const res = await auth0.middleware(request);
  const session = await auth0.getSession();

  if (!session) {
    notFound();
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
