import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, storeToken } from '@/lib/oauthHelpers';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await exchangeCodeForToken('https://github.com/login/oauth/access_token', {
            client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code,
            redirect_uri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!,
        });

        if (data.error) throw new Error(data.error_description || 'Failed to exchange token');

        // Store token in DB for this user
        await storeToken(session.id, 'github', data.access_token);

        const baseUrl = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI?.replace('/api/oauth/github', '') || 'http://localhost:3000';
        return NextResponse.redirect(new URL('/', baseUrl));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
