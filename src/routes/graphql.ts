import { createSchema, createYoga } from "graphql-yoga";
import { Router } from "express";
import { Container } from "../core/container";
import { MAX_LIMIT } from "../types/pagination";

const typeDefs = `
  type Customer {
    id: ID!
    name: String!
    email: String!
    created_at: String!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    stock_quantity: Int!
  }

  type OrderItem {
    id: ID!
    product_id: Int!
    quantity: Int!
    price_at_purchase: Float!
  }

  type Order {
    id: ID!
    customer_id: Int!
    status: String!
    total_amount: Float!
    created_at: String!
    items: [OrderItem!]!
  }

  type Pagination {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type CustomerList {
    data: [Customer!]!
    pagination: Pagination!
  }

  type ProductList {
    data: [Product!]!
    pagination: Pagination!
  }

  type OrderList {
    data: [Order!]!
    pagination: Pagination!
  }

  input CreateCustomerInput {
    name: String!
    email: String!
  }

  input CreateProductInput {
    name: String!
    price: Float!
    stock_quantity: Int!
  }

  input OrderItemInput {
    product_id: Int!
    quantity: Int!
  }

  input CreateOrderInput {
    customer_id: Int!
    items: [OrderItemInput!]!
  }

  type Query {
    customer(email: String!): Customer
    customers(page: Int = 1, limit: Int = 20): CustomerList!
    product(id: ID!): Product
    products(page: Int = 1, limit: Int = 20): ProductList!
    order(id: ID!): Order
    orders(page: Int = 1, limit: Int = 20): OrderList!
  }

  type Mutation {
    createCustomer(input: CreateCustomerInput!): Customer!
    createProduct(input: CreateProductInput!): Product!
    createOrder(input: CreateOrderInput!): Order!
  }
`;

export function createGraphQLRoutes(container: Container) {
  const { customerService, productService, orderService } = container.services;

  const schema = createSchema({
    typeDefs,
    resolvers: {
      Query: {
        customer: async (_: unknown, { email }: { email: string }) => {
          return customerService.findByEmail(email);
        },
        customers: async (_: unknown, { page, limit }: { page: number; limit: number }) => {
          const safeLimit = Math.min(limit, MAX_LIMIT);
          return customerService.list({ page, limit: safeLimit });
        },
        product: async (_: unknown, { id }: { id: string }) => {
          try {
            return await productService.findProduct(Number(id));
          } catch {
            return null;
          }
        },
        products: async (_: unknown, { page, limit }: { page: number; limit: number }) => {
          const safeLimit = Math.min(limit, MAX_LIMIT);
          return productService.list({ page, limit: safeLimit });
        },
        order: async (_: unknown, { id }: { id: string }) => {
          try {
            return await orderService.findOrder(Number(id));
          } catch {
            return null;
          }
        },
        orders: async (_: unknown, { page, limit }: { page: number; limit: number }) => {
          const safeLimit = Math.min(limit, MAX_LIMIT);
          return orderService.list({ page, limit: safeLimit });
        },
      },
      Mutation: {
        createCustomer: async (
          _: unknown,
          { input }: { input: { name: string; email: string } }
        ) => {
          return customerService.createCustomer(input);
        },
        createProduct: async (
          _: unknown,
          { input }: { input: { name: string; price: number; stock_quantity: number } }
        ) => {
          return productService.createProduct(input);
        },
        createOrder: async (
          _: unknown,
          { input }: { input: { customer_id: number; items: { product_id: number; quantity: number }[] } }
        ) => {
          return orderService.createOrder(input);
        },
      },
    },
  });

  const yoga = createYoga({ schema });
  const router = Router();

  router.use("/", yoga);

  return router;
}
