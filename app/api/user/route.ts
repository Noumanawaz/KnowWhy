import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { email: true, id: true, createdAt: true }
    });

    if (!user) {
        // Fallback if DB record missing but session valid (should be handled by middleware/other fixes, but safe fallback)
        return NextResponse.json({ email: session.email || 'User' });
    }

    return NextResponse.json(user);
}
