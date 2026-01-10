import { NextRequest, NextResponse } from 'next/server';
import { readGitHubRepo } from '@/lib/integrations/githubReader';
import { chunkText } from '@/lib/textChunker';
import { addChunksToIndex } from '@/lib/embeddingStore';
import genAI from '@/lib/geminiClient';
import { getToken } from '@/lib/oauthHelpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { resourceId } = await req.json();
        if (!resourceId) return NextResponse.json({ error: 'No repository selected' }, { status: 400 });

        const token = getToken('github') || process.env.GITHUB_TOKEN;
        if (!token) throw new Error('Please connect GitHub first');

        const docs = await readGitHubRepo(resourceId, token);
        const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

        for (const doc of docs) {
            const chunks = chunkText(doc.content);
            const chunksWithEmbeddings = await Promise.all(
                chunks.map(async (text, index) => {
                    const result = await embedModel.embedContent(text);
                    return {
                        id: `github-${doc.sourceId}-${index}`,
                        documentName: doc.title,
                        text,
                        embedding: result.embedding.values,
                    };
                })
            );
            addChunksToIndex(chunksWithEmbeddings);
        }

        return NextResponse.json({ count: docs.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
