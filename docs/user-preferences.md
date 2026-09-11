# Frontend Authentication Prototype

DEMO ONLY. No database, real authentication, backend permissions, password storage
or production deployment is implemented. The mock credentials are public source
fixtures and must be removed before production. This prototype must not authorize
real data or be deployed as a login security system.

- USER: user@one-g.com / 123456, /login -> /account.
- ADMIN: admin@one-g.com / admin123, /admin/login -> /admin.
- Each login calls the same AuthProvider with its fixed required role; there is no
  public role selector or administrator registration.
- RequireRole checks content access, not just navigation visibility. Anonymous
  users are redirected to the appropriate login; USER cannot view admin content;
  ADMIN visiting /account is redirected to /admin.
- `one-g-auth-demo` stores only `{version: 1, userId}`. Refresh resolves identity
  from the mock fixture; stored roles are never authoritative. Any browser-only
  identity remains forgeable. No entered password is written to storage.
- Logout removes demo auth, clears in-memory user and restores Dark. USER exits
  to /; ADMIN exits to /admin/login. Cross-tab auth changes are synchronized.
- ThemeProvider remains the sole theme context. Anonymous users use Dark. Legacy
  `one-g-theme` and older demo session keys are ignored. USER preferences live at
  `one-g-theme:<user-id>` and survive logout. Account theme cards require USER login.
- SSR and initial client state are anonymous/Dark, with session restoration after
  mount, avoiding hydration mismatch.
- Registration and password reset remain unavailable; Dashboard management modules
  are interactive placeholders with no CRUD or real records.

## Migration

Keep forms and the shared AuthProvider interface; replace src/lib/auth-client.ts
with a backend auth API, PostgreSQL users and Session / HttpOnly cookies. Enforce
roles at every server endpoint; client guards are only UX. Delete mock-users.ts,
all plaintext fixtures, demo storage and credential notices before production.

Replace src/lib/user-preferences.ts with authenticated GET/PATCH
/api/me/preferences, accepting/returning {"theme":"apple"}. User identity must
come from the server session. Use user_preferences: id, unique user_id foreign key,
theme, created_at, updated_at. Migrate a user's local preference only if no server
preference exists; the database becomes authoritative. No such APIs exist yet.
