# Overview

This is a War Tycoon admin dashboard application built as a full-stack web application. It provides administrative controls for managing a Roblox-style game server with features like rank management, player moderation, territory control, and real-time game monitoring. The application uses a hierarchical rank system with 48 different administrative levels ranging from "NonAdmin" to "41 | Supreme Creator".

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with **React 18** using TypeScript and follows a component-based architecture:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for a consistent design system
- **Styling**: Tailwind CSS with custom game-themed color scheme and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket connection for live game data and notifications

The application structure follows a modular approach with separate concerns:
- `components/` - Reusable UI components and game-specific widgets
- `pages/` - Route-level components (Landing, Dashboard, NotFound)
- `hooks/` - Custom React hooks for authentication, WebSocket, and UI state
- `lib/` - Utility functions and API client configuration

## Backend Architecture

The backend uses **Express.js** with TypeScript in an ESM configuration:

- **API Structure**: RESTful endpoints with automatic route registration
- **Real-time Communication**: WebSocket server for live updates and game events
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **Error Handling**: Centralized error middleware with structured error responses
- **Development Tooling**: Vite integration for hot reloading in development

Key architectural decisions:
- **Monorepo Structure**: Shared schema and types between client/server in `/shared` directory
- **Database Abstraction**: Storage interface pattern for easy database switching
- **Middleware Pipeline**: Authentication, logging, and error handling as composable middleware

## Data Storage Solutions

**Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Type-safe schema definitions with Drizzle Kit for migrations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: Dedicated sessions table for authentication state

Database schema includes:
- `users` - Player accounts with rank information and ban status
- `ranks` - Hierarchical rank system with permissions
- `tycoons` - Player-owned businesses with resource management
- `territories` - Capturable map regions for team warfare
- `activity_logs` - Audit trail for administrative actions
- `admin_commands` - Command execution history

## Authentication and Authorization

**Authentication Provider**: Replit OAuth integration
- **Strategy**: OpenID Connect with Passport.js
- **Session Management**: Secure HTTP-only cookies with PostgreSQL storage
- **User Provisioning**: Automatic user creation/update on successful OAuth

**Authorization Model**: 
- **Hierarchical Ranks**: 48-level rank system with numerical scoring (0-5)
- **Permission-based**: JSON array permissions stored per rank
- **Route Protection**: Middleware checks rank requirements for admin endpoints
- **Role Escalation**: Higher rank scores inherit lower-level permissions

# External Dependencies

## Third-party Services

- **Replit OAuth**: Primary authentication provider using OpenID Connect
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Protocol**: Native WebSocket for real-time communication

## Key Libraries and Frameworks

- **Frontend Dependencies**:
  - React 18 with TypeScript for component architecture
  - TanStack Query for server state management
  - Radix UI primitives for accessible components
  - Tailwind CSS for utility-first styling
  - Wouter for lightweight routing

- **Backend Dependencies**:
  - Express.js for HTTP server and API routes
  - Drizzle ORM for type-safe database operations
  - Passport.js with OpenID Connect strategy
  - WebSocket (ws) for real-time communication
  - connect-pg-simple for session storage

- **Development Tools**:
  - Vite for frontend build tooling and development server
  - ESBuild for backend compilation
  - TypeScript for type safety across the stack
  - Drizzle Kit for database migrations

## API Integrations

- **Game Server Communication**: WebSocket-based real-time updates for game statistics, player actions, and administrative events
- **Authentication Flow**: OAuth 2.0/OpenID Connect integration with Replit's identity service
- **Database Operations**: Direct PostgreSQL connection through Neon's serverless platform