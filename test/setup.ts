import migrate from 'node-pg-migrate'
import path from 'path';
import { setupTestPool, closeTestPool } from './helpers/transactional-test';

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://myapp:password@localhost:5432/myapp_test';

export async function setup() {
  console.log('Running migrations...');
  
  await migrate({
    databaseUrl: TEST_DATABASE_URL,
    dir: path.join(__dirname, '../src/migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
  });

  await setupTestPool(TEST_DATABASE_URL);
  console.log('Test database ready');
}

export async function teardown() {
  await closeTestPool();
}