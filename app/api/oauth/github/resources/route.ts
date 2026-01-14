import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { getToken } from '@/lib/oauthHelpers';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = await getToken(session.id, 'github') || process.env.GITHUB_TOKEN;

    if (!token) {
        return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
    }

    try {
        const octokit = new Octokit({ auth: token });
        // detailed fetching for 50 repos might timeout/rate-limit, limiting to top 10 most recently updated
        const response = await octokit.rest.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 10,
        });

        const reposWithDetails = await Promise.all(response.data.map(async (repo) => {
            const owner = repo.owner.login;
            const name = repo.name;

            try {
                const [commits, pulls, issues] = await Promise.all([
                    octokit.rest.repos.listCommits({ owner, repo: name, per_page: 5 }),
                    octokit.rest.pulls.list({ owner, repo: name, state: 'all', per_page: 5 }),
                    octokit.rest.issues.listForRepo({ owner, repo: name, state: 'all', per_page: 5 })
                ]);

                return {
                    id: repo.full_name,
                    name: repo.full_name,
                    description: repo.description,
                    url: repo.html_url,
                    commits: commits.data.map(c => ({
                        message: c.commit.message,
                        author: c.commit.author?.name,
                        date: c.commit.author?.date,
                        url: c.html_url
                    })),
                    pull_requests: pulls.data.map(pr => ({
                        title: pr.title,
                        state: pr.state,
                        url: pr.html_url,
                        created_at: pr.created_at
                    })),
                    issues: issues.data.filter((i: any) => !i.pull_request).map((i: any) => ({
                        title: i.title,
                        state: i.state,
                        url: i.html_url,
                        created_at: i.created_at
                    }))
                };
            } catch (err) {
                console.error(`Failed to fetch details for ${repo.full_name}`, err);
                return {
                    id: repo.full_name,
                    name: repo.full_name,
                    error: 'Failed to fetch details'
                };
            }
        }));

        return NextResponse.json(reposWithDetails);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
