import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/oauthHelpers';
import { Octokit } from 'octokit';

export async function GET() {
    const token = getToken('github') || process.env.GITHUB_TOKEN;
    if (!token) return NextResponse.json({ error: 'Not connected to GitHub' }, { status: 401 });

    try {
        const octokit = new Octokit({ auth: token });
        const response = await octokit.rest.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 50,
        });

        const repos = response.data.map(repo => ({
            id: repo.full_name,
            name: repo.full_name,
        }));

        return NextResponse.json(repos);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
