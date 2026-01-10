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
export async function readGitHubRepo(repoFull: string, customToken?: string): Promise<KnowledgeDocument[]> {
    const token = customToken || getToken('github') || process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GitHub access token is missing');

    const octokit = new Octokit({ auth: token });
    const [owner, repo] = repoFull.split('/');

    const documents: KnowledgeDocument[] = [];
    try {
        const readme = await octokit.rest.repos.getReadme({ owner, repo });
        documents.push({
            source: "github",
            sourceId: 'readme',
            title: `${repoFull} - README`,
            content: Buffer.from(readme.data.content, 'base64').toString(),
        });

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
    } catch (error: any) {
        throw new Error(`GitHub integration failed: ${error.message}`);
    }
    return documents;
}
