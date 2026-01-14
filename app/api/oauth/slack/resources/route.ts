import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/oauthHelpers';
import { getSession } from '@/lib/auth';
import { WebClient } from '@slack/web-api';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = await getToken(session.id, 'slack') || process.env.SLACK_BOT_TOKEN;

    if (!token) {
        return NextResponse.json({ error: 'Slack not connected' }, { status: 401 });
    }

    try {
        const slack = new WebClient(token);

        // Debugging: Check scopes and log to file
        const authTest = await slack.auth.test();
        const logPath = path.join(process.cwd(), 'slack_debug.log');

        const result = await slack.conversations.list({
            types: 'public_channel,private_channel',
            limit: 1000
        });

        const logData = `\n--- ${new Date().toISOString()} ---\nAuth Test: ${JSON.stringify(authTest)}\nChannels Found: ${result.channels?.length}\nChannel Names: ${result.channels?.map(c => c.name).join(', ')}\nResponse Metadata: ${JSON.stringify(result.response_metadata)}\n`;
        fs.appendFileSync(logPath, logData);


        const channels = (result.channels || []).map(c => ({
            id: c.id,
            name: c.name,
        }));

        return NextResponse.json(channels);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
