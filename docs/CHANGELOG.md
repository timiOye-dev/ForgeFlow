# Changelog

## [Unreleased]

### Phase 1 — Scope cleanup and ticket reconciliation

#### Added

- FF-019: Added an explicit sample/demo label to the Recent Activity feed.

#### Removed

- FF-014: Removed the mock notification bell, popover, hardcoded notification items, and notification UI state from the top navigation.
- FF-039: Removed the notifications field from the active user profile shape. Legacy notification data in stored account records is ignored rather than purged.
- V1C-02: Removed estimated and logged hour fields from task creation forms, task models, task lists, dashboard statistics, landing-page copy, and seed data. Legacy hour fields in existing localStorage task records remain readable and are ignored rather than purged.
- V1C-03: Removed the inaccurate `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` declaration from `metadata.json`.

#### Changed

- FF-034: Task Details is now recorded as Deferred / Out of V1; no dedicated Task Details page or route was added.
- FF-041: Preferences Settings deferred from Version 1; Preferences is no longer part of the V1 Account scope.
- FF-012: Replaced placeholder authentication with account-backed registration and login, salted PBKDF2 password hashing, validated sessions, persistent demo sign-in, profile synchronization, and honest local-demo password-reset messaging.
- V1C-05: Reconciled `docs/TASK.md` statuses and recorded verification criteria for FF-025 and FF-036 without representing them as previously approved acceptance criteria.

### Phase 2 — UI, accessibility, and usability

#### Changed

- Improved form accessibility across Account, project, and task screens with explicit label associations and responsive layouts.
- Hardened the shared `Modal` with dialog semantics, a labelled title, focus trapping/restoration, Escape handling, and mobile-safe padding.
- Improved global search with a labelled input, listbox result semantics, arrow-key navigation, and focus-friendly clearing.
- Added explicit labels for task status, project filters, milestone, note, file upload, and delete controls; added empty states for project detail sections.
- Added global `:focus-visible` styling for keyboard navigation.

### Phase 3 — FF-040 verification

#### Verified

- FF-040: Verified the existing account-backed Light and Dark appearance settings, including per-account persistence, session restoration, fallback for missing/invalid themes, profile update preservation, and no separate theme localStorage key. No new implementation was added.

### Phase 4 — Documentation reconciliation

#### Changed

- Reconciled README and product/engineering documentation with the implemented V1 scope and completed Phase 1–3 work.
