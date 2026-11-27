# Product Backlog

**Project:** ForgeFlow

**Version:** 1.0

**Status:** V1 Complete

**Last Updated:** November 2026

---

## Sprint 1 Status

**Sprint:** Sprint 1 – Project Foundation

**Goal:** Establish the engineering foundation of ForgeFlow by setting up the project, tooling, routing, and folder structure.

**Status:** 🟢 Done

---

# Purpose

This document tracks the implementation roadmap for ForgeFlow.

Tasks are grouped into Epics and ordered by priority rather than estimated completion dates.

Every task should be completed according to its Definition of Done before moving to the next task.

---

# Workflow

Every task follows this lifecycle:

Backlog

↓

Ready

↓

In Progress

↓

Review

↓

Testing

↓

Done

---

# Priority Levels

P0 — Critical

P1 — High

P2 — Medium

P3 — Low

---

# Complexity

S — Small

M — Medium

L — Large

---

# Task Status

ForgeFlow tracks every task using the following workflow:

| Status         | Meaning                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| ⬜ Backlog     | Task has been identified but is not yet ready to begin.                                                    |
| 🟡 Ready       | Task has been planned and is ready for implementation.                                                     |
| 🔵 In Progress | Development is currently underway.                                                                         |
| 🟣 Review      | Implementation is complete and awaiting review or testing.                                                 |
| 🟢 Done        | Task has passed review, meets the Definition of Done, and is recorded as complete for the active V1 scope. |
| ⛔ Deferred    | Task is explicitly excluded from the active V1 scope.                                                      |

---

# V1 Ticket Status

| ID     | Task                                  | Status      | Verification note                                    |
| ------ | ------------------------------------- | ----------- | ---------------------------------------------------- |
| FF-001 | Initialize React Project              | 🟢 Done     |                                                      |
| FF-002 | Configure Tailwind CSS                | 🟢 Done     |                                                      |
| FF-003 | Configure shadcn/ui                   | 🟢 Done     |                                                      |
| FF-004 | Configure React Router                | 🟢 Done     |                                                      |
| FF-005 | Create Feature-First Folder Structure | 🟢 Done     |                                                      |
| FF-006 | Configure ESLint & Prettier           | 🟢 Done     |                                                      |
| FF-007 | Landing Page                          | 🟢 Done     |                                                      |
| FF-008 | Login Page                            | 🟢 Done     |                                                      |
| FF-009 | Register Page                         | 🟢 Done     |                                                      |
| FF-010 | Forgot Password                       | 🟢 Done     | Local-demo notice only; real reset remains deferred. |
| FF-011 | Protected Routes                      | 🟢 Done     |                                                      |
| FF-012 | Account-Backed Local Authentication   | 🟢 Done     | PBKDF2 hashing and validated sessions.               |
| FF-013 | Sidebar                               | 🟢 Done     |                                                      |
| FF-014 | Top Navigation                        | 🟢 Done     | Mock notifications removed during Phase 1 cleanup.   |
| FF-015 | Responsive Layout                     | 🟢 Done     |                                                      |
| FF-016 | User Menu                             | 🟢 Done     |                                                      |
| FF-017 | Empty Page Layout                     | 🟢 Done     |                                                      |
| FF-018 | Statistics Cards                      | 🟢 Done     | Hour-based statistic removed during Phase 1 cleanup. |
| FF-019 | Recent Activity                       | 🟢 Done     | Static sample feed is explicitly labelled as demo.   |
| FF-020 | Upcoming Deadlines                    | 🟢 Done     |                                                      |
| FF-021 | Quick Actions                         | 🟢 Done     |                                                      |
| FF-022 | Empty Dashboard                       | 🟢 Done     |                                                      |
| FF-023 | Project List                          | 🟢 Done     |                                                      |
| FF-024 | Create Project                        | 🟢 Done     |                                                      |
| FF-025 | Edit Project                          | 🟢 Done     | Verification criteria recorded below.                |
| FF-026 | Delete Project                        | 🟢 Done     |                                                      |
| FF-027 | Search Projects                       | 🟢 Done     |                                                      |
| FF-028 | Project Filters                       | 🟢 Done     |                                                      |
| FF-029 | Project Overview                      | 🟢 Done     |                                                      |
| FF-030 | Milestones                            | 🟢 Done     |                                                      |
| FF-031 | Notes                                 | 🟢 Done     |                                                      |
| FF-032 | Files                                 | 🟢 Done     |                                                      |
| FF-033 | Task List                             | 🟢 Done     | Hour display removed during Phase 1 cleanup.         |
| FF-034 | Task Details                          | ⛔ Deferred | No Task Details page or route is part of V1.         |
| FF-035 | Create Task                           | 🟢 Done     | Verification criteria recorded below.                |
| FF-036 | Edit Task                             | 🟢 Done     | Verification criteria recorded below.                |
| FF-037 | Delete Task                           | 🟢 Done     |                                                      |
| FF-038 | Status Updates                        | 🟢 Done     |                                                      |
| FF-039 | Profile                               | 🟢 Done     | Notification profile field removed during Phase 1.   |
| FF-040 | Appearance                            | 🟢 Done     | Phase 3 verified; no new code.                       |
| FF-041 | Preferences                           | ⛔ Deferred | Explicitly out of V1.                                |

> Statuses reflect implementation completion after Phase 1 scope cleanup, Phase 2 UI/accessibility work, and Phase 3 FF-040 verification. Phase 4 records the reconciled documentation state; ticket completion is independent of Git commit status.

---

# Epic 1 — Project Foundation

Goal:

Initialize the project and establish the engineering foundation.

---

FF-001

Title

Initialize React Project

Priority

P0

Complexity

S

Description

Create the React project using Vite.

Install the approved dependencies.

Definition of Done

- Project runs successfully
- Initial folder structure created
- Git initialized
- First commit completed

---

FF-002

Title

Configure Tailwind CSS

Priority

P0

Complexity

S

Scope

- Install and configure Tailwind CSS.
- Verify styling works.
- Do not modify routing, layouts, or folder structure.

Definition of Done

- Tailwind CSS is installed and configured correctly.
- Global styles are applied successfully.
- A test page confirms Tailwind utility classes are working.
- The application runs without errors.
- No unrelated files or features were modified.

---

FF-003

Title
Initialize shadcn/ui Design System

Priority
P0

Complexity
S

Scope

- Install and initialize shadcn/ui.
- Configure the project for shadcn/ui components.
- Verify compatibility with Tailwind CSS v4.
- Generate one test component (Button).
- Confirm the component renders correctly.
- Do not build application pages or layouts.

Definition of Done

- shadcn/ui initialized successfully.
- Required configuration files generated.
- Button component generated successfully.
- Button renders correctly in the application.
- Project builds and lints successfully.
- No unrelated files modified.

Depends On
FF-002

---

FF-004

Title

Configure React Router

Priority

P0

Complexity

S

Definition of Done

- Routing installed
- Placeholder routes created
- Navigation functional

---

FF-005

Title

Create Feature-First Folder Structure

Priority

P0

Complexity

S

Definition of Done

Architecture folder structure matches ARCHITECTURE.md.

---

FF-006

Title

Configure ESLint and Prettier

Priority

P1

Complexity

S

Definition of Done

Linting and formatting work correctly.

---

# Epic 2 — Authentication

Goal

Allow users to access the application securely.

Tasks

FF-007 Landing Page

FF-008 Login Page

FF-009 Register Page

FF-010 Forgot Password

FF-011 Protected Routes

FF-012 Account-Backed Local Authentication

Definition of Done

User can successfully enter the dashboard.

---

# Epic 3 — Application Shell

Goal

Create the reusable application layout.

Tasks

FF-013 Sidebar

FF-014 Top Navigation

FF-015 Responsive Layout

FF-016 User Menu

FF-017 Empty Page Layout

Definition of Done

Application navigation is functional.

---

# Epic 4 — Dashboard

Tasks

FF-018 Statistics Cards

FF-019 Recent Activity

FF-020 Upcoming Deadlines

FF-021 Quick Actions

FF-022 Empty Dashboard

Definition of Done

Dashboard provides a useful overview.

---

# Epic 5 — Projects

Tasks

FF-023 Project List

FF-024 Create Project

FF-025 Edit Project

FF-026 Delete Project

FF-027 Search Projects

FF-028 Project Filters

FF-025 Verification Criteria

Recorded during Phase 1 scope reconciliation. These are verification criteria for the current implementation and are not represented as previously approved acceptance criteria.

- Edit Project opens from the Project Detail page.
- The form prefills name, client, description, category, status, priority, budget, deadline, and color.
- Saving updates only editable fields.
- `id`, `createdAt`, `progress`, `milestones`, `notes`, and `files` are preserved unchanged.
- Legacy project categories remain selectable.
- Invalid required input is rejected before saving.
- Cancel closes the modal without changing the project.

Definition of Done

Projects can be managed.

---

# Epic 6 — Project Details

Tasks

FF-029 Project Overview

FF-030 Milestones

FF-031 Notes

FF-032 Files

Definition of Done

Projects display complete information.

---

# Epic 7 — Tasks

Tasks

FF-033 Task List

FF-034 Task Details (Deferred / Out of V1)

Deferred because V1 task management is handled through the task list and edit modal; the PRD V1 Tasks scope does not require a dedicated details page or route.

FF-035 Create Task

FF-036 Edit Task

FF-037 Delete Task

FF-038 Status Updates

FF-035 Verification Criteria

Recorded during Phase 1 scope reconciliation. These are verification criteria for the current implementation and are not represented as previously approved acceptance criteria.

- Create Task defaults to a valid available project when one exists.
- When the default project is deleted or unavailable, the form falls back to the first available project.
- When no projects exist, the form reports the missing project and does not allow creation.
- Title, project assignment, description, priority, status, and due date can be entered.
- Validation rejects a missing title, invalid project, invalid status, invalid priority, and malformed due date.
- Legacy hour fields are not shown, entered, or added to new task records.

FF-036 Verification Criteria

Recorded during Phase 1 scope reconciliation. These are verification criteria for the current implementation and are not represented as previously approved acceptance criteria.

- Edit Task opens from the Task List and Project Detail pages.
- The form prefills title, project assignment, description, priority, status, and due date.
- Saving updates only editable fields.
- `id`, `assignee`, and `createdAt` are preserved unchanged.
- Legacy stored fields not exposed by the form, including legacy hour fields, are left untouched rather than purged.
- Missing project assignments and legacy status/priority values remain editable and are only replaced when the user selects a valid value.
- Malformed legacy due dates are preserved until the user selects a new date or explicitly clears the field.
- Validation rejects a missing title, invalid project, invalid status, invalid priority, and malformed due date.

Definition of Done

Tasks are fully manageable.

---

# Epic 8 — Account

Tasks

FF-039 Profile

FF-040 Appearance

FF-041 Preferences (Deferred / Out of V1)

Definition of Done

Users can manage account settings.

---

# Future Epics

- AI Assistant
- Calendar
- Notifications
- Team Collaboration
- Real Backend
- Mobile Application

---

# Definition of Done (Global)

A task is considered complete only if:

- Feature works correctly
- Responsive on desktop and mobile
- No console errors
- Code follows Engineering Decisions
- Matches Architecture
- Reviewed and understood
- Changes are reported clearly; committing remains a separate Git step

---

# Notes

Implementation should follow this order:

1. Understand the task.
2. Review the architecture.
3. Implement.
4. Test.
5. Refactor if necessary.
6. Commit.
7. Update CHANGELOG.
