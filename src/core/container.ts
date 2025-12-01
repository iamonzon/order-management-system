import { CustomerController } from '../customer/customer.controller';
import { CustomerRepository } from '../customer/customer.repository';
import { CustomerService } from '../customer/customer.service';
import pool from '../db/pool'
import { OrderController } from '../order/order.controller';
import { OrderRepository } from '../order/order.repository'
import { OrderService } from '../order/order.service'
import { ProductController } from '../product/product.controller';
import { ProductRepository } from '../product/product.repository';
import { ProductService } from '../product/product.service';

const orderRepository = new OrderRepository(pool);
const customerRepository = new CustomerRepository(pool);
const productRepository = new ProductRepository(pool);

const orderService = new OrderService(orderRepository);
const customerService = new CustomerService(customerRepository);
const productService = new ProductService(productRepository);

const orderController = new OrderController(orderService);
const customerController = new CustomerController(customerService);
const productController = new ProductController(productService);

export const container = {
  db: pool,

  services: {
    orderService: orderService,
    customerService: customerService,
  },

  v1: {
    orderController: orderController,
    customerController: customerController,
    productController: productController,
  }
}

export type Container = typeof container;