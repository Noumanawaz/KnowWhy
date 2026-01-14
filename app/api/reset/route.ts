import { NextRequest, NextResponse } from 'next/server';
import { resetIndex } from '@/lib/embeddingStore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        await resetIndex(userId);
        return NextResponse.json({ message: 'Knowledge base cleared' });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
