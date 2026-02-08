# EvenTaro

Event Management Platform - A modern monorepo with Next.js frontend and NestJS backend.

## Project Structure

```
eventaro/
├── apps/
│   ├── web/          # Next.js frontend (TypeScript, App Router)
│   └── api/          # NestJS backend (TypeScript)
├── docker-compose.yml              # Production Docker setup
├── docker-compose.dev.yml          # Development Docker setup with hot-reload
└── package.json                    # Root workspace configuration
```

## Tech Stack

### Frontend (apps/web)

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint & Prettier** - Code quality tools

### Backend (apps/api)

- **NestJS 11** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Primary database
- **ESLint & Prettier** - Code quality tools

### Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL 15** - Database

## Prerequisites

- Node.js >= 20.9.0
- npm >= 11.0.0
- Docker and Docker Compose (for containerized development)

## Getting Started

### Local Development (Without Docker)

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   # Frontend
   cp apps/web/.env.example apps/web/.env

   # Backend
   cp apps/api/.env.example apps/api/.env
   ```

3. **Start PostgreSQL** (using Docker):

   ```bash
   docker run -d \
     --name eventaro-db \
     -e POSTGRES_USER=eventaro \
     -e POSTGRES_PASSWORD=eventaro_password \
     -e POSTGRES_DB=eventaro_db \
     -p 5432:5432 \
     postgres:15-alpine
   ```

4. **Run development servers:**

   ```bash
   # Frontend (http://localhost:3000)
   npm run dev:web

   # Backend (http://localhost:3001)
   npm run dev:api
   ```

### Docker Development (With Hot-Reload)

1. **Start all services in development mode:**

   ```bash
   npm run docker:dev
   ```

   This will start:
   - Frontend at http://localhost:3000
   - Backend at http://localhost:3001
   - PostgreSQL at localhost:5432

2. **Stop all services:**
   ```bash
   npm run docker:down
   ```

### Docker Production Build

1. **Build and start all services:**

   ```bash
   npm run docker:build
   npm run docker:up
   ```

2. **Stop all services:**
   ```bash
   npm run docker:down
   ```

## Available Scripts

### Root Level

- `npm run dev:web` - Start Next.js development server
- `npm run dev:api` - Start NestJS development server
- `npm run build:web` - Build Next.js for production
- `npm run build:api` - Build NestJS for production
- `npm run lint` - Run ESLint on all workspaces
- `npm run format` - Format code with Prettier
- `npm run docker:dev` - Start development environment with Docker
- `npm run docker:up` - Start production environment with Docker
- `npm run docker:down` - Stop Docker containers
- `npm run docker:build` - Build Docker images

### Frontend (apps/web)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend (apps/api)

- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Configuration

### TypeScript

Both apps use **strict mode** enabled with the following configurations:

- Frontend: `strict: true` in tsconfig.json
- Backend: `strict: true` in tsconfig.json

### ESLint & Prettier

- Shared Prettier configuration at root level (`.prettierrc`)
- ESLint configured for both Next.js and NestJS
- Run `npm run lint` to check all workspaces
- Run `npm run format` to format all files

### Environment Variables

#### Frontend (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=EvenTaro
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### Backend (.env)

```
PORT=3001
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=eventaro
DATABASE_PASSWORD=eventaro_password
DATABASE_NAME=eventaro_db
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Docker Services

### Networks

- `eventaro-network` - Bridge network for all services

### Volumes

- `eventaro_postgres_data` - Persistent storage for PostgreSQL data

### Services

1. **web** - Next.js frontend (port 3000)
2. **api** - NestJS backend (port 3001)
3. **db** - PostgreSQL database (port 5432)

## Project Features

✅ Monorepo structure with npm workspaces
✅ Next.js 16 with TypeScript and App Router
✅ NestJS 11 with TypeScript
✅ TypeScript strict mode enabled
✅ ESLint and Prettier configured
✅ Docker and Docker Compose setup
✅ Development and production Docker configurations
✅ Environment variable management
✅ PostgreSQL database
✅ Hot-reload in development mode
✅ Health checks for services

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** – Vue d’ensemble, flux, diagramme de classes
- **[Guide d’installation](docs/INSTALLATION.md)** – Installation locale et Docker, variables d’environnement
- **[Règles métier](docs/REGLES_METIER.md)** – Statuts, réservations, annulation, ticket PDF

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check code quality
4. Run `npm run format` to format code
5. Test your changes locally
6. Submit a pull request

## License

UNLICENSED
