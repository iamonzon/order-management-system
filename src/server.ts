import 'dotenv/config';
import app from "./app";
import pool from "./db/pool";
import { GracefulShutdown } from "./utils/graceful-shutdown";

async function checkDatabaseConnection(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    console.log(`✅ Database connection verified: ${process.env.DATABASE_URL}`);
  } catch (error) {
    console.error(`❌ Failed to connect to database: ${process.env.DATABASE_URL}`, error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function startServer(): Promise<void> {
  await checkDatabaseConnection();

  const port = process.env.PORT || 3000;
  const server = app.listen(port, () =>
    console.log(`🚀 Server running on port ${port}`)
  );

  const shutdown = new GracefulShutdown(10000);
  shutdown.register(async () => {
    await pool.end();
    console.log(`Database pool closed`);
  });

  shutdown.register(async () => {
    return new Promise((resolve) => {
      server.close(() => {
        console.log('HTTP server closed');
        resolve();
      });
    });
  });

  shutdown.listen();
}

startServer();
