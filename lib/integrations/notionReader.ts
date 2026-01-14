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
export async function readNotionDatabase(resourceId: string, itemType: 'database' | 'page', customToken?: string): Promise<KnowledgeDocument[]> {
    const token = customToken || process.env.NOTION_API_KEY;
    if (!token) throw new Error('Notion access token is missing');

    const notion = new Client({ auth: token });
    const documents: KnowledgeDocument[] = [];

    try {
        if (itemType === 'page') {
            // It is a page, process it directly
            let title = 'Untitled Notion Page';

            try {
                const pageObj = await notion.pages.retrieve({ page_id: resourceId });
                const page = pageObj as any;
                if (page.properties) {
                    const titleProp = Object.values(page.properties).find((p: any) => p.type === 'title') as any;
                    title = titleProp?.title?.[0]?.plain_text || title;
                } else if (page.title && Array.isArray(page.title)) {
                    title = page.title[0]?.plain_text || title;
                }
            } catch (e) {
                console.warn(`Could not retrieve metadata for page ${resourceId}, using default title.`);
            }

            const blocks = await notion.blocks.children.list({ block_id: resourceId });
            const content = await extractContentFromBlocks(notion, blocks.results);
            documents.push({ source: "notion", sourceId: resourceId, title, content });

        } else if (itemType === 'database') {
            const response = await (notion.databases as any).query({
                database_id: resourceId,
            });

            for (const page of response.results) {
                if (!('properties' in page)) continue;

                let title = 'Untitled Notion Page';
                const titleProp = Object.values(page.properties).find((p: any) => p.type === 'title') as any;
                if (titleProp) {
                    title = titleProp.title?.[0]?.plain_text || title;
                }

                const blocks = await notion.blocks.children.list({ block_id: page.id });
                const content = await extractContentFromBlocks(notion, blocks.results);

                documents.push({ source: "notion", sourceId: page.id, title, content });
            }
        }
    } catch (error: any) {
        console.error("Notion sync error:", error);
        throw new Error(`Failed to sync Notion resource: ${error.message}`);
    }

    return documents;
}

// Helper to extract text from various block types
async function extractContentFromBlocks(notion: any, blocks: any[]): Promise<string> {
    const lines: string[] = [];

    for (const block of blocks) {
        const type = block.type;
        let text = '';

        if (['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item', 'to_do', 'toggle', 'quote', 'callout'].includes(type)) {
            text = block[type].rich_text.map((t: any) => t.plain_text).join('');
        }

        if (text) {
            if (type === 'to_do') {
                text = `[${block.to_do.checked ? 'x' : ' '}] ${text}`;
            } else if (type === 'bulleted_list_item') {
                text = `• ${text}`;
            } else if (type === 'numbered_list_item') {
                text = `1. ${text}`;
            }
            lines.push(text);
        }

        if (block.has_children) {
            try {
                const childBlocks = await notion.blocks.children.list({ block_id: block.id });
                const childContent = await extractContentFromBlocks(notion, childBlocks.results);
                lines.push(childContent.split('\n').map((l: string) => `  ${l}`).join('\n')); // Indent children
            } catch (e) {
                // Ignore child fetch errors
            }
        }
    }
    return lines.join('\n');
}
