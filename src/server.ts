import 'dotenv/config';
import app from "./app";
import pool from "./db/pool";
import { GracefulShutdown } from "./utils/graceful-shutdown";

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`🚀 Server running on port ${port}`)
);

const shutdown = new GracefulShutdown(10000);
shutdown.register(async () => {
  await pool.end();
  console.log(`Database pool closed`);
})

shutdown.register(async () => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('HTTP server closed');
      resolve();
    });
  });
})

shutdown.listen()
