import { CustomerController } from '../customer/customer.controller';
import { CustomerRepository } from '../customer/customer.repository';
import { CustomerService } from '../customer/customer.service';
import pool from '../db/pool'
import { OrderController } from '../order/order.controller';
import { OrderRepository } from '../order/order.repository'
import { OrderService } from '../order/order.service'

const orderRepository = new OrderRepository(pool);
const customerRepository = new CustomerRepository(pool);

const orderService = new OrderService(orderRepository);
const customerService = new CustomerService(customerRepository);

const orderController = new OrderController(orderService);
const customerController = new CustomerController(customerService);

export const container = {
  db: pool,

  v1: {
    orderController: orderController,
    customerController: customerController
  }
}

export type Container = typeof container;