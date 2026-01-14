import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // Public paths that do not require authentication
    const publicPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/auth/logout'];

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    // Redirect to login if no token is present
    if (!token && !pathname.startsWith('/_next')) { // Exclude Next.js internal assets
        // API routes return 401 instead of redirect
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
