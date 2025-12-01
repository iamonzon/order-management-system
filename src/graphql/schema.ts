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

  input CreateCustomerInput {
    name: String!
    email: String!
  }

  type Query {
    customer(email: String!): Customer
  }

  type Mutation {
    createCustomer(input: CreateCustomerInput!): Customer!
  }
`;

export function createGraphQLRoutes(container: Container) {
  const { customerService } = container.services;

  const schema = createSchema({
    typeDefs,
    resolvers: {
      Query: {
        customer: async (_: unknown, { email }: { email: string }) => {
          return customerService.findByEmail(email);
        },
      },
      Mutation: {
        createCustomer: async (
          _: unknown,
          { input }: { input: { name: string; email: string } }
        ) => {
          return customerService.createCustomer(input);
        },
      },
    },
  });

  const yoga = createYoga({ schema });
  const router = Router();

  router.use("/", yoga);

  return router;
}
