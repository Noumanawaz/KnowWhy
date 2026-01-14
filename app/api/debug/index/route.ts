import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const docName = searchParams.get('doc');

    try {
        if (docName) {
            // Find chunks for the specific document
            // Using raw query to reliably query JSONB metadata
            const chunks = await prisma.$queryRaw<Array<{ id: string, content: string }>>`
                SELECT id, content 
                FROM "DocumentChunk" 
                WHERE metadata->>'title' = ${docName}
            `;

            return NextResponse.json({
                document: docName,
                chunksCount: chunks.length,
                chunks: chunks.map(c => ({ id: c.id, text: c.content }))
            });
        }

        // List all unique documents
        const documentsList = await prisma.$queryRaw<Array<{ title: string }>>`
            SELECT DISTINCT metadata->>'title' as title
            FROM "DocumentChunk"
            WHERE metadata->>'title' IS NOT NULL
        `;

        const totalChunks = await prisma.documentChunk.count(); // Fast count

        const documents = documentsList.map(d => d.title);

        return NextResponse.json({
            documents,
            chunksCount: totalChunks
        });

    } catch (error) {
        console.error('Debug route error:', error);
        return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 });
    }
}
