/**
 * Simple in-memory storage for document chunks and their embeddings.
 */

export interface DocumentChunk {
    id: string;
    documentName: string;
    text: string;
    embedding: number[];
}

// Global variable survives across HMR in dev but will be lost if process restarts.
// For a production app, use a real vector DB.
const globalStore = global as unknown as { documentIndex: DocumentChunk[] };

if (!globalStore.documentIndex) {
    globalStore.documentIndex = [];
}

export const documentIndex = globalStore.documentIndex;

export function addChunksToIndex(chunks: DocumentChunk[]) {
    globalStore.documentIndex.push(...chunks);
}
