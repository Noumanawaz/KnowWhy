import { NextRequest, NextResponse } from 'next/server';
import genAI from '@/lib/geminiClient';
import { querySimilarChunks } from '@/lib/embeddingStore';
import { buildPrompt } from '@/lib/aiPromptBuilder';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { question } = await req.json();

        if (!question) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        // Embed the user question using Gemini
        const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const embedResult = await embedModel.embedContent(question);
        const queryEmbedding = embedResult.embedding.values;

        // Retrieve relevant chunks from DB (Increased to 15 chunks for better context)
        const context = await querySimilarChunks(queryEmbedding, session.id, 0.45, 15);

        if (context.length === 0) {
            return NextResponse.json({
                answer: "I don't have enough context to answer that yet.",
                explanation: "No relevant documents found. Please sync some data first.",
                sources: [],
                confidence: 0,
                gaps: ["Missing knowledge base data"]
            });
        }

        // Build prompt
        const prompt = buildPrompt(question, context);

        // Generate response using Gemini
        const chatModel = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
        }, { apiVersion: 'v1' });

        const result = await chatModel.generateContent(prompt);
        let text = result.response.text();

        // Extract JSON using regex in case model wraps it in markdown blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;
        const aiResponse = JSON.parse(cleanJson || '{}');

        return NextResponse.json(aiResponse);
    } catch (error: any) {
        console.error('Question error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
