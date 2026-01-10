import pdf from 'pdf-parse';

/**
 * Extracts raw text from buffered file content based on type.
 */
export async function parseDocument(buffer: Buffer, originalName: string): Promise<string> {
    const extension = originalName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf': {
            const data = await pdf(buffer);
            return data.text;
        }
        case 'md':
        case 'txt':
            return buffer.toString('utf-8');
        default:
            throw new Error(`Unsupported file type: ${extension}`);
    }
}
