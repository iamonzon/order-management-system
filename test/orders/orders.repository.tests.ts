import { describe, it } from 'node:test';
import assert from 'node:assert';
import { withTransaction } from '../helpers/transactional-test';
import { createCustomer } from '../helpers/fixtures/customer.fixtures';
import { createProduct } from '../helpers/fixtures/product.fixtures';
import { OrderRepository } from '../../src/orders/order.repository';

describe('OrderRepository', () => {
  it('should create order with valid data', async () => {
    await withTransaction(async (client) => {
      const customer = await createCustomer(client);
      const product = await createProduct(client, { price: 50.00 });

      const repo = new OrderRepository(client);
      const order = await repo.createOrder({
        customer_id: customer.id,
        items: [{ product_id: product.id, quantity: 2 }]
      });

      assert.ok(order.id);
      assert.strictEqual(order.customer_id, customer.id);
      assert.strictEqual(Number(order.total_amount), 100.00);
    });
  });

  it('should throw error when customer does not exist', async () => {
    await withTransaction(async (client) => {
      const product = await createProduct(client);
      const repo = new OrderRepository(client);
      
      await assert.rejects(
        () => repo.createOrder({
          customer_id: 99999,
          items: [{ product_id: product.id, quantity: 1 }]
        }),
        (error: any) => error.code === '23503'
      );
    });
  });
});