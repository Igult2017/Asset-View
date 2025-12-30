# FSDZONESJOURNAL - Trading Journal Application

## Overview

A high-frequency trading journal application designed for traders to log, track, and analyze their trades. The app features a modern dark-themed UI with real-time statistics, strategy performance tracking, and trade history management. Built as a full-stack TypeScript application with React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme (deep navy background with blue accents)
- **Animations**: Framer Motion for smooth transitions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints defined in shared route contracts (`shared/routes.ts`)
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Validation**: Zod schemas generated from Drizzle schema using drizzle-zod

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database schema definitions and TypeScript types
- `routes.ts`: API route contracts with input/output validation schemas

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: esbuild bundles server code, Vite builds client assets
- **Database Migrations**: Drizzle Kit with `db:push` command

### Data Model
The core entity is `trades` with fields:
- Asset (e.g., EURUSD, NAS100)
- Strategy (e.g., SMC Breaker, Silver Bullet)
- Session (London, New York, Asian)
- Market condition and bias
- Outcome (Win, Loss, BE)
- R achieved and P/L amount
- Context and entry timeframes

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session storage (if sessions are needed)

### UI Libraries
- **Radix UI**: Accessible, unstyled component primitives (dialogs, dropdowns, forms, etc.)
- **shadcn/ui**: Pre-styled component collection using Radix + Tailwind
- **Lucide React**: Icon library
- **Chart.js**: Data visualization (referenced in attached assets)

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **TypeScript**: Full type safety across the stack
- **Drizzle Kit**: Database migration tooling

### Fonts
- Plus Jakarta Sans: Primary UI font
- JetBrains Mono: Monospace font for data display
- Fira Code, Geist Mono: Additional code fonts