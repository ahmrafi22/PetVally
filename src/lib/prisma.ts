import { PrismaClient } from "@prisma/client"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma



//Keep NeonDB alive by pinging 
// async function keepNeonAlive() {
//   try {
//     await prisma.$queryRaw`SELECT 1`;
//     console.log("NeonDB is alive");
//   } catch (error) {
//     console.error("NeonDB connection failed ", error);
//   }
// }

// Keep the connection alive in development
// if (process.env.NODE_ENV !== "production") {
//   setInterval(keepNeonAlive, 240000); // Ping every 4 minutes
// }
