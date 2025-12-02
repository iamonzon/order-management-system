import { createSchema, createYoga } from "graphql-yoga";
import { Router } from "express";
import { Container } from "../core/container";

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
    product(id: ID!): Product
    order(id: ID!): Order
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
        product: async (_: unknown, { id }: { id: string }) => {
          try {
            return await productService.findProduct(Number(id));
          } catch {
            return null;
          }
        },
        order: async (_: unknown, { id }: { id: string }) => {
          try {
            return await orderService.findOrder(Number(id));
          } catch {
            return null;
          }
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
