import { NextResponse } from 'next/server';
import { getToken } from '@/lib/oauthHelpers';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const slack = !!(await getToken(session.id, 'slack')) || !!process.env.SLACK_BOT_TOKEN;
    const notion = !!(await getToken(session.id, 'notion'));
    const github = !!(await getToken(session.id, 'github')) || !!process.env.GITHUB_TOKEN;

    return NextResponse.json({
        slack,
        notion,
        github
    });
}
