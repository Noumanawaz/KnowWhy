import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ DATABASE_URL is missing in process.env');
    }
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
} else {
    // In development, use a global variable so we don't create a new client (and pool)
    // every time hot reload happens
    if (!globalForPrisma.prisma) {
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    prisma = globalForPrisma.prisma;
}

export default prisma;
export { prisma };
