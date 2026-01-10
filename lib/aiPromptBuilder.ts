import { DocumentChunk } from './embeddingStore';

/**
 * Builds the prompt for OpenAI based on context chunks and user question.
 */
export function buildPrompt(question: string, context: DocumentChunk[]): string {
  const contextText = context.map(c => `[Source: ${c.documentName} - Chunk: ${c.id}]\n${c.text}`).join('\n\n');

  return `
    You are an AI company knowledge explainer. Your task is to answer the user's question based ONLY on the provided context.
    
    Context:
    ${contextText}
    
    Question:
    ${question}
    
    If the answer is not fully supported by the provided context, explicitly state what is missing.
    Never hallucinate. Cite your sources using the source/chunk ID provided in the context.
    
    Return your response in EXACTLY this JSON format:
    {
      "answer": "A clear, concise answer to the question.",
      "explanation": "A deeper explanation of how the answer was derived from the sources.",
      "sources": ["Slack (#engineering) - msg123", "Notion (Onboarding) - page456", "GitHub (README) - readme", "doc_name - chunk_id"],
      "confidence": 0.0 to 1.0 based on how well the context supports the answer,
      "gaps": ["Any specific information that was missing to provide a complete answer"]
    }
  `;
}
