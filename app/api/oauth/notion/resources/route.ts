import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/oauthHelpers';
import { getSession } from '@/lib/auth';
import { Client } from '@notionhq/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = await getToken(session.id, 'notion') || process.env.NOTION_API_KEY;
    if (!token) return NextResponse.json({ error: 'Not connected to Notion' }, { status: 401 });

    try {
        const notion = new Client({ auth: token });
        // Use search to find databases user has shared with the integration
        const response = await notion.search({});
        console.log(`Notion search returned ${response.results.length} results.`);
        if (response.results.length > 0) {
            console.log('First result sample:', JSON.stringify(response.results[0], null, 2));
        }

        const resources = response.results
            .filter((item: any) => item.object === 'database' || item.object === 'page')
            .map((item: any) => {
                let name = 'Untitled';
                if (item.object === 'database') {
                    name = item.title?.[0]?.plain_text || 'Untitled Database';
                } else if (item.object === 'page') {
                    // Page titles are usually in properties.Name.title or properties.title.title
                    const props = item.properties;
                    const titleProp = Object.values(props).find((p: any) => p.type === 'title') as any;
                    name = titleProp?.title?.[0]?.plain_text || 'Untitled Page';
                }
                return {
                    id: item.id,
                    name: `${item.object === 'database' ? '📚' : '📄'} ${name}`,
                };
            });

        return NextResponse.json(resources);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
