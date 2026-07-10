---
name: nextjs-enterprise-architecture
description: Build scalable Next.js applications following modern industry standards including Clean Code, SOLID principles, and Clean Architecture with feature-based structure.
---

This skill ensures all generated Next.js code follows modern enterprise architecture standards used in production environments.

The goal is to produce maintainable, scalable, and testable frontend applications.

Framework: Next.js (App Router)

Stack assumptions:
- TypeScript
- Modern React
- Server Components when appropriate
- Client Components when interaction is needed

---

ARCHITECTURE PRINCIPLES

Follow these principles strictly:

Clean Code
- Small focused functions
- Descriptive naming
- No duplicated logic
- Clear separation of responsibilities

SOLID Principles
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

Clean Architecture
Separate the application into layers with clear responsibilities.

Layers must depend inward.

Presentation → Application → Domain → Infrastructure

---

FOLDER STRUCTURE

Use a feature-first architecture.

Example:

src/
  app/
    layout.tsx
    page.tsx

  features/
    auth/
      components/
      hooks/
      services/
      domain/
      types/
      utils/

    dashboard/
      components/
      hooks/
      services/
      domain/
      types/

  shared/
    components/
    hooks/
    utils/
    types/

  infrastructure/
    api/
    http/
    config/

---

LAYER RESPONSIBILITIES

Presentation Layer
- React components
- Next.js pages
- UI logic only
- Calls application hooks/services

Application Layer
- Hooks
- Application services
- Coordinates domain logic
- Handles state management

Domain Layer
- Business rules
- Entities
- Pure logic
- No framework dependencies

Infrastructure Layer
- API calls
- HTTP clients
- external services
- local storage

---

COMPONENT DESIGN

Follow component composition patterns.

Avoid massive components.

Example structure:

Feature
- Page
- Container Component
- Presentational Components

Example:

DashboardPage
  → DashboardContainer
      → StatsCard
      → RecentActivity
      → ChartWidget

---

STATE MANAGEMENT

Prefer modern patterns:

Local state
- React hooks

Shared state
- Context
- Zustand
- React Query / TanStack Query

Server data
- Prefer server components
- Use caching when possible

---

DATA FETCHING

Prefer modern Next.js patterns:

Server Components for initial data
Server Actions for mutations
Client fetching only when needed

Libraries often used in production:

- TanStack Query
- Zod for validation

---

TYPES AND VALIDATION

Use TypeScript strictly.

Define types in domain or feature layer.

Use runtime validation for API responses.

Example tools:

- Zod
- TypeScript interfaces

---

REUSABILITY

Shared components must live in:

shared/components

Feature-specific components stay inside the feature folder.

Never mix feature logic in shared components.

---

ERROR HANDLING

Handle errors in application layer.

Never mix error logic with UI rendering.

Use clear error boundaries when needed.

---

OUTPUT FORMAT

When generating a feature:

1. Show folder structure
2. Explain architecture decisions
3. Implement:
   - Page
   - Components
   - Hooks / services
   - Domain logic
   - API layer
4. Use TypeScript
5. Follow Next.js best practices