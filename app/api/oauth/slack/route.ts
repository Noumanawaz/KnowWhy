import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, setToken } from '@/lib/oauthHelpers';

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

    try {
        const data = await exchangeCodeForToken('https://slack.com/api/oauth.v2.access', {
            client_id: process.env.SLACK_CLIENT_ID!,
            client_secret: process.env.SLACK_CLIENT_SECRET!,
            code,
            redirect_uri: process.env.SLACK_REDIRECT_URI!,
        });

        setToken('slack', data.access_token);
        const baseUrl = process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI?.replace('/api/oauth/slack', '') || 'http://localhost:3000';
        return NextResponse.redirect(new URL('/', baseUrl));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
