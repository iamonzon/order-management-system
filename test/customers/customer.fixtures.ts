import { PoolClient } from 'pg';

export async function createCustomer(
  client: PoolClient,
  data: { email?: string; name?: string } = {}
) {
  const result = await client.query(
    'INSERT INTO customers (email, name) VALUES ($1, $2) RETURNING *',
    [
      data.email || `test-${Date.now()}@example.com`,
      data.name || 'Test Customer'
    ]
  );
  return result.rows[0];
}