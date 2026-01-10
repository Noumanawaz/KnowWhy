import { DocumentChunk } from './embeddingStore';

/**
 * Calculates cosine similarity between two vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        mA += vecA[i] * vecA[i];
        mB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

/**
 * Searches for the most relevant chunks in the index.
 */
export function findRelevantChunks(queryEmbedding: number[], index: DocumentChunk[], topK: number = 3): DocumentChunk[] {
    const scores = index.map(chunk => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.chunk);
}
