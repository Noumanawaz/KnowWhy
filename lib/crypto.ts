import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCODING = 'hex';
const IV_LENGTH = 16;
const KEY = process.env.ENCRYPTION_KEY || ''; // Must be 32 chars

export function encrypt(text: string): string {
    if (!KEY) throw new Error('ENCRYPTION_KEY is not defined');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString(ENCODING) + ':' + encrypted.toString(ENCODING);
}

export function decrypt(text: string): string {
    if (!KEY) throw new Error('ENCRYPTION_KEY is not defined');
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, ENCODING);
    const encryptedText = Buffer.from(textParts.join(':'), ENCODING);
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
