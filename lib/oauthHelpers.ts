import prisma from './prisma';
import { encrypt, decrypt } from './crypto';

// Replaces the old file-based storage
// NOW: Stores securely in Postgres per user

export async function storeToken(userId: string, provider: string, token: string, refreshToken?: string, expiresAt?: Date) {
    const encryptedToken = encrypt(token);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    // Upsert: Create or Update if exists for this user+provider
    await prisma.integration.upsert({
        where: {
            userId_provider: {
                userId,
                provider
            }
        },
        update: {
            accessToken: encryptedToken,
            refreshToken: encryptedRefreshToken,
            expiresAt: expiresAt || null
        },
        create: {
            userId,
            provider,
            accessToken: encryptedToken,
            refreshToken: encryptedRefreshToken,
            expiresAt: expiresAt || null
        }
    });
}

export async function getToken(userId: string, provider: string): Promise<string | null> {
    const integration = await prisma.integration.findUnique({
        where: {
            userId_provider: {
                userId,
                provider
            }
        }
    });

    if (!integration) return null;
    try {
        return decrypt(integration.accessToken);
    } catch (e) {
        console.error(`Failed to decrypt token for user ${userId} provider ${provider}`, e);
        return null;
    }
}

export async function getRefreshToken(userId: string, provider: string): Promise<string | null> {
    const integration = await prisma.integration.findUnique({
        where: {
            userId_provider: {
                userId,
                provider
            }
        }
    });

    if (!integration || !integration.refreshToken) return null;
    try {
        return decrypt(integration.refreshToken);
    } catch (e) {
        return null;
    }
}

// Helper to exchange code for token (remains mostly same, but returns object)
export async function exchangeCodeForToken(url: string, body: any): Promise<any> {
    const params = new URLSearchParams(body);
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: params
    });
    return res.json();
}
