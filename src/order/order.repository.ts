import { DatabaseError, Pool } from "pg";
import { CustomerNotFoundError } from "../customer/customer.error";
import { withTransaction } from "../utils/transactions";
import { Order, OrderItem } from "./order";
import { InvalidOrderDataError, OrderNotFoundError } from "./order.errors";
import { PG_ERRORS } from "../db/postgress-errors";
import { ProductNotFoundError } from "../product/product.errors";
import { PaginatedResult } from "../types/pagination";

export class OrderRepository {
  constructor(private dbPool: Pool) { }

  async findOrder(id: number): Promise<Order> {
    const result = await this.dbPool.query(`
        SELECT
          o.*,
          json_agg(json_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'price', oi.price
          )) as items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.id = $1
        GROUP BY o.id
      `, [id]);

    if (result.rowCount === 0)
      throw new OrderNotFoundError(id)
    return result.rows[0]
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<Order>> {
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      this.dbPool.query(`
        SELECT
          o.*,
          json_agg(json_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'price', oi.price
          )) as items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
      this.dbPool.query('SELECT COUNT(*) FROM orders')
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createOrder(data: {
    customer_id: number;
    items: OrderItem[]
  }): Promise<Order> {
    return withTransaction(this.dbPool, async client => {
      try {
        // Get current prices for all products
        const productIds = data.items.map(i => i.product_id);
        const products = await client.query(
          'SELECT id, price, stock_quantity FROM products WHERE id = ANY($1)',
          [productIds]
        );

        if (products.rows.length !== productIds.length) {
          throw new ProductNotFoundError();
        }

        // Calculate total from actual DB prices
        let total = 0;
        const itemsWithPrices = data.items.map(item => {
          const product = products.rows.find(p => p.id === item.product_id);
          const itemTotal = product.price * item.quantity;
          total += itemTotal;
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: product.price
          };
        });

        const orderResult = await client.query(
          'INSERT INTO orders (customer_id, status, total_amount) VALUES ($1, $2, $3) RETURNING *',
          [data.customer_id, 'pending', total]
        );

        const createdOrder = orderResult.rows[0];

        // Bulk insert instead of loop
        const itemsValues = itemsWithPrices.map((item, idx) =>
          `($1, $${idx * 3 + 2}, $${idx * 3 + 3}, $${idx * 3 + 4})`
        ).join(',');

        const itemsParams = [createdOrder.id, ...itemsWithPrices.flatMap(
          i => [i.product_id, i.quantity, i.price_at_purchase]
        )];

        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
             VALUES ${itemsValues}`,
          itemsParams
        );

        for (const item of itemsWithPrices) {
          await client.query(
            'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }

        return createdOrder;
      } catch (error) {
        if (error instanceof DatabaseError) {
          if (error.code === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
            if (error.constraint?.includes('customer')) {
              throw new CustomerNotFoundError(data.customer_id);
            }
            if (error.constraint?.includes('product')) {
              throw new ProductNotFoundError();
            }
          }
          if (error.code === PG_ERRORS.CONSTRAIN_VIOLATION) {
            throw new InvalidOrderDataError(error.message);
          }
        } else
          throw error;
      }
    })
  }
}