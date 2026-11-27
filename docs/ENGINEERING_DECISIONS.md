# Engineering Decisions

**Project:** ForgeFlow

**Version:** 1.0

**Status:** Approved

**Last Updated:** November 2026

---

# 1. Purpose

This document defines the engineering standards, architectural conventions, and development practices used throughout ForgeFlow.

Its purpose is to ensure consistency, maintainability, scalability, and readability as the application grows.

All future development should follow the decisions documented here unless a deliberate architectural change is approved.

---

# 2. Engineering Philosophy

ForgeFlow is built to learn professional software engineering practices.

Every decision should prioritize:

- Maintainability
- Readability
- Simplicity
- Scalability
- Consistency

The project favors clear architecture over clever code.

---

# 3. Technology Stack

## Frontend

- React
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- shadcn/ui
- React Router
- `motion` (imported from `motion/react`)
- Lucide React

## Version 1 Data Source

- Seeded mock data in `src/mocks/initialData.js`
- Browser localStorage through app contexts and services
- No backend in V1

## Future

- Supabase or custom backend
- PostgreSQL
- REST API or Server Actions

---

# 4. Folder Philosophy

ForgeFlow uses a Feature-First Architecture.

Business features own their own logic.

Example:

features/
├── auth/
├── dashboard/
├── projects/
├── tasks/
└── account/

Shared resources remain outside feature folders.

---

# 5. Component Philosophy

Every component should have a single responsibility.

Before creating a component, ask:

- Can this be reused?
- Does it solve one problem?
- Is it becoming too large?

Large components should be broken into smaller ones.

---

# 6. Shared Components

Shared components belong in:

shared/components/

Examples:

- Button
- Input
- Modal
- Badge
- Avatar
- EmptyState

Business-specific components remain inside their feature.

Example:

ProjectCard

belongs inside

features/projects/

---

# 7. State Management Strategy

State should remain as close as possible to where it is used.

Use:

## Local State

For:

- Forms
- Modals
- Dropdowns
- UI interactions

## Context API

For:

- Authentication
- Theme
- Projects
- Tasks
- Activity (static sample feed)

## useReducer

Only when state transitions become complex.

Avoid introducing global state unnecessarily.

---

# 8. Data Flow

Data should always move in one direction.

Seeded mock data and localStorage
↓

Contexts, services, and utilities
↓

Feature
↓

Components

Components should use contexts and services for data. `AccountPage` is the approved exception: it imports seed data only for Reset Demo Data.

---

# 9. Service Layer

Application data access should be centralized in contexts, services, and utilities so UI components do not depend on where data originates.

Examples:

- `authService.js`
- `projectDeletionService.js`

Form-specific logic lives in `src/shared/utils/projectForm.js` and `src/shared/utils/taskForm.js`.

The UI should not depend on where data originates.

This allows future backend integration without rewriting components.

---

# 10. Routing Philosophy

Public Routes

- Landing
- Login
- Register
- Forgot Password
- 404 (public catch-all)

Protected Routes

- Dashboard
- Projects
- Project Details (`/projects/:projectId`)
- Tasks
- Account

Unknown routes render the 404 page without requiring authentication. Unauthenticated users should never access protected routes.

---

# 11. Naming Conventions

Components

PascalCase

ProjectCard.jsx

Hooks

camelCase beginning with use

useProjects.js

Utilities

camelCase

formatDate.js

Constants

UPPER_SNAKE_CASE where appropriate.

---

# 12. Git Workflow

Every feature should be developed inside its own branch.

Examples:

feature/auth

feature/dashboard

feature/projects

feature/tasks

Main should remain stable.

---

# 13. Commit Convention

ForgeFlow follows Conventional Commits.

Examples:

feat(auth): create login page

feat(projects): build project creation modal

fix(tasks): resolve task filtering issue

refactor(sidebar): simplify navigation

docs(prd): update product requirements

---

# 14. Code Quality Principles

Code should be:

Readable

Predictable

Consistent

Reusable

Simple

Readable code is preferred over clever code.

---

# 15. Accessibility

Every feature should consider accessibility.

Examples:

- Keyboard navigation
- Semantic HTML
- Accessible forms with explicit label associations
- Modal dialogs with labelled titles, focus trapping/restoration, and Escape handling
- Keyboard-navigable global search results with listbox semantics
- Explicit labels for status, filter, milestone, note, upload, and delete controls
- Visible focus states, including global `:focus-visible` styling
- Color should never be the only status indicator

---

# 16. Performance

Avoid unnecessary re-renders.

Lazy load routes where appropriate.

Split components responsibly.

Optimize only after measuring.

Readability comes before micro-optimizations.

---

# 17. Future Scalability

The architecture should support future additions without major restructuring.

Future features include:

- Backend integration
- AI features
- Calendar
- Notifications
- Team collaboration
- Mobile application

---

# 18. Engineering Principles

Every engineering decision should satisfy one or more of the following:

- Improves maintainability
- Reduces duplication
- Increases clarity
- Supports scalability
- Improves developer experience

---

# Revision History

| Version | Date          | Description                                            |
| ------- | ------------- | ------------------------------------------------------ |
| 1.0     | July 2026     | Initial engineering standards                          |
| 1.0     | November 2026 | Current stack, routing, data flow, and a11y reconciled |

---

# 19. Decision Framework

Before introducing a new feature, dependency, or architectural change, ask:

1. Does this solve a real problem?
2. Can the existing solution handle this instead?
3. Will this make the codebase easier or harder to maintain?
4. Is the added complexity justified?
5. Can another developer understand this decision six months from now?

If the answer to these questions is unclear, prefer the simpler solution.
