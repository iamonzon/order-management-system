# GraphQL API Guide

This document describes the GraphQL API implementation principles and usage for the Order Management System.

## Endpoint

```
POST /api/graphql
```

All GraphQL operations (queries and mutations) are sent to this single endpoint.

## Design Principles

### 1. Schema-First Design
The GraphQL schema serves as the contract between client and server. Types are defined explicitly, providing self-documentation and type safety.

### 2. Separation of Concerns
- **Schema**: Defines types, queries, and mutations (`src/graphql/schema.ts`)
- **Services**: Business logic layer (reused from REST implementation)
- **Repositories**: Data access layer (shared with REST)

### 3. Consistent Naming Conventions
- **Types**: PascalCase (e.g., `Customer`, `Order`, `Product`)
- **Fields**: camelCase (e.g., `customerId`, `totalAmount`)
- **Inputs**: PascalCase with `Input` suffix (e.g., `CreateOrderInput`)
- **Queries**: camelCase, noun-based (e.g., `customer`, `order`, `product`)
- **Mutations**: camelCase, verb-based (e.g., `createCustomer`, `createOrder`)

### 4. Nullable vs Non-Nullable
- Use `!` for fields that are always present
- Queries that find by ID return nullable types (item may not exist)
- Mutations return non-nullable types (they create/return the item or fail)

### 5. Input Types
All mutations use dedicated input types rather than inline arguments for:
- Better documentation
- Easier evolution
- Cleaner resolver signatures

## Schema Overview

### Types

```graphql
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
```

### Queries

```graphql
type Query {
  # Find customer by email (returns null if not found)
  customer(email: String!): Customer

  # Find product by ID (returns null if not found)
  product(id: ID!): Product

  # Find order by ID (returns null if not found)
  order(id: ID!): Order
}
```

### Mutations

```graphql
type Mutation {
  # Create a new customer
  createCustomer(input: CreateCustomerInput!): Customer!

  # Create a new product
  createProduct(input: CreateProductInput!): Product!

  # Create a new order
  createOrder(input: CreateOrderInput!): Order!
}
```

## Example Operations

### Query a Customer

```graphql
query GetCustomer {
  customer(email: "john@example.com") {
    id
    name
    email
    created_at
  }
}
```

### Create a Product

```graphql
mutation CreateProduct {
  createProduct(input: {
    name: "Widget"
    price: 29.99
    stock_quantity: 100
  }) {
    id
    name
    price
    stock_quantity
  }
}
```

### Query a Product

```graphql
query GetProduct {
  product(id: "1") {
    id
    name
    price
    stock_quantity
  }
}
```

### Create an Order

```graphql
mutation CreateOrder {
  createOrder(input: {
    customer_id: 1
    items: [
      { product_id: 1, quantity: 2 }
      { product_id: 2, quantity: 1 }
    ]
  }) {
    id
    status
    total_amount
    items {
      product_id
      quantity
      price_at_purchase
    }
  }
}
```

### Query an Order

```graphql
query GetOrder {
  order(id: "1") {
    id
    customer_id
    status
    total_amount
    created_at
    items {
      product_id
      quantity
      price_at_purchase
    }
  }
}
```

## Error Handling

GraphQL errors are returned in a standard format:

```json
{
  "errors": [
    {
      "message": "Product with id 999 not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["product"]
    }
  ],
  "data": {
    "product": null
  }
}
```

Business logic errors (not found, validation failures) are thrown from the service layer and automatically formatted by GraphQL Yoga.

## Testing with GraphQL Playground

When the server is running in development mode, navigate to:

```
http://localhost:3000/api/graphql
```

This opens GraphQL Yoga's built-in playground where you can:
- Write and execute queries/mutations
- Explore the schema documentation
- View query history

## REST vs GraphQL Comparison

| Operation | REST | GraphQL |
|-----------|------|---------|
| Get customer | `GET /v1/customers?email=x` | `query { customer(email: "x") {...} }` |
| Create customer | `POST /v1/customers` | `mutation { createCustomer(input: {...}) {...} }` |
| Get product | `GET /v1/products/:id` | `query { product(id: "1") {...} }` |
| Create product | `POST /v1/products` | `mutation { createProduct(input: {...}) {...} }` |
| Get order | `GET /v1/orders/:id` | `query { order(id: "1") {...} }` |
| Create order | `POST /v1/orders` | `mutation { createOrder(input: {...}) {...} }` |

## Architecture

```
Client Request
      │
      ▼
┌─────────────────┐
│  GraphQL Yoga   │  ← Parses query, validates against schema
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Resolvers    │  ← Maps operations to service methods
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Services     │  ← Business logic (shared with REST)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repositories   │  ← Database access (shared with REST)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```
