import { Pool, PoolClient } from 'pg';

let pool: Pool;

export async function setupTestPool(connectionString: string) {
  pool = new Pool({ connectionString });
}

export async function closeTestPool() {
  await pool.end();
}

export async function withTransaction<T>(
  testFn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await testFn(client);
    await client.query('ROLLBACK');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function getPool(): Pool {
  return pool;
}