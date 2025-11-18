import { DatabaseError, Pool } from "pg";
import { Customer } from "./customer";
import { PG_ERRORS } from "../db/postgress-errors";
import { DuplicateCustomerError } from "./customer.error";

export class CustomerRepository {
  constructor(private dbPool: Pool) { }

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