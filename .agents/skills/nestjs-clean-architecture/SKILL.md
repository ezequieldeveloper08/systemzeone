---
name: nestjs-clean-architecture
description: Build scalable NestJS backends following Clean Architecture, SOLID principles, and Domain Driven Design used in modern production systems.
---

This skill ensures that all NestJS code follows enterprise backend architecture standards.

The system must produce maintainable, testable, and scalable backend applications.

Framework: NestJS
Language: TypeScript

---

ARCHITECTURE PRINCIPLES

Always follow:

- Clean Code
- SOLID Principles
- Clean Architecture
- Domain Driven Design (DDD)

Dependencies must always point inward.

Infrastructure → Application → Domain

Domain layer must never depend on external frameworks.

---

ARCHITECTURE LAYERS

Domain Layer
- Entities
- Value Objects
- Business rules
- Domain interfaces
- No NestJS imports

Application Layer
- Use cases
- Application services
- Orchestration of domain logic
- Depends on domain

Infrastructure Layer
- Database
- External APIs
- Implement repository interfaces
- Depends on domain

Presentation Layer
- Controllers
- DTOs
- Request validation
- HTTP logic

---

DEPENDENCY FLOW

Controller
 ↓
Use Case
 ↓
Repository Interface
 ↓
Repository Implementation
 ↓
Database / API

Never skip layers.

---

FOLDER STRUCTURE

Use a feature-first architecture.

src/

  modules/
    auth/
      domain/
        entities/
        repositories/
        value-objects/

      application/
        use-cases/
        services/

      infrastructure/
        repositories/
        database/

      presentation/
        controllers/
        dtos/

      auth.module.ts

  shared/
    database/
    exceptions/
    utils/

---

DOMAIN LAYER

Contains pure business logic.

Example:

User Entity
Value Objects
Repository Interfaces

Must not import:

- NestJS
- database libraries
- HTTP libraries

---

APPLICATION LAYER

Implements use cases.

Responsibilities:

- orchestrate domain entities
- enforce business rules
- call repositories

Example:

CreateUserUseCase
LoginUserUseCase

---

INFRASTRUCTURE LAYER

Handles external integrations:

- Prisma
- TypeORM
- REST APIs
- queues
- caching

Implements repository interfaces defined in domain layer.

---

PRESENTATION LAYER

Contains:

Controllers
DTOs
Validation

Responsibilities:

- handle HTTP requests
- validate input
- call use cases

Must not contain business logic.

---

VALIDATION

Use DTO classes with validation decorators.

Example tools:

class-validator
class-transformer

---

ERROR HANDLING

Use domain exceptions for business errors.

Translate errors in the controller layer.

Never expose infrastructure errors directly.

---

TESTABILITY

All dependencies must be injected.

Use dependency inversion.

Classes should depend on interfaces instead of implementations.

---

OUTPUT FORMAT

When generating a feature:

1. Show folder structure
2. Define domain entities
3. Create repository interfaces
4. Implement use cases
5. Implement repository infrastructure
6. Create controller and DTOs
7. Wire everything in NestJS module