import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, setToken } from '@/lib/oauthHelpers';

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

    try {
        const authHeader = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString('base64');

        // Notion slightly different exchange (needs Basic auth header)
        const response = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authHeader}`,
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.NOTION_REDIRECT_URI,
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error_description || 'Notion OAuth failed');

        setToken('notion', data.access_token);
        const baseUrl = process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI?.replace('/api/oauth/notion', '') || 'http://localhost:3000';
        return NextResponse.redirect(new URL('/', baseUrl));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
