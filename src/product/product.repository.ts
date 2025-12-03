import { DatabaseError, Pool } from "pg";
import { Product } from "./product";
import { PG_ERRORS } from "../db/postgress-errors";
import { NegativeProductPriceError, NegativeProductStock, ProductNotFoundError } from "./product.errors";
import { PaginatedResult } from "../types/pagination";

export class ProductRepository {
  constructor(private db: Pool) { }

  async findById(id: number): Promise<Product> {
    const result = await this.db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new ProductNotFoundError(id);
    }

    return result.rows[0];
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<Product>> {
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      this.db.query(
        'SELECT * FROM products ORDER BY id DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      this.db.query('SELECT COUNT(*) FROM products')
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

  async insertProduct(data: {
    name: string, price: number, stock_quantity: number
  }): Promise<Product> {
    try {
      const results = await this.db.query(`
        INSERT into PRODUCT (name, price, stock_quantity) 
        VALUES ($1, $2, $3)
        RETURNING *
      `, [data.name, data.price, data.stock_quantity]);

      return results.rows[0];
    } catch (error) {
      console.error("Error inserting Product", error);
      if (error instanceof DatabaseError && error.code === PG_ERRORS.CONSTRAIN_VIOLATION) {
        if (error.constraint === "products_price_positive") {
          throw new NegativeProductPriceError(data.name, data.price);
        }
        if (error.constraint === "products_stock_non_negative") {
          throw new NegativeProductStock(data.name, data.stock_quantity);
        }
        throw error;
      }
      throw error;
    }

  }

}