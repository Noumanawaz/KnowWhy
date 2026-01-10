import { WebClient } from '@slack/web-api';
import { getToken } from '../oauthHelpers';

export type KnowledgeDocument = {
    source: "slack" | "notion" | "github";
    sourceId: string;
    title: string;
    content: string;
};

/**
 * Fetches recent messages from a specific Slack channel.
 */
export async function readSlackChannel(channelId: string, customToken?: string): Promise<KnowledgeDocument[]> {
    const token = customToken || getToken('slack') || process.env.SLACK_BOT_TOKEN;
    if (!token) throw new Error('Slack access token is missing');

    const slack = new WebClient(token);

    let response;
    try {
        response = await slack.conversations.history({ channel: channelId, limit: 100 });
    } catch (error: any) {
        if (error?.data?.error === 'not_in_channel') {
            try {
                await slack.conversations.join({ channel: channelId });
                response = await slack.conversations.history({ channel: channelId, limit: 100 });
            } catch (joinError) {
                throw new Error(`Please invite the 'KnowWhy' bot to the channel #${channelId} manually, then try sinking again.`);
            }
        } else {
            throw error;
        }
    }

    if (!response || !response.ok) throw new Error(`Slack API error: ${response?.error}`);

    return (response.messages || [])
        .filter(m => !m.bot_id && m.text)
        .map(m => ({
            source: "slack",
            sourceId: m.ts || 'unknown',
            title: `Slack Message ${m.ts} (Channel: ${channelId})`,
            content: m.text || '',
        }));
}
