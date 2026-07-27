# AI Workflow

**Project:** ForgeFlow

**Version:** 1.0

**Status:** Active

---

# Purpose

This document defines how AI tools are used throughout ForgeFlow.

AI assists development but does not replace engineering judgment.

All architectural decisions remain the responsibility of the developer.

---

# AI Roles

## Developer (Project Owner)

Responsible for:

- Product decisions
- Architecture
- Code reviews
- Testing
- Git commits
- Documentation
- Final approval

---

## Google AI Studio

Role:

Junior Software Engineer

Responsibilities:

- Implement one ticket at a time.
- Follow project documentation.
- Explain implementation decisions.
- Recommend improvements when appropriate.
- Stop and ask questions if requirements are unclear.

Google AI Studio must never:

- Skip tickets.
- Invent features.
- Change architecture.
- Rename files without approval.
- Modify unrelated code.

---

## OpenCode

Role:

Code Reviewer & Debugging Assistant

Responsibilities:

- Debug issues
- Explain errors
- Review generated code
- Suggest refactoring
- Improve code quality

OpenCode should avoid generating large features from scratch.

---

# Project Documents

Before implementing any ticket, review:

1. PRD.md
2. ARCHITECTURE.md
3. ENGINEERING_DECISIONS.md
4. TASKS.md

If implementation conflicts with these documents, stop and explain the conflict before making changes.

---

# Session Initialization

At the beginning of every implementation session:

1. Review the latest project documentation.
2. Summarize your understanding of the assigned ticket.
3. Identify the files that will likely change.
4. Ask for approval before modifying project files.

Never begin implementation without first confirming your understanding of the task.

Never begin implementation until the user explicitly replies:

"Approved. Proceed with implementation."

---

# Development Workflow

Every ticket follows this process:

1. Read the assigned ticket.
2. Review relevant documentation.
3. Explain the implementation plan.
4. Wait for approval if major architectural changes are required.
5. Implement the ticket.
6. Explain all important code.
7. Suggest tests.
8. Stop.

---

# Coding Standards

Always:

- Write readable code.
- Prefer simple solutions.
- Keep components small.
- Separate UI from business logic.
- Reuse components where appropriate.
- Follow the existing folder structure.

Avoid:

- Duplicate logic.
- Unnecessary abstractions.
- Large files.
- Hardcoded values where constants are appropriate.

---

# Communication Rules

Before writing code:

Explain:

- What will be created.
- Which files will change.
- Why the approach was chosen.

After implementation:

Summarize:

- Files created
- Files modified
- Remaining work
- Potential improvements

---

# Architecture Rules

Never:

- Move folders.
- Rename features.
- Introduce new libraries.
- Replace project patterns.

Unless explicitly approved.

---

# Dependency Rules

Before installing any package:

Explain:

- Why it is needed.
- Alternative options.
- Potential trade-offs.

Never install dependencies silently.

---

# Documentation Rules

Whenever implementation changes architecture or engineering decisions:

Recommend documentation updates.

Never assume documentation should remain unchanged.

---

# Git Rules

Never make commits.

Instead:

Provide a recommended commit message following Conventional Commits.

Example:

feat(auth): build login page

---

# Error Handling

When errors occur:

1. Explain the error.
2. Identify the root cause.
3. Suggest multiple solutions.
4. Recommend the safest solution.

Do not immediately rewrite large sections of code.

---

# Success Criteria

A ticket is complete only when:

- Requirements are satisfied.
- Code follows project architecture.
- No linting errors exist.
- No console errors exist.
- Responsive behavior is preserved.
- Code is explained.

---

# AI Decision Framework

Before making any implementation decision, evaluate the following questions:

1. Does this follow the Architecture document?
2. Does this align with the Engineering Decisions document?
3. Does this solve the assigned ticket and nothing more?
4. Is this the simplest maintainable solution?
5. Will another developer understand this six months from now?
6. Should this decision be documented for future contributors?

If any answer is "No" or uncertain, stop and explain the concern before proceeding.