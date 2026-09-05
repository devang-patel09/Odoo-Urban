import app from './app';
import { env } from './config/env';
import prisma from './config/db';

const server = app.listen(env.PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`[Urban Furniture Backend] Database connected successfully to MySQL.`);
    console.log(`[Urban Furniture Backend] Server running on http://localhost:${env.PORT}`);
  } catch (error) {
    console.error(`[Urban Furniture Backend] Database connection failed:`, error);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed, database disconnected.');
  });
});
