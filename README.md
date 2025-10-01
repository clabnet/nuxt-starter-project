# Nuxt 3 Starter Application

A modern, full-stack TypeScript application with Nuxt 3 frontend, Fastify backend, Drizzle ORM, and Zod validation.

## Features

- **Frontend:** Nuxt 4 + TypeScript + Tailwind CSS 4.x
- **Backend:** Fastify (high-performance Node.js framework)
- **Database:** Drizzle ORM with SQLite3 (dev) or PostgreSQL (production)
- **Validation:** Zod schemas with `fastify-type-provider-zod` for automatic conversion
- **API Documentation:** Swagger/OpenAPI UI at `/swagger`
- **Testing:** Vitest test suite with coverage
- **Code Formatting:** Prettier
- **Type Safety:** Full TypeScript implementation
- **Package Manager:** pnpm

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Git (optional)

### 1. Install Backend Dependencies

```powershell
cd server
pnpm install
```

### 2. Setup Backend Database

```powershell
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start backend server
pnpm dev
```

Backend will run on: http://localhost:3001  
API Docs: http://localhost:3001/swagger

### 3. Install Frontend Dependencies

Open a new terminal:

```powershell
cd nuxt-app
pnpm install
```

### 4. Start Frontend

```powershell
pnpm dev
```

Frontend will run on: http://localhost:3000

## Project Structure

```
nuxt-starter-project/
├── server/                  # Backend (Fastify)
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── db/             # Database schema and connection
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Zod validation schemas
│   │   └── index.ts        # Server entry point
│   ├── tests/              # Vitest test suite
│   │   ├── routes/         # Route tests
│   │   └── setup.ts        # Test configuration
│   ├── vitest.config.ts    # Vitest configuration
│   └── package.json
│
├── nuxt-app/               # Frontend (Nuxt 4)
│   ├── components/         # Vue components
│   ├── pages/              # Application pages
│   ├── composables/        # Composables (useApi)
│   ├── schemas/            # Zod schemas
│   └── package.json
│
└── README.md
```

## API Endpoints

- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /health` - Health check
- `GET /swagger` - Swagger documentation

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=./db.sqlite
DATABASE_TYPE=sqlite
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
```

### Frontend (.env)

```env
API_BASE_URL=http://localhost:3001
```

## Testing

The backend includes a comprehensive Vitest test suite:

```powershell
cd server

# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with coverage report
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### Test Coverage

- **POST /api/users** - Create user with validation
- **GET /api/users** - List all users
- **GET /api/users/:id** - Get user by ID
- **PUT /api/users/:id** - Update user
- **DELETE /api/users/:id** - Delete user
- Error handling and validation tests

## Switching to PostgreSQL

1. Install PostgreSQL
2. Create a database
3. Update server/.env:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   DATABASE_TYPE=postgresql
   ```
4. Regenerate migrations:
   ```powershell
   cd server
   pnpm db:generate
   pnpm db:migrate
   ```

## Available Scripts

### Backend

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm format` - Format code

### Frontend

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm generate` - Generate static site
- `pnpm preview` - Preview production build
- `pnpm format` - Format code

## Tech Stack

- **Nuxt 4** - Vue.js framework
- **Fastify** - Fast and low overhead web framework
- **fastify-type-provider-zod** - Automatic Zod to JSON Schema conversion
- **Drizzle ORM** - TypeScript ORM
- **Zod** - Schema validation
- **Vitest** - Fast unit test framework
- **Tailwind CSS 4** - Utility-first CSS
- **TypeScript** - Type safety
- **Swagger/OpenAPI** - API documentation
- **pnpm** - Fast, disk space efficient package manager

## Schema Architecture

This project uses a clean schema architecture:

- **Single Source of Truth:** Zod schemas define all validation rules
- **Automatic Conversion:** `fastify-type-provider-zod` automatically converts Zod schemas to JSON Schema for Swagger documentation
- **Type Safety:** TypeScript types are inferred directly from Zod schemas
- **No Duplication:** No need to maintain separate JSON schemas

Example schema structure:

```typescript
// Define once with Zod
export const createUserBodySchema = z.object({
  name: z.string().min(1).max(255),
  surname: z.string().min(1).max(255),
  gender: z.enum(["male", "female", "other"]),
  isTrusted: z.boolean().default(false),
});

// Automatically get TypeScript types
export type CreateUserBody = z.infer<typeof createUserBodySchema>;

// Automatically get Swagger documentation (via fastify-type-provider-zod)
```

## Troubleshooting

**Port already in use:**

- Change PORT in server/.env or kill the process

**Database errors:**

- Check DATABASE_URL in .env
- Re-run migrations: `pnpm db:migrate`

**CORS issues:**

- Verify API_BASE_URL in nuxt-app/.env
- Check Fastify CORS configuration in server/src/index.ts

**Test failures:**

- Ensure database is properly set up
- Check that test database is clean before running tests
- Run `pnpm test:run` for a single test run to isolate issues

## License

MIT
