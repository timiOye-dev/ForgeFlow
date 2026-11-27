# ForgeFlow

ForgeFlow is a local-first V1 project management workspace for freelancers and small teams. It runs entirely in the browser with seeded demo data and localStorage; there is no backend or real-time service in V1.

## What is included

- Account registration, login, demo quick sign-in, and protected routes.
- Dashboard with statistics, a clearly labelled static sample activity feed, upcoming deadlines, and quick actions.
- Projects with milestones, notes, and metadata-only file entries.
- Tasks with statuses, priorities, due dates, and create/edit/delete flows.
- Account profile editing and account-backed Light/Dark appearance settings.

Task Details, Preferences, notifications, time tracking, real password recovery, AI features, calendar, team collaboration, real file storage, and mobile apps are not part of V1. ForgeFlow does not track live activity; the Recent Activity feed is demo data only.

## Setup

Requires Node.js with npm. From the project root:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The Vite dev server is configured in `vite.config.js`; no environment variables are required for local V1 use.

## Demo sign-in

Use the **Demo Quick Sign In** button on the login page, or sign in manually with:

- Email: `demo@forgeflow.local`
- Password: `password123`

The Forgot Password page only displays a local-demo notice; password recovery is deferred.

## Scripts

| Script                 | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the Vite dev server on port 3000. |
| `npm run build`        | Create a production build.              |
| `npm run preview`      | Preview the production build.           |
| `npm test`             | Run Node.js tests.                      |
| `npm run lint`         | Run ESLint.                             |
| `npm run format`       | Format files with Prettier.             |
| `npm run format:check` | Check formatting with Prettier.         |

## Data and persistence

- Seed data lives in `src/mocks/initialData.js`.
- Projects and tasks are persisted in `forgeflow_projects` and `forgeflow_tasks`.
- Accounts, sessions, and the cached user are persisted in `forgeflow_auth_accounts_v1`, `forgeflow_auth_session_v1`, and `forgeflow_user`. Theme is stored on the account profile; there is no separate theme key.
- Activity items are static sample data and are not persisted.
- Account → **Restore Initial Data** resets projects and tasks to seed data and preserves accounts and profile settings.

## Verification

Run:

```bash
npm test
npm run lint
npm run format:check
git diff --check
```

## Documentation

- `docs/PRD.md` — product scope and decisions.
- `docs/TASK.md` — ticket status and verification criteria.
- `docs/ARCHITECTURE.md` — structure and data flow.
- `docs/ENGINEERING_DECISIONS.md` — conventions and decisions.
- `docs/CHANGELOG.md` — change history.
- `docs/AI_WORKFLOW.md` — AI-assisted workflow rules.
