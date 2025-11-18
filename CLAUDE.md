# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run dev` - Start development server with hot reload (uses tsx watch)
- `npm start` - Start production server (runs compiled code from dist/)
- `npm run build` - Compile TypeScript to JavaScript
- `npm run clean` - Remove dist/ directory

### Testing
- `npm test` - Run all tests with coverage
- `npm run test:watch` - Run tests in watch mode

### Infrastructure
- `docker-compose up` - Start PostgreSQL database and Jaeger tracing services
- Database runs on port 5432, Jaeger UI on 16686

### Database Migrations
- `npm run migrate:up` - Run pending migrations
- `npm run migrate:down` - Rollback last migration
- `npm run migrate:create -- migration-name` - Create new migration file
- Migrations are in `migrations/` directory using `node-pg-migrate`
- Configuration in `.node-pg-migraterc.json`

## Architecture Overview

### Layered Architecture
The codebase follows a three-layer architecture:

1. **Controller Layer** (`src/order/OrderController.ts`)
   - Handles HTTP requests/responses
   - Uses `asyncHandler` wrapper to catch async errors
   - Returns appropriate HTTP status codes via `http-status-codes`

2. **Service Layer** (`src/order/OrderService.ts`)
   - Contains business logic (e.g., total calculation)
   - Orchestrates repository calls
   - Domain-focused operations

3. **Repository Layer** (`src/order/OrderRepository.ts`)
   - Database access using PostgreSQL
   - Transaction management via `withTransaction` utility
   - Converts database errors to domain errors

### Dependency Injection via Modules System

All service instances are created and managed in `src/modules.ts`:
- Creates a single source of truth for dependencies
- Exports `appModules` object containing all controllers, services, repositories
- Routes receive `AppModules` as parameter to access controllers

When adding new features:
1. Create Repository, Service, Controller classes
2. Instantiate them in `modules.ts`
3. Add to the appropriate section of `appModules`
4. Update `AppModules` type

### Route Architecture

Routes use factory functions that accept `AppModules`:
- `src/routes/index.ts` - Main router factory
- `src/routes/v1/index.ts` - Version 1 API routes
- `src/routes/v1/orders.ts` - Order-specific routes

This pattern enables:
- Versioned APIs (currently v1)
- Type-safe access to controllers
- Testability via dependency injection

### Database Access

- Connection pooling via `pg` library (`src/db.ts`)
- Transaction support with `withTransaction` utility (`src/utils/transactions.ts`)
- Automatically handles BEGIN, COMMIT, ROLLBACK, and connection release
- Use transactions for operations that modify multiple tables

Example:
```typescript
return withTransaction(this.dbPool, async client => {
  // Your queries using client
  await client.query(...)
  return result;
});
```

### Validation with Zod

- Schemas defined alongside DTOs (e.g., `src/order/dto/CreateOrderDTO.ts`)
- `validate` middleware (`src/middleware/validateRequest.ts`) validates request body
- Throws `ValidationError` with detailed issues on failure
- Validated data replaces `req.body` after successful validation

### Error Handling

Custom error hierarchy in `src/types/appError.ts`:
- `AppError` - Base class with statusCode and optional details
- `NotFoundError` - 404 errors for missing resources
- `ValidationError` - 400 errors for invalid input

Centralized error handler (`src/middleware/errorHandler.ts`):
- Handles both known AppError instances and unexpected errors
- Includes stack traces in development mode
- Returns consistent JSON error responses

### Application Lifecycle

`src/server.ts` manages:
- Server startup
- Graceful shutdown via `GracefullyShutdown` utility
- Registers cleanup handlers for database pool and HTTP server
- Ensures clean shutdown on SIGTERM/SIGINT

## Code Organization Patterns

When adding new domain entities:
1. Create folder in `src/` (e.g., `src/order/`)
2. Add entity interfaces (Order.ts)
3. Add DTOs with Zod schemas (dto/CreateOrderDTO.ts)
4. Implement Repository → Service → Controller
5. Register in `src/modules.ts`
6. Create route factory in `src/routes/v1/`
7. Wire up in version router
