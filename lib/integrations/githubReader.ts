import { Octokit } from 'octokit';
import { getToken } from '../oauthHelpers';

export type KnowledgeDocument = {
    source: "slack" | "notion" | "github";
    sourceId: string;
    title: string;
    content: string;
};

/**
 * Fetches README and open issues from a specific GitHub repository.
 */
export async function readGithubRepo(owner: string, repo: string, customToken?: string): Promise<KnowledgeDocument[]> {
    const token = customToken || process.env.GITHUB_TOKEN;

    if (!token) {
        throw new Error("GitHub token not found");
    }

    const octokit = new Octokit({ auth: token });

    const documents: KnowledgeDocument[] = [];

    // 1. Fetch README
    try {
        const readme = await octokit.rest.repos.getReadme({ owner, repo });
        documents.push({
            source: "github",
            sourceId: 'readme',
            title: `${owner}/${repo} - README`,
            content: Buffer.from(readme.data.content, 'base64').toString(),
        });
    } catch (e) {
        console.warn('Failed to fetch README:', e);
    }

    // 2. Fetch Issues
    try {
        const issues = await octokit.rest.issues.listForRepo({ owner, repo, state: 'open', per_page: 50 });
        issues.data.forEach(issue => {
            if (issue.pull_request) return;
            documents.push({
                source: "github",
                sourceId: `issue-${issue.number}`,
                title: `GitHub Issue #${issue.number}: ${issue.title}`,
                content: issue.body || '',
            });
        });
    } catch (e) {
        console.warn('Failed to fetch Issues:', e);
    }

    // 3. Fetch Commits
    try {
        const commits = await octokit.rest.repos.listCommits({ owner, repo, per_page: 20 });
        const commitLog = commits.data.map(c => {
            const msg = c.commit.message;
            const author = c.commit.author?.name || 'Unknown';
            const date = c.commit.author?.date || 'Unknown Date';
            return `[${date}] ${author}: ${msg}`;
        }).join('\n\n');

        if (commitLog) {
            documents.push({
                source: "github",
                sourceId: 'commits',
                title: `${owner}/${repo} - Recent Commits`,
                content: commitLog
            });
        }
    } catch (e) {
        console.warn('Failed to fetch Commits:', e);
    }
    return documents;
}
