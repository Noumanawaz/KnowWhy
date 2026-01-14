import { NextRequest, NextResponse } from 'next/server';
import { readGithubRepo } from '@/lib/integrations/githubReader';
import { chunkText } from '@/lib/textChunker';
import { addChunksToVectorStore } from '@/lib/embeddingStore';
import genAI from '@/lib/geminiClient';
import { getToken } from '@/lib/oauthHelpers';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { resourceId } = await req.json();
        if (!resourceId) return NextResponse.json({ error: 'No repository selected' }, { status: 400 });

        const token = await getToken(session.id, 'github') || process.env.GITHUB_TOKEN;
        if (!token) {
            return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
        }

        console.log(`Syncing GitHub repo: ${resourceId}`);
        // Extract owner and repo from resourceId (which might be "owner/repo" or just "repo")
        // The frontend seems to send "owner/repo"
        const [owner, repo] = resourceId.split('/');

        if (!owner || !repo) {
            return NextResponse.json({ error: 'Invalid repository format' }, { status: 400 });
        }

        const docs = await readGithubRepo(owner, repo, token);
        const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

        for (const doc of docs) {
            const chunks = chunkText(doc.content);
            const chunksWithEmbeddings = await Promise.all(
                chunks.map(async (text, index) => {
                    const result = await embedModel.embedContent(text);
                    const embedding = result.embedding.values;
                    return {
                        id: `${doc.sourceId}-${index}-${Date.now()}`,
                        documentName: doc.title,
                        text,
                        embedding,
                        userId: session.id,
                        source: 'github'
                    };
                })
            );

            await addChunksToVectorStore(chunksWithEmbeddings);
        }

        return NextResponse.json({ success: true, count: docs.length });
    } catch (error: any) {
        console.error('GitHub Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
