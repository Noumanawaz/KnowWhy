import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/oauthHelpers';
import { Client } from '@notionhq/client';

export async function GET() {
    const token = getToken('notion') || process.env.NOTION_API_KEY;
    if (!token) return NextResponse.json({ error: 'Not connected to Notion' }, { status: 401 });

    try {
        const notion = new Client({ auth: token });
        // Use search to find databases user has shared with the integration
        const response = await notion.search({
            filter: { property: 'object', value: 'database' as any },
        });

        const databases = response.results.map((db: any) => ({
            id: db.id,
            name: db.title?.[0]?.plain_text || 'Untitled Database',
        }));

        return NextResponse.json(databases);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
