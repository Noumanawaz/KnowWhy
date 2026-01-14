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
    const token = customToken || process.env.SLACK_BOT_TOKEN;

    if (!token) {
        throw new Error("Slack token not found");
    }

    const slack = new WebClient(token);

    let response;
    let channelInfo;
    try {
        const info = await slack.conversations.info({ channel: channelId });
        channelInfo = info.channel;
        response = await slack.conversations.history({ channel: channelId, limit: 1000 });
    } catch (error: any) {
        if (error?.data?.error === 'not_in_channel') {
            try {
                await slack.conversations.join({ channel: channelId });
                const info = await slack.conversations.info({ channel: channelId });
                channelInfo = info.channel;
                response = await slack.conversations.history({ channel: channelId, limit: 1000 });
            } catch (joinError) {
                throw new Error(`Please invite the 'KnowWhy' bot to the channel #${channelId} manually, then try sinking again.`);
            }
        } else {
            throw error;
        }
    }

    if (!response || !response.ok) throw new Error(`Slack API error: ${response?.error}`);

    const channelName = channelInfo?.name || channelId;

    // Sort chronological: oldest first
    const messages = (response.messages || [])
        .filter(m => !m.bot_id && m.text)
        .reverse();

    const transcript = messages.map(m => {
        const time = new Date(parseFloat(m.ts!) * 1000).toLocaleString();
        const user = m.user ? `User ${m.user}` : 'User';
        return `[${time}] ${user}: ${m.text}`;
    }).join('\n');

    return [{
        source: "slack",
        sourceId: channelId, // ID is channel ID now, not message ID
        title: `Slack Transcript (#${channelName})`,
        content: transcript
    }];
}

/**
 * Fetches all users from the Slack workspace.
 */
export async function readSlackUsers(customToken?: string): Promise<string> {
    const token = customToken || process.env.SLACK_BOT_TOKEN;

    if (!token) {
        console.warn("Slack token not found for user sync");
        return "";
    }
    const slack = new WebClient(token);
    const response = await slack.users.list({ limit: 1000 });

    if (!response.ok || !response.members) {
        console.warn('Failed to fetch Slack users:', response.error);
        return "";
    }

    return response.members
        .filter(u => !u.deleted && !u.is_bot && u.name !== 'slackbot')
        .map(user => `Name: ${user.real_name || user.name}, Email: ${user.profile?.email || 'N/A'}`)
        .join('\n');
}
