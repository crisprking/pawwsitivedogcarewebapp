# Overview

Pawsitive is a comprehensive dog health management application designed to help dog owners track symptoms, manage medications, schedule appointments, and make informed health decisions to prevent expensive emergency vet visits. The application provides tools for health tracking, medication management, weight monitoring, vaccination records, and emergency symptom assessment.

The system is built as a full-stack web application with a React frontend and Express.js backend, utilizing PostgreSQL for data persistence and integrating with Stripe for payment processing. The application includes both free and premium features, with authentication handled through Replit's OAuth system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod schema validation

## Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Middleware**: Express session handling, JSON parsing, and error handling
- **Development**: Hot reload with Vite integration in development mode

## Data Storage
- **Database**: PostgreSQL with Neon serverless connection pooling
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations stored in `/migrations`
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

## Authentication & Authorization
- **Provider**: Replit OAuth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **User Model**: Standard user profiles with Stripe integration fields
- **Route Protection**: `isAuthenticated` middleware for protected endpoints
- **Frontend Auth**: React Query-based authentication state management

## Database Schema Design
- **Users**: Core user profiles with Stripe customer/subscription integration
- **Dogs**: Pet profiles with breed, age, weight, and medical information
- **Health Records**: Symptom tracking with type, severity, and timestamps
- **Medications**: Prescription management with dosage and scheduling
- **Appointments**: Vet appointment scheduling with clinic information
- **Weight Records**: Historical weight tracking for health monitoring
- **Vaccinations**: Immunization records with expiration tracking

## Core Features Architecture
- **Emergency Assessment**: Multi-step symptom evaluation with urgency classification
- **Health Tracking**: Comprehensive logging system for symptoms and conditions  
- **Medication Management**: Scheduling and logging system with reminders
- **Weight Monitoring**: Chart-based visualization of weight trends
- **Appointment Scheduling**: Calendar integration with vet clinic management

# External Dependencies

## Payment Processing
- **Stripe**: Payment processing for premium subscriptions
- **Integration**: React Stripe.js for frontend payment forms
- **Webhooks**: Server-side payment confirmation handling

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pool**: @neondatabase/serverless for optimized connections
- **WebSocket Support**: For real-time database connections

## Authentication Services  
- **Replit OAuth**: Primary authentication provider
- **OpenID Connect**: Standards-based authentication flow
- **Passport.js**: Authentication middleware integration

## Development Tools
- **Vite Plugins**: Development banner, cartographer, and error overlay
- **TypeScript**: Strict type checking across frontend and backend
- **ESBuild**: Production bundling for server-side code
- **PostCSS**: CSS processing with Tailwind and autoprefixer

## UI Component Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon system
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Component variant management