import fs from 'fs';
import path from 'path';

const TOKEN_FILE = path.join(process.cwd(), '.tokens.json');

function getStore(): Record<string, string> {
    if (!fs.existsSync(TOKEN_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    } catch { return {}; }
}

export function setToken(provider: string, token: string) {
    const store = getStore();
    store[provider] = token;
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(store, null, 2));
}

export function getToken(provider: string): string | undefined {
    return getStore()[provider];
}

/**
 * Common OAuth exchange logic.
 */
export async function exchangeCodeForToken(url: string, body: Record<string, string>) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body).toString(),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || data.error || 'OAuth exchange failed');
    }
    return data;
}
