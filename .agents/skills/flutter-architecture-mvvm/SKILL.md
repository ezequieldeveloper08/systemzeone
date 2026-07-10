---
name: flutter-architecture-mvvm
description: Build Flutter apps strictly following the official Flutter App Architecture guide using MVVM, repositories, services, and optional domain use-cases.
---

This skill ensures all Flutter code follows the official Flutter App Architecture guide.

The architecture separates the app into clear layers with strict responsibilities.

Core rule: maintain separation of concerns between UI logic and data/business logic.

---

ARCHITECTURE OVERVIEW

Applications must be structured into these layers:

1. UI Layer
   - Views
   - ViewModels

2. Data Layer
   - Repositories
   - Services

3. Optional Domain Layer
   - UseCases / Interactors

Each layer has clear responsibilities and dependencies.

Allowed dependency flow:

View → ViewModel → Repository → Service

Never reverse dependencies.

---

UI LAYER

The UI layer is responsible for user interaction and displaying data.

Components:

Views
- Flutter widgets representing a screen or UI component
- Responsible only for layout, animations, and user events
- No business logic
- Receives UI state from the ViewModel
- Sends user actions to ViewModel commands

ViewModels
- Manage UI state
- Transform data from repositories into UI-ready data
- Expose state fields and command methods
- Communicate with repositories
- Contain most application logic

Each View must have exactly one ViewModel.

---

DATA LAYER

The data layer manages application data and external sources.

Repositories
- Source of truth for application data
- Fetch data from one or more services
- Handle:
  - caching
  - retry logic
  - error handling
  - refresh logic
- Return domain models

Repositories must never depend on other repositories.

Services
- Lowest-level layer
- Responsible for external data sources
- Examples:
  - REST APIs
  - local storage
  - platform APIs
  - Firebase
- Services return Future or Stream objects
- Services must contain no business logic and no UI state

---

OPTIONAL DOMAIN LAYER

Use this layer only when logic becomes complex.

UseCases responsibilities:

- Combine multiple repositories
- Encapsulate complex business logic
- Provide reusable operations for ViewModels

Rules:

UseCase → Repository
ViewModel → UseCase or Repository

Avoid unnecessary use-cases for simple features.

---

DEPENDENCY INJECTION

Dependencies must be injected through constructors.

Example flow:

Service → Repository → ViewModel → View

Never instantiate dependencies directly inside classes.

Prefer dependency injection frameworks such as:

- Provider
- Riverpod
- get_it

---

FOLDER STRUCTURE

Use a feature-first structure.

Example:

lib/
  core/
    network/
    theme/
    utils/

  features/
    auth/
      views/
        login_view.dart
      viewmodels/
        login_view_model.dart
      repositories/
        auth_repository.dart
      services/
        auth_service.dart
      models/
        user.dart

    dashboard/
      views/
      viewmodels/
      repositories/
      services/

---

CODING RULES

Views:
- Stateless or Stateful widgets
- Only UI logic
- No data fetching

ViewModels:
- Manage UI state
- Call repositories
- Expose commands for UI

Repositories:
- Fetch and transform data
- Handle caching and error handling

Services:
- External APIs
- Platform access
- Database calls

---

OUTPUT FORMAT

When generating Flutter code:

1. Explain the feature architecture
2. Show folder structure
3. Implement:
   - View
   - ViewModel
   - Repository
   - Service
4. Show dependency injection
5. Ensure code is production ready