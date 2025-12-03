import { DatabaseError, Pool } from "pg";
import { Customer } from "./customer";
import { PG_ERRORS } from "../db/postgress-errors";
import { CustomerNotFoundError, DuplicateCustomerError } from "./customer.error";
import { PaginatedResult } from "../types/pagination";

export class CustomerRepository {
  constructor(private dbPool: Pool) { }

  async findById(id: number): Promise<Customer> {
    const result = await this.dbPool.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new CustomerNotFoundError(id);
    }

    return result.rows[0];
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<Customer>> {
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      this.dbPool.query(
        'SELECT * FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      this.dbPool.query('SELECT COUNT(*) FROM customers')
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

  async find(email: string): Promise<Customer | null> {
    const result = await this.dbPool.query(`
      SELECT * FROM customers WHERE email=$1
    `, [email])

    if (result.rowCount === 0)
      return null;
    return result.rows[0];
  }

  async insert(data: {
    email: string,
    name: string
  }): Promise<Customer> {
    try {
      const result = await this.dbPool.query(`
        INSERT INTO customers (email, name) 
        VALUES ($1, $2) 
        RETURNING *
      `, [data.email, data.name]);
      return result.rows[0];
    } catch (error) {
      console.error("Error at insert customer", error)
      if (error instanceof DatabaseError && error.code === PG_ERRORS.UNIQUE_VIOLATION) {
        throw new DuplicateCustomerError(data.email);
      }
      throw error;
    }
  }
}