import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/documentParser';
import { chunkText } from '@/lib/textChunker';
import { addChunksToIndex } from '@/lib/embeddingStore';
import genAI from '@/lib/geminiClient';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const rawText = await parseDocument(buffer, file.name);
        const textChunks = chunkText(rawText);

        // Get embedding model
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

        // Generate embeddings for each chunk
        const chunksWithEmbeddings = await Promise.all(
            textChunks.map(async (text, index) => {
                const result = await model.embedContent(text);
                return {
                    id: `${file.name}-${index}`,
                    documentName: file.name,
                    text,
                    embedding: result.embedding.values,
                };
            })
        );

        addChunksToIndex(chunksWithEmbeddings);

        return NextResponse.json({
            message: 'Document uploaded and indexed successfully (using Gemini)',
            chunks: textChunks.length
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
