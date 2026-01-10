import { Client } from '@notionhq/client';
import { getToken } from '../oauthHelpers';

export type KnowledgeDocument = {
    source: "slack" | "notion" | "github";
    sourceId: string;
    title: string;
    content: string;
};

/**
 * Fetches pages from a specific Notion database.
 */
export async function readNotionDatabase(databaseId: string, customToken?: string): Promise<KnowledgeDocument[]> {
    const token = customToken || getToken('notion') || process.env.NOTION_API_KEY;
    if (!token) throw new Error('Notion access token is missing');

    const notion = new Client({ auth: token });
    const response = await (notion.databases as any).query({
        database_id: databaseId,
    });

    const documents: KnowledgeDocument[] = [];
    for (const page of response.results) {
        if (!('properties' in page)) continue;
        const titleProp = (page.properties.Name || page.properties.Title) as any;
        const title = titleProp?.title?.[0]?.plain_text || 'Untitled Notion Page';

        const blocks = await notion.blocks.children.list({ block_id: page.id });
        const content = blocks.results
            .map((block: any) => block.paragraph?.rich_text?.[0]?.plain_text || '')
            .filter(text => text.length > 0)
            .join('\n');

        documents.push({ source: "notion", sourceId: page.id, title, content });
    }
    return documents;
}
