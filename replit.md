# Overview

VisaFlow is a full-stack visa consultancy management platform built with React, Express, and MongoDB. The application serves three user roles—admins, agents, and clients—each with dedicated dashboards and workflows for managing visa applications, tracking commissions, and coordinating between parties.

The tech stack consists of:
- **Frontend**: React with Vite, TypeScript, TailwindCSS, and shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: MongoDB via Mongoose ODM
- **Authentication**: Session-based with express-session and bcrypt
- **State Management**: TanStack Query (React Query)

# Recent Changes

**December 5, 2025 - Complete Terminology Refactoring**
- Renamed "broker" to "agent" and "student" to "client" throughout entire codebase
- Updated database schema, models, and storage layer with new terminology
- Updated all backend API routes (/api/agent/*, /api/client/*)
- Renamed frontend directories (client/src/pages/agent, client/src/pages/client)
- Updated all frontend components, query keys, and API calls
- Updated session role types from "admin" | "broker" | "student" to "admin" | "agent" | "client"
- Updated DashboardLayout, Sidebar, and auth components with new roles
- Renamed admin pages (agents.tsx, clients.tsx) and page file references

**December 5, 2025 - Agent Edit Flow Fix**
- Fixed race condition in agent edit dialog that was corrupting profile data
- Consolidated commission and profile updates into single PATCH request
- Added commissionAmount support to admin agent update endpoint
- Backend now uses `!== undefined` checks to allow clearing optional fields (phone, companyName)
- Frontend sends null values for cleared fields to properly remove outdated info
- Removed unused commissionMutation in favor of unified updateMutation

**December 5, 2025 - User Creation Workflow Improvements**
- Enhanced admin agent creation with secure credential modal
- Enhanced agent client creation with secure credential modal
- Credential modals prevent accidental dismissal (ESC/outside click) until user clicks "Done"
- Fixed client application submission to work correctly
- Verified complete workflow: admin creates agent → agent creates client → client submits application

**December 4, 2025 - MongoDB Migration**
- Migrated from PostgreSQL (Drizzle ORM) to MongoDB (Mongoose)
- Updated shared/schema.ts to use Zod-only schemas with TypeScript types
- Created new server/db.ts with Mongoose connection and models
- Rewrote server/storage.ts to use Mongoose queries
- Implemented auto-incrementing numeric IDs using a counter collection
- Fixed security vulnerability: replaced hardcoded passwords with cryptographically secure random passwords
- New user creation endpoints now return temporaryPassword for admin/agent to share with users

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Component Structure**: The application uses a component-based architecture with shadcn/ui as the design system foundation. Components are organized into:
- UI primitives (`client/src/components/ui/`) - Reusable, accessible components built on Radix UI
- Layout components (`client/src/components/layout/`) - DashboardLayout and Sidebar for consistent page structure
- Page components (`client/src/pages/`) - Role-specific views organized by user type

**Routing**: Uses wouter for client-side routing with role-based route organization:
- `/admin/*` - Admin dashboard routes
- `/agent/*` - Agent dashboard routes  
- `/client/*` - Client dashboard routes
- `/login` and `/signup` - Authentication flows

**State Management**: TanStack Query handles server state with custom query client configuration. API functions are centralized in `client/src/lib/api.ts` for type-safe backend communication.

**Authentication Flow**: React Context (`AuthProvider`) manages authentication state, providing login/logout functions and user session data throughout the component tree. Protected routes verify user role and redirect unauthorized access.

**Styling**: TailwindCSS v4 with custom theme configuration. The design system uses CSS variables for theming with light/dark mode support built into components.

## Backend Architecture

**API Structure**: RESTful Express server with route handlers in `server/routes.ts`. The API follows conventional HTTP methods:
- POST `/api/auth/signup` - User registration with role-based profile creation
- POST `/api/auth/login` - Session-based authentication
- GET/POST/PATCH `/api/admin/*` - Admin operations
- GET/POST `/api/agent/*` - Agent operations
- GET/POST `/api/client/*` - Client operations

**Session Management**: Uses express-session with MemoryStore (for development). Sessions store userId and role for authorization checks.

**Data Layer**: The storage interface (`server/storage.ts`) abstracts database operations, providing type-safe methods for CRUD operations on users, agents, clients, applications, and commissions. This separation allows for easier testing and potential database migration.

**Authentication & Authorization**: 
- Password hashing with bcrypt (10 rounds)
- Secure random password generation for admin/agent-created accounts
- Session-based authentication with httpOnly cookies
- Role-based access control enforced at route level
- User roles: admin, agent, client

## Database Design

**Schema Organization** (`shared/schema.ts`): Zod schemas define data validation with TypeScript types for type safety.

**MongoDB Collections** (`server/db.ts`): Mongoose models define the database structure:
- `users` - Authentication and base user information (id, email, password, role)
- `agents` - Agent-specific data (commissionRate, status, activeClients, references users)
- `clients` - Client profiles (references users and optional agent)
- `applications` - Visa applications (clientId, status, progress, documents)
- `commissions` - Commission tracking for agent earnings
- `documents` - Document uploads and status tracking
- `activities` - Activity logging for notifications
- `counters` - Auto-incrementing ID sequences

**Key Relationships**:
- Users have a one-to-one relationship with either agents or clients based on role
- Clients can be assigned to one agent (nullable agentId)
- Applications belong to clients
- Commissions are tied to agents and applications

**Status Enums** (validated via Zod):
- `role`: admin, agent, client
- `application_status`: Document Review, Submitted, Interview, Approved, Rejected
- `commission_status`: Pending, Approved, Paid, Rejected
- `document_status`: Pending, Approved, Rejected

## Build System

**Development**: 
- Client runs on Vite dev server (port 5000)
- Server runs with tsx for TypeScript execution
- Hot module replacement enabled for frontend

**Production Build** (`script/build.ts`):
- Vite builds the client to `dist/public`
- esbuild bundles the server to `dist/index.cjs`
- Selective dependency bundling: Core dependencies are bundled (allowlist) to reduce cold start times; others remain external
- Single executable output for deployment

**TypeScript Configuration**: Shared tsconfig.json with path aliases:
- `@/*` → client source
- `@shared/*` → shared schema/types
- Module resolution set to "bundler" for Vite compatibility

# External Dependencies

**UI Framework**: Radix UI provides headless, accessible component primitives (dialogs, dropdowns, accordions, etc.). shadcn/ui wraps these with styled implementations.

**Database**: 
- MongoDB via Mongoose ODM
- Connection managed via MONGODB_URI environment variable
- Auto-incrementing IDs using counter collection pattern

**Authentication**: bcryptjs for password hashing (no native dependencies for cross-platform compatibility)

**Styling**: 
- TailwindCSS for utility-first styling
- class-variance-authority (cva) for component variant management
- Framer Motion for animations

**Development Tools**:
- Replit-specific plugins (vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner)
- Custom meta-images plugin for OpenGraph image URL updates

**State & Data Fetching**: TanStack Query v5 manages server state with caching, refetching, and synchronization

**Forms**: React Hook Form with Zod resolvers (@hookform/resolvers) for validation

**Date Handling**: date-fns for date manipulation and formatting

# Environment Variables

- `MONGODB_URI` - MongoDB connection string (required)
- `SESSION_SECRET` - Session encryption key (optional, has default for development)
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 5000)

The application is designed for deployment on Replit with environment-based configuration and support for both development and production environments.
