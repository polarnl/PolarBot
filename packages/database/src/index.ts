export { PrismaClient, Prisma } from '@prisma/client';
export type * from '@prisma/client';

// Re-export a configured instance
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;