import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/oauthHelpers';
import { WebClient } from '@slack/web-api';

export async function GET() {
    const token = getToken('slack') || process.env.SLACK_BOT_TOKEN;
    if (!token) return NextResponse.json({ error: 'Not connected to Slack' }, { status: 401 });

    try {
        const slack = new WebClient(token);
        const result = await slack.conversations.list({ types: 'public_channel,private_channel' });

        const channels = (result.channels || []).map(c => ({
            id: c.id,
            name: c.name,
        }));

        return NextResponse.json(channels);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
