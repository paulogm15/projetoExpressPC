import { PrismaClient } from "@/generated/prisma";

export function prismaGetInstance() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL, 
      },
    },
  });

  return prisma;
}
