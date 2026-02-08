<div align="center">

# 🎫 EvenTaro

**A modern event management & reservation platform**

Built with **Next.js 16** · **NestJS 11** · **PostgreSQL** · **Tailwind CSS v4**

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Architecture](#architecture) · [API Reference](#api-reference) · [Contributing](#contributing)

</div>

---

## Features

### Public

- **Event Catalogue** — Browse published events with date, location, and availability info
- **Event Detail** — View full event description with real-time seat availability
- **Responsive Design** — Mobile-first UI with Inter font and Indigo/Zinc design system

### Authenticated Users

- **JWT Authentication** — Register / login with access + refresh token rotation
- **One-click Reservations** — Reserve a spot from any event page
- **Personal Dashboard** — Track all your reservations with live status badges
- **Cancel Reservations** — Self-service cancellation (up to 48 h before the event)
- **PDF Tickets** — Download confirmation tickets for confirmed reservations

### Admin Panel

- **Event Management** — Create, edit, publish, and cancel events
- **Reservation Management** — Confirm, refuse, or cancel any reservation
- **Stats Overview** — At-a-glance counts by reservation status (pending, confirmed, refused, cancelled)
- **Role-Based Access** — Guards enforce ADMIN / USER permissions on every endpoint

---

## Tech Stack

| Layer        | Technology                                                   |
| ------------ | ------------------------------------------------------------ |
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, TypeScript     |
| **Styling**  | Tailwind CSS v4, Lucide React icons, Inter (Google Fonts)    |
| **Backend**  | NestJS 11, TypeScript, class-validator, Passport JWT         |
| **Database** | PostgreSQL 15, Prisma ORM (migrations, generated client)     |
| **Infra**    | Docker, Docker Compose (dev + prod), npm workspaces monorepo |
| **Quality**  | ESLint, Prettier, Jest, Testing Library, E2E tests           |

---

## Project Structure

```
EvenTaro/
├── apps/
│   ├── api/                        # NestJS REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Data model (User, Event, Reservation)
│   │   │   └── migrations/         # Prisma SQL migrations
│   │   └── src/
│   │       ├── auth/               # JWT auth, refresh tokens, guards, strategies
│   │       ├── events/             # CRUD + publish/cancel, capacity checks
│   │       ├── reservations/       # Create, confirm, refuse, cancel, PDF ticket
│   │       ├── users/              # User profile & lookup
│   │       ├── prisma/             # PrismaService (singleton connection)
│   │       └── common/             # Global HTTP exception filter
│   │
│   └── web/                        # Next.js frontend
│       └── src/
│           ├── app/                # App Router pages & layouts
│           │   ├── page.tsx              # Landing page (hero + features)
│           │   ├── login/                # Sign in form
│           │   ├── register/             # Registration form
│           │   ├── events/               # Public event catalogue + detail
│           │   └── dashboard/            # User dashboard + admin panel
│           ├── components/
│           │   ├── ui/             # Reusable primitives (Button, Input, Card, Badge…)
│           │   └── layout/         # Navbar (auth-aware), Footer
│           ├── context/            # AuthContext (tokens, user, role)
│           └── lib/
│               ├── api.ts          # Typed API client with 401 auto-refresh
│               └── utils.ts        # cn(), formatDate(), toDateTimeLocal()
│
├── docs/
│   ├── ARCHITECTURE.md             # System architecture & diagrams
│   ├── INSTALLATION.md             # Detailed install guide
│   └── REGLES_METIER.md            # Business rules (FR)
│
├── docker-compose.yml              # Production setup
├── docker-compose.dev.yml          # Dev setup with hot-reload
└── package.json                    # Root workspace config
```

---

## Getting Started

### Prerequisites

| Requirement      | Version                 |
| ---------------- | ----------------------- |
| Node.js          | >= 18 (recommended 20+) |
| npm              | >= 9                    |
| PostgreSQL       | 15 (or use Docker)      |
| Docker + Compose | Latest (optional)       |

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/EvenTaro.git
cd EvenTaro
npm install
```

### 2. Environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

**Backend** (`apps/api/.env`):

| Variable             | Example                                             | Description                  |
| -------------------- | --------------------------------------------------- | ---------------------------- |
| `DATABASE_URL`       | `postgresql://user:pass@localhost:5432/eventaro_db` | PostgreSQL connection string |
| `JWT_SECRET`         | `change-me`                                         | Access token signing key     |
| `JWT_REFRESH_SECRET` | `change-me-too`                                     | Refresh token signing key    |
| `CORS_ORIGIN`        | `http://localhost:3000`                             | Allowed frontend origin      |
| `PORT`               | `3001`                                              | API port                     |

**Frontend** (`apps/web/.env`):

| Variable              | Example                 | Description  |
| --------------------- | ----------------------- | ------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | API base URL |

### 3. Database setup

Start PostgreSQL (standalone or via Docker):

```bash
docker run -d --name eventaro-db \
  -e POSTGRES_USER=eventaro \
  -e POSTGRES_PASSWORD=eventaro_password \
  -e POSTGRES_DB=eventaro_db \
  -p 5432:5432 \
  postgres:15-alpine
```

Run migrations:

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

### 4. Run

```bash
# Terminal 1 — API (http://localhost:3001)
npm run dev:api

# Terminal 2 — Web (http://localhost:3000)
npm run dev:web
```

### Docker (alternative)

```bash
# Development (hot-reload)
npm run docker:dev

# Production
npm run docker:build && npm run docker:up

# Stop
npm run docker:down
```

---

## Architecture

```
┌──────────────────────┐       ┌───────────────────────┐       ┌──────────────┐
│   Next.js Frontend   │       │    NestJS API          │       │  PostgreSQL   │
│                      │ HTTP  │                        │ SQL   │              │
│  SSR: /, /events     │──────▶│  AuthModule (JWT)      │──────▶│  Users       │
│  CSR: /dashboard     │       │  EventsModule          │       │  Events      │
│  CSR: /login         │       │  ReservationsModule    │       │  Reservations│
│       /register      │       │  UsersModule           │       │              │
└──────────────────────┘       └───────────────────────┘       └──────────────┘
```

### Data Model

| Entity          | Key Fields                                                      | Notes                                                  |
| --------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| **User**        | id, fullName, email, password, role, hashedRefreshToken         | Roles: `ADMIN`, `USER`                                 |
| **Event**       | id, title, description, dateTime, location, maxCapacity, status | Status: `DRAFT`, `PUBLISHED`, `CANCELLED`              |
| **Reservation** | id, userId, eventId, status                                     | Status: `PENDING`, `CONFIRMED`, `REFUSED`, `CANCELLED` |

### Frontend Component Architecture

```
components/
├── ui/          ← Design system primitives
│   ├── Button   (primary / secondary / outline / ghost / danger × sm / md / lg)
│   ├── Input    (label + error + icon support)
│   ├── Textarea
│   ├── Select
│   ├── Badge    + StatusBadge (auto-maps reservation status → color)
│   ├── Card     (Card / CardHeader / CardContent / CardFooter)
│   ├── Alert    (ErrorAlert with icon)
│   └── Spinner  (inline + full-page)
└── layout/      ← Shared page chrome
    ├── Navbar   (auth-aware: login/register vs dashboard/logout)
    └── Footer
```

All primitives use `forwardRef`, accept `className` for composition, and are barrel-exported from `components/ui/index.ts`.

---

## API Reference

### Authentication

| Method | Endpoint         | Auth    | Description                                |
| ------ | ---------------- | ------- | ------------------------------------------ |
| `POST` | `/auth/register` | —       | Create account (fullName, email, password) |
| `POST` | `/auth/login`    | —       | Returns access + refresh tokens            |
| `POST` | `/auth/refresh`  | Refresh | Rotate tokens                              |
| `POST` | `/auth/logout`   | JWT     | Revoke refresh token                       |
| `GET`  | `/auth/me`       | JWT     | Current user profile                       |

### Events

| Method   | Endpoint            | Auth  | Description                    |
| -------- | ------------------- | ----- | ------------------------------ |
| `GET`    | `/events/published` | —     | List published events (public) |
| `GET`    | `/events/:id`       | —     | Event detail                   |
| `POST`   | `/events`           | Admin | Create event                   |
| `PATCH`  | `/events/:id`       | Admin | Update event                   |
| `DELETE` | `/events/:id`       | Admin | Delete event                   |

### Reservations

| Method  | Endpoint                    | Auth  | Description                          |
| ------- | --------------------------- | ----- | ------------------------------------ |
| `POST`  | `/reservations/:eventId`    | JWT   | Create reservation                   |
| `GET`   | `/reservations/my`          | JWT   | User's reservations                  |
| `PATCH` | `/reservations/:id/cancel`  | JWT   | Cancel own reservation (48 h rule)   |
| `GET`   | `/reservations/admin`       | Admin | All reservations                     |
| `PATCH` | `/reservations/:id/confirm` | Admin | Confirm reservation                  |
| `PATCH` | `/reservations/:id/refuse`  | Admin | Refuse reservation                   |
| `GET`   | `/reservations/:id/ticket`  | JWT   | Download PDF ticket (confirmed only) |

---

## Available Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev:web`      | Start Next.js dev server (port 3000) |
| `npm run dev:api`      | Start NestJS dev server (port 3001)  |
| `npm run build:web`    | Build frontend for production        |
| `npm run build:api`    | Build API for production             |
| `npm run test`         | Run all unit tests                   |
| `npm run test:e2e`     | Run end-to-end tests                 |
| `npm run lint`         | Lint all workspaces                  |
| `npm run format`       | Format with Prettier                 |
| `npm run docker:dev`   | Dev containers (hot-reload)          |
| `npm run docker:build` | Build production images              |
| `npm run docker:up`    | Start production containers          |
| `npm run docker:down`  | Stop all containers                  |

---

## Business Rules

| Rule                      | Detail                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| **Reservation limit**     | Cannot reserve if event is full (PENDING + CONFIRMED ≥ maxCapacity) |
| **No duplicates**         | One active reservation (PENDING or CONFIRMED) per user per event    |
| **Cancellation by user**  | Only CONFIRMED reservations, only if event is ≥ 48 h away           |
| **Cancellation by admin** | Any PENDING or CONFIRMED reservation, anytime                       |
| **PDF Ticket**            | Only downloadable for CONFIRMED reservations                        |
| **Published events only** | Only PUBLISHED events appear in the public catalogue                |

See [docs/REGLES_METIER.md](docs/REGLES_METIER.md) for the full specification.

---

## Documentation

| Document                                   | Description                                           |
| ------------------------------------------ | ----------------------------------------------------- |
| [Architecture](docs/ARCHITECTURE.md)       | System overview, Mermaid diagrams, module breakdown   |
| [Installation Guide](docs/INSTALLATION.md) | Detailed setup for local & Docker environments        |
| [Business Rules](docs/REGLES_METIER.md)    | Statuses, reservation conditions, cancellation policy |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Run quality checks: `npm run lint && npm run test`
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## License

This project is unlicensed (private).
