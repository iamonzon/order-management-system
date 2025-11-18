# Order Management System

A production-ready RESTful API service for managing orders, customers, and products, built with TypeScript, Express, and PostgreSQL. This project demonstrates clean architecture principles, SOLID design patterns, and enterprise-grade development practices.

## Overview

This service implements a complete order management system with a focus on:
- **Clean Architecture**: Clear separation of concerns across Controller, Service, and Repository layers
- **Type Safety**: End-to-end type safety from API requests to database queries
- **Production Readiness**: Comprehensive error handling, graceful shutdown, and transaction management
- **Developer Experience**: Excellent tooling, testing infrastructure, and documentation

## Architecture

### Layered Architecture

The application follows a strict three-layer architecture:

```
┌─────────────────────────────────────────────┐
│         Controller Layer                     │
│  - HTTP request/response handling            │
│  - Status code management                    │
│  - Route parameter extraction                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Service Layer                        │
│  - Business logic (e.g., total calculation)  │
│  - Domain validation                         │
│  - Cross-domain orchestration                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Repository Layer                     │
│  - Database access                           │
│  - Transaction management                    │
│  - Query construction                        │
└─────────────────────────────────────────────┘
```

**Benefits:**
- Single Responsibility: Each layer has one reason to change
- Testability: Easy to mock dependencies and test in isolation
- Maintainability: Clear boundaries make refactoring safer
- Scalability: Can independently optimize each layer

### Dependency Injection

The application uses a type-safe dependency injection container (`src/core/container.ts`) that:
- Creates singleton instances of all services
- Provides explicit dependency wiring (no magic/reflection)
- Enables easy testing through dependency replacement
- Ensures compile-time safety with TypeScript types

```typescript
const container = {
  db: pool,
  v1: {
    orderController: new OrderController(orderService),
    customerController: new CustomerController(customerService)
  }
};
```

### Database Access Patterns

**Connection Pooling:**
- Uses `pg` library's connection pool for efficient resource utilization
- Configurable pool size (default: 20 connections)
- Automatic connection reuse prevents exhaustion under load

**Transaction Management:**
- `withTransaction` utility handles BEGIN/COMMIT/ROLLBACK automatically
- Ensures ACID properties for multi-step operations
- Automatic client release back to pool
- Clean error propagation

```typescript
return withTransaction(this.dbPool, async client => {
  // All queries use the same client within transaction
  await client.query('INSERT INTO orders ...');
  await client.query('INSERT INTO order_items ...');
  // Automatic COMMIT on success, ROLLBACK on error
});
```

### Validation Strategy

**Zod for Runtime Validation:**
- Schema-first approach with automatic TypeScript type inference
- Single source of truth for both validation and types
- Detailed error messages with field-level validation

```typescript
const CreateOrderDTOSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1)
});

// Automatic type inference
type CreateOrderDTO = z.infer<typeof CreateOrderDTOSchema>;
```

### Error Handling

**Custom Error Hierarchy:**
```
AppError (base class)
├── NotFoundError (404)
├── ValidationError (400)
└── UnprocessableEntityError (422)
```

**Centralized Error Handler:**
- Consistent JSON error responses
- Stack traces in development mode only
- Security-conscious production messages
- Detailed validation error reporting

### Graceful Shutdown

Production-grade shutdown mechanism that:
- Handles SIGTERM (Docker/Kubernetes) and SIGINT (Ctrl+C)
- Executes cleanup handlers in LIFO order
- Prevents connection leaks and data corruption
- Configurable timeout to prevent hanging

```typescript
const shutdown = new GracefulShutdown(10000);
shutdown.register(async () => await pool.end());
shutdown.register(async () => server.close());
shutdown.listen();
```

## Domain Model

### Database Schema

```sql
customers
├── id (UUID, PK)
├── name
├── email
├── phone
└── timestamps

products
├── id (UUID, PK)
├── sku
├── name
├── price
├── stock_quantity
└── timestamps

orders
├── id (UUID, PK)
├── customer_id (FK → customers)
└── timestamps

order_items
├── id (UUID, PK)
├── order_id (FK → orders)
├── product_id (FK → products)
├── product_name (denormalized)
├── price (denormalized)
└── quantity
```

**Key Design Decisions:**
- **UUIDs for primary keys**: Better for distributed systems, prevent ID enumeration
- **Denormalized order items**: Preserves historical accuracy even if products change
- **Foreign key constraints**: Ensures referential integrity at database level
- **Timestamps everywhere**: Essential for audit trails and debugging

## API Endpoints

### Orders

**Create Order**
```http
POST /api/v1/orders
Content-Type: application/json

{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ]
}

Response: 201 Created
{
  "id": "uuid",
  "customerId": "uuid",
  "items": [...],
  "total": 199.98,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Get Order**
```http
GET /api/v1/orders/:id

Response: 200 OK
{
  "id": "uuid",
  "customer": { "id": "uuid", "name": "John Doe" },
  "items": [
    {
      "id": "uuid",
      "productName": "Widget",
      "price": "99.99",
      "quantity": 2
    }
  ],
  "total": "199.98",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Customers

**Create Customer**
```http
POST /api/v1/customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}

Response: 201 Created
```

**Get Customer**
```http
GET /api/v1/customers/:id

Response: 200 OK
```

**List Customers**
```http
GET /api/v1/customers

Response: 200 OK
```

### Health Check

```http
GET /api/health

Response: 200 OK
{ "status": "healthy" }
```

## Technology Stack

### Core
- **TypeScript** - Type safety and superior developer experience
- **Express 5** - Fast, unopinionated web framework
- **PostgreSQL** - Robust relational database with ACID guarantees
- **Zod** - Schema validation with TypeScript integration

### Middleware & Utilities
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **http-status-codes** - Standardized status code constants

### Development Tools
- **tsx** - Fast TypeScript execution with hot reload
- **Node.js Test Runner** - Built-in testing (no external dependencies)
- **node-pg-migrate** - Database migration management
- **Docker Compose** - Local development environment

## Getting Started

### Prerequisites
- Node.js 18+ (uses native test runner)
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd order-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run migrate:up
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Development Workflow

**Running the application:**
```bash
npm run dev          # Development with hot reload
npm start            # Production mode (requires build)
npm run build        # Compile TypeScript to JavaScript
```

**Testing:**
```bash
npm test             # Run all tests with coverage
npm run test:watch   # Watch mode for TDD
```

**Database operations:**
```bash
npm run migrate:up              # Apply pending migrations
npm run migrate:down            # Rollback last migration
npm run migrate:create <name>   # Create new migration
```

**Infrastructure:**
```bash
docker-compose up       # Start PostgreSQL + Jaeger
docker-compose down     # Stop all services
docker-compose logs -f  # View service logs
```

## Testing Strategy

### Transactional Tests

All tests run within transactions that are automatically rolled back:

```typescript
await withTransactionalTest(pool, async (client) => {
  // Test code here - all changes will be rolled back
  const customer = await createTestCustomer(client);
  const product = await createTestProduct(client);
  // ... test order creation
});
```

**Benefits:**
- No test data pollution
- Parallel test execution
- No cleanup code needed
- Fast execution (no actual commits)

### Test Organization

```
test/
├── setup.ts                    # Test environment configuration
├── helpers/
│   └── transactional-test.ts   # Transaction wrapper
├── customers/
│   └── customer.fixtures.ts    # Customer test data factories
├── products/
│   └── product.fixtures.ts     # Product test data factories
└── orders/
    └── orders.repository.tests.ts  # Order repository tests
```

## Project Structure

```
order-management-system/
├── src/
│   ├── core/
│   │   └── container.ts              # Dependency injection
│   ├── db/
│   │   ├── pool.ts                   # Database connection pool
│   │   ├── postgress-errors.ts       # Error type mapping
│   │   └── migrations/               # Schema migrations
│   ├── middleware/
│   │   ├── error-handler.ts          # Centralized error handling
│   │   ├── not-found-handler.ts      # 404 handler
│   │   └── validate-body.ts          # Request validation
│   ├── types/
│   │   └── app-error.ts              # Error class hierarchy
│   ├── utils/
│   │   ├── graceful-shutdown.ts      # Shutdown management
│   │   ├── transactions.ts           # Transaction helper
│   │   └── errors.ts                 # Error utilities
│   ├── routes/
│   │   ├── index.ts                  # Main router
│   │   ├── health.ts                 # Health check endpoint
│   │   └── v1/                       # API v1 routes
│   ├── customer/                     # Customer domain
│   │   ├── customer.ts               # Entity
│   │   ├── customer.dto.ts           # DTOs + schemas
│   │   ├── customer.repository.ts    # Data access
│   │   ├── customer.service.ts       # Business logic
│   │   ├── customer.controller.ts    # HTTP handling
│   │   └── customer.error.ts         # Domain errors
│   ├── order/                        # Order domain
│   ├── product/                      # Product domain
│   ├── app.ts                        # Express application
│   └── server.ts                     # HTTP server + lifecycle
├── test/                             # Test suite
├── .env.example                      # Environment template
├── .env.test                         # Test environment
├── docker-compose.yml                # Local infrastructure
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
└── CLAUDE.md                         # Developer documentation
```

## Key Features & Highlights

### 1. Type Safety End-to-End
- TypeScript strict mode enabled
- Zod schemas provide runtime validation AND compile-time types
- No `any` types in production code
- Full IDE autocomplete from API to database

### 2. Transaction Safety
- Automatic transaction management for complex operations
- ACID guarantees for order creation (order + items in one transaction)
- Connection pool prevents resource leaks
- Automatic rollback on errors

### 3. Production-Ready Error Handling
- Never exposes internal errors to clients
- Structured error responses with details
- Stack traces only in development
- Proper HTTP status codes

### 4. Scalable Architecture
- Horizontal scaling ready (stateless)
- Connection pooling handles high concurrency
- Versioned API for backward compatibility
- Database migrations for safe schema evolution

### 5. Developer Experience
- Hot reload in development (tsx watch)
- Comprehensive tests with automatic cleanup
- Clear documentation (README + CLAUDE.md)
- Consistent coding patterns across domains

### 6. Security
- Helmet for security headers
- CORS configuration
- SQL injection prevention via parameterized queries
- Input validation on all endpoints
- UUID primary keys prevent enumeration attacks

## Performance Considerations

1. **Connection Pooling**: Reuses database connections instead of creating new ones
2. **Denormalization**: order_items stores product data to avoid joins on reads
3. **Transactions**: Only used when necessary (e.g., order creation)
4. **Indexes**: Foreign keys automatically indexed by PostgreSQL
5. **Request Size Limits**: Body parser limited to 10MB

## Future Enhancements

- [ ] Authentication & authorization (JWT)
- [ ] Pagination for list endpoints
- [ ] Full-text search for products
- [ ] Inventory management (stock updates)
- [ ] Order status workflow (pending → fulfilled → cancelled)
- [ ] OpenTelemetry integration with Jaeger
- [ ] Rate limiting
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Docker production image
- [ ] CI/CD pipeline
- [ ] Monitoring & alerting

## License

MIT

## Contact

For questions or feedback about this project, please open an issue.

---

**Built with careful attention to clean code principles and production best practices.**
