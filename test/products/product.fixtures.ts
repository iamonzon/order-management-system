import { PoolClient } from 'pg';

export async function createProduct(
  client: PoolClient,
  data: { name?: string; price?: number; stock_quantity?: number } = {}
) {
  const result = await client.query(
    'INSERT INTO products (name, price, stock_quantity) VALUES ($1, $2, $3) RETURNING *',
    [
      data.name || 'Test Product',
      data.price || 29.99,
      data.stock_quantity || 100
    ]
  );
  return result.rows[0];
}