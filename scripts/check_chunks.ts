import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
    try {
        const count = await prisma.documentChunk.count();
        console.log(`Total DocumentChunks: ${count}`);

        const chunks = await prisma.documentChunk.findMany({
            select: { metadata: true }
        });

        const sources: Record<string, number> = {};
        chunks.forEach(c => {
            const meta = c.metadata as any;
            const source = meta?.source || 'unknown';
            sources[source] = (sources[source] || 0) + 1;
        });

        console.log('Counts by Source:', sources);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
