# Nuxt 3 Starter Application

A modern, full-stack TypeScript application with Nuxt 3 frontend, Fastify backend, Drizzle ORM, and Zod validation.

## Features

- **Frontend:** Nuxt 4 + TypeScript + Tailwind CSS 4.x
- **Backend:** Fastify (high-performance Node.js framework)
- **Database:** Drizzle ORM with SQLite3 (dev) or PostgreSQL (production)
- **Validation:** Zod schemas for both frontend and backend
- **API Documentation:** Swagger/OpenAPI UI with Zod integration
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
API Docs: http://localhost:3001/api-docs

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
â”œâ”€â”€ server/                  # Backend (Fastify)
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ config/         # Configuration files
â”‚   â”‚   â”œâ”€â”€ db/             # Database schema and connection
â”‚   â”‚   â”œâ”€â”€ routes/         # API routes
â”‚   â”‚   â”œâ”€â”€ schemas/        # Zod validation schemas
â”‚   â”‚   â””â”€â”€ index.ts        # Server entry point
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ nuxt-app/               # Frontend (Nuxt 4)
â”‚   â”œâ”€â”€ components/         # Vue components
â”‚   â”œâ”€â”€ pages/              # Application pages
â”‚   â”œâ”€â”€ composables/        # Composables (useApi)
â”‚   â”œâ”€â”€ schemas/            # Zod schemas
â”‚   â””â”€â”€ package.json
â”‚
â””â”€â”€ README.md
```

## API Endpoints

- GET /api/users - List all users
- POST /api/users - Create a new user
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user
- GET /health - Health check
- GET /api-docs - Swagger documentation

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

- pnpm dev - Start development server
- pnpm build - Build for production
- pnpm start - Start production server
- pnpm db:generate - Generate migrations
- pnpm db:migrate - Run migrations
- pnpm db:studio - Open Drizzle Studio
- pnpm format - Format code

### Frontend

- pnpm dev - Start development server
- pnpm build - Build for production
- pnpm generate - Generate static site
- pnpm preview - Preview production build
- pnpm format - Format code

## Tech Stack

- **Nuxt 4** - Vue.js framework
- **Fastify** - Fast and low overhead web framework
- **Drizzle ORM** - TypeScript ORM
- **Zod** - Schema validation
- **Tailwind CSS 4** - Utility-first CSS
- **TypeScript** - Type safety
- **Swagger/OpenAPI** - API documentation
- **pnpm** - Fast, disk space efficient package manager

## Troubleshooting

**Port already in use:**

- Change PORT in server/.env or kill the process

**Database errors:**

- Check DATABASE_URL in .env
- Re-run migrations: pnpm db:migrate

**CORS issues:**

- Verify API_BASE_URL in nuxt-app/.env
- Check Fastify CORS configuration

## License

MIT
