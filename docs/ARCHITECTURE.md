# Architecture

**Project:** ForgeFlow

**Version:** 1.0

**Status:** Approved

**Last Updated:** November 2026

---

# 1. Purpose

This document defines how ForgeFlow is structured from an engineering perspective.

It establishes how features are organized, how data flows through the application, and how future functionality should be integrated without creating technical debt.

---

# 2. Architecture Overview

ForgeFlow follows a Feature-First Architecture.

The application is organized around business domains rather than technical file types.

Each feature owns its UI, business logic, and related resources while reusable assets remain in shared modules.

This structure improves scalability and maintainability.

---

# 3. Guiding Principles

- Feature-first organization
- Separation of concerns
- Keep state close to where it is used
- Shared only when genuinely reusable
- Components should have one responsibility
- Simplicity over unnecessary abstraction
- Business logic should not live inside UI components

---

# 4. Application Layers

Presentation Layer

- Pages
- Layouts
- Components

↓

Feature Layer

- Dashboard
- Projects
- Tasks
- Authentication
- Account

↓

Application Layer

- Context
- Routing
- Providers

↓

Service Layer

- Data Services

↓

Data Layer

- Seeded mock data in `src/mocks/initialData.js` (Version 1)
- Browser localStorage for accounts, sessions, projects, and tasks (Version 1)
- Backend (Future)

---

# 5. Feature Structure

Core application features:

- Authentication
- Dashboard
- Projects
- Tasks
- Account

Tasks remain an independent feature because multiple areas of the application depend on them.

---

# 6. Folder Structure

src/
│
├── app/
│ ├── contexts/
│ ├── layouts/
│ ├── providers/
│ └── router/
│
├── features/
│ ├── account/
│ ├── auth/
│ ├── dashboard/
│ ├── projects/
│ └── tasks/
│
├── mocks/
│ └── initialData.js
│
├── shared/
│ ├── components/
│ │ └── ui/
│ ├── services/
│ └── utils/
│
├── App.css
├── App.jsx
├── assets/
├── index.css
└── main.jsx

Tracked empty placeholders remain for `src/shared/hooks/`, `src/shared/constants/`, `src/shared/icons/`, `src/shared/assets/`, and `src/styles/`.

---

# 7. Navigation Structure

Public

- Landing
- Login
- Register
- Forgot Password
- 404 (public catch-all)

↓

Dashboard

↓

Projects
↓

Project Details

↓

Tasks

↓

Account

Dashboard acts as the application's central hub.

---

# 8. Routing Strategy

Public Routes

/

/login

/register

/forgot-password

/\* (public 404 page)

Protected Routes

/dashboard

/projects

/projects/:projectId

/tasks

/account

Unknown routes render the public `NotFoundPage`; they are not redirected or authenticated.

---

# 9. State Management

Local State

- Forms
- Dropdowns
- Modals

Context

- Authentication
- Theme
- Projects
- Tasks
- Activity (static sample feed)

Activity data is static and is not persisted. Reducers should only be introduced when state transitions become sufficiently complex.

---

# 10. Data Flow

Seeded mock data and localStorage

↓

Contexts, services, and utilities

↓

Feature

↓

Components

Components use contexts and services for data. The approved exception is `AccountPage`, which imports seed data only to restore initial projects and tasks.

---

# 11. Component Strategy

Reusable UI belongs inside:

shared/components/

Business-specific UI belongs inside its feature.

Examples

Shared

Button

Modal

Badge

Feature

ProjectCard

TaskCard

DashboardStats

---

# 12. Layout Strategy

PublicLayout

Landing

Authentication

AuthenticatedLayout

Sidebar

Top Navigation

Content Area

All authenticated pages share the same layout.

---

# 13. Error Handling

Every service should return predictable responses.

UI components should display user-friendly error messages instead of crashing.

---

# 14. Scalability

Future additions should not require restructuring.

Examples:

- Supabase
- AI Assistant
- Calendar
- Notifications
- Team Collaboration

---

# 15. Architecture Decisions

Dashboard is the application's home.

Tasks are an independent feature.

Profile belongs under Account.

Shared resources remain framework-agnostic whenever possible.

Business logic stays outside presentation components.

---

# Revision History

| Version | Date          | Description                                        |
| ------- | ------------- | -------------------------------------------------- |
| 1.0     | July 2026     | Initial architecture                               |
| 1.0     | November 2026 | Current V1 implementation and data flow reconciled |

---

# 16. Feature Boundaries

Features should remain loosely coupled.

Allowed:

Dashboard → read Project and Task summaries.

Projects → use shared UI components.

Tasks → use shared utilities.

Not Allowed:

Projects importing arbitrary internal components from Tasks; Project Detail may reuse the Task create/edit modals as the approved V1 integration point.

Tasks importing internal components from Dashboard.

Feature communication should occur through shared services, context, or clearly defined interfaces rather than direct feature-to-feature dependencies.
