import prisma from './prisma';
// Updated to use addChunksToVectorStore

export interface DocumentChunk {
    id: string;
    documentName: string;
    text: string;
    embedding: number[];
    userId: string;
    source?: string;
}

export async function addChunksToVectorStore(chunks: DocumentChunk[]) {
    try {
        for (const chunk of chunks) {
            console.log('Indexing chunk:', chunk.id);
            // Use raw query for vector insertion as Prisma 7 vector support in typed client is preview
            // casting the embedding array to string representation of vector
            const embeddingString = `[${chunk.embedding.join(',')}]`;

            await prisma.$executeRaw`
                INSERT INTO "DocumentChunk" (id, content, embedding, metadata, "userId")
                VALUES (
                    ${chunk.id}, 
                    ${chunk.text}, 
                    ${embeddingString}::vector, 
                    ${{ title: chunk.documentName, source: chunk.source }}::jsonb, 
                    ${chunk.userId}
                )
                ON CONFLICT (id) DO UPDATE SET
                    content = EXCLUDED.content,
                    embedding = EXCLUDED.embedding,
                    metadata = EXCLUDED.metadata;
            `;
        }
        console.log(`Successfully indexed ${chunks.length} chunks via pgvector`);
    } catch (error) {
        console.error('Error adding chunks to pgvector:', error);
        throw error;
    }
}

export async function querySimilarChunks(embedding: number[], userId: string, matchThreshold: number = 0.5, matchCount: number = 5) {
    const embeddingString = `[${embedding.join(',')}]`;

    // Cosine distance operator is <=>
    // We want distance < 1 - threshold (roughly) or just order by distance
    // Lower distance = higher similarity

    try {
        const results = await prisma.$queryRaw`
            SELECT id, content, metadata, 1 - (embedding <=> ${embeddingString}::vector) as similarity
            FROM "DocumentChunk"
            WHERE "userId" = ${userId}
            AND 1 - (embedding <=> ${embeddingString}::vector) > ${matchThreshold}
            ORDER BY similarity DESC
            LIMIT ${matchCount};
        `;

        return (results as any[]).map(r => ({
            id: r.id,
            text: r.content,
            documentName: r.metadata?.title || 'Untitled',
            source: r.metadata?.source || 'Unknown',
            similarity: r.similarity
        }));
    } catch (error) {
        console.error('Error querying similar chunks:', error);
        return [];
    }
}

export async function resetIndex(userId: string) {
    // Only delete for specific user
    await prisma.documentChunk.deleteMany({
        where: { userId }
    });
}
