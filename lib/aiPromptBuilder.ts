import { DocumentChunk } from './embeddingStore';

/**
 * Builds the prompt for OpenAI based on context chunks and user question.
 */
export function buildPrompt(question: string, context: { id: string; text: string; documentName: string }[]): string {
  const contextText = context.map(c => `[Source: ${c.documentName} - Chunk: ${c.id}]\n${c.text}`).join('\n\n');

  return `
    You are an AI company knowledge explainer. Your task is to answer the user's question based ONLY on the provided context.
    
    Context:
    ${contextText}
    
    Question:
    ${question}
    
    If the answer is not fully supported by the provided context, explicitly state what is missing.
    Never hallucinate. Cite your sources using the document name explicitly (e.g., "Readme.md", "Project Specs"). Do NOT use the internal ID (e.g., "notion-123...").
    
    Return your response in EXACTLY this JSON format:
    {
      "answer": "A detailed and comprehensive answer to the question. Include specific examples, code snippets (if applicable), and nuances found in the text.",
      "explanation": "A deeper explanation of how the answer was derived from the sources.",
      "sources": ["Fine Tuning of Model", "AI Meeting Notes Demo", "Slack #general"],
      "confidence": 0.0 to 1.0 based on how well the context supports the answer,
      "gaps": ["Any specific information that was missing to provide a complete answer"]
    }
  `;
}
