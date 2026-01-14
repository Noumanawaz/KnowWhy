import { NextRequest, NextResponse } from 'next/server';
import { readNotionDatabase } from '@/lib/integrations/notionReader';
import { chunkText } from '@/lib/textChunker';
import { addChunksToVectorStore } from '@/lib/embeddingStore';
import genAI from '@/lib/geminiClient';
import { getToken } from '@/lib/oauthHelpers';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

import { Client } from '@notionhq/client';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = await getToken(session.id, 'notion') || process.env.NOTION_API_KEY;
        if (!token) throw new Error('Please connect Notion first');

        const notion = new Client({ auth: token });
        const response = await notion.search({}); // Fetch everything we can access

        let allDocs: any[] = [];
        let successCount = 0;
        let failCount = 0;

        console.log(`Starting sync for ${response.results.length} Notion resources...`);

        for (const item of response.results) {
            try {
                // item.object should be 'database' or 'page'
                const objectType = item.object as 'database' | 'page';
                const docs = await readNotionDatabase(item.id, objectType, token);
                allDocs = [...allDocs, ...docs];
                successCount++;
            } catch (err: any) {
                console.error(`Failed to sync Notion resource ${item.id}:`, err);
                failCount++;
            }
        }

        const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

        for (const doc of allDocs) {
            const chunks = chunkText(doc.content);
            const chunksWithEmbeddings = await Promise.all(
                chunks.map(async (text, index) => {
                    const result = await embedModel.embedContent(text);
                    return {
                        id: `notion-${doc.sourceId}-${index}`,
                        documentName: doc.title,
                        text,
                        embedding: result.embedding.values,
                        userId: session.id,
                        source: 'notion'
                    };
                })
            );
            await addChunksToVectorStore(chunksWithEmbeddings);
        }

        return NextResponse.json({
            count: allDocs.length,
            resourcesProcessed: response.results.length,
            success: successCount,
            failed: failCount
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
