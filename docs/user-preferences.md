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
  ADMIN visiting /account is redirected to /admin. Each role has its own center UI and reuses ThemeSelector.
- `one-g-auth-demo` stores only `{version: 1, userId}`. Refresh resolves identity
  from the mock fixture; stored roles are never authoritative. Any browser-only
  identity remains forgeable. No entered password is written to storage.
- Logout removes demo auth, clears in-memory user and restores Dark. USER exits
  to /; ADMIN exits to /admin/login. Cross-tab auth changes are synchronized.
- ThemeProvider remains the sole theme context. Anonymous users use Dark. Legacy
  `one-g-theme` and older demo session keys are ignored. USER and ADMIN preferences live at
  `one-g-theme:<user-id>` and survive logout. Theme cards require login and appear in /account for USER and /admin for ADMIN.
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
/api/me/preferences, accepting/returning {"theme":"zandan-green"}. User identity must
come from the server session. Use user_preferences: id, unique user_id foreign key,
theme, created_at, updated_at. Migrate a user's local preference only if no server
preference exists; the database becomes authoritative. No such APIs exist yet.

## Public and protected navigation

The single policy in src/lib/auth-routing.ts allows anonymous access only to /,
/about, /login and /admin/login. Every other non-admin route defaults to USER;
/admin and its descendants default to ADMIN, excluding its public login. Under
this explicit four-route allowlist, legacy register/forgot-password placeholders
are also no longer anonymously accessible.

SiteShell applies RequireRole to route content, including future routes, without
copying guards into individual pages. Until AuthProvider.authReady, protected
content renders only a loading message. USER access to admin displays no permission;
ADMIN visiting a user business route, including /account, goes to /admin. These are prototype client
UX checks, not secure server authorization or protection of static export data.

ProtectedLink handles business links; NavigationLink chooses it for dynamic menus
and leaves public/About/search anchors as ordinary Next Links. Homepage CTAs,
product detail links, Header/mobile menus and Footer share this behavior. The
ShimmerButton's link wrapper changed, but its styling and animation did not.

Login redirects carry a URL-encoded returnTo, including search/hash. Successful
login returns there, otherwise defaults to /account (USER) or /admin (ADMIN).
safeReturnTo rejects external/protocol-relative URLs, encoded URL tricks, login
loops and cross-role paths. Explicit Header login has no returnTo. Logout restores
Dark and redirects away from protected content; per-user preferences are preserved.

Color Vision Safe (`color-vision-safe`) is retained as the final theme. It uses blue/amber accents, dark surfaces, and explicit selection/progress/error symbols. Preferences still use the same per-user storage adapter; logout restores Dark without deleting the preference.

The current ThemeId union is dark | zandan-green | aegean-blue | falu-red | burnt-brick | color-vision-safe. Theme cards use three columns on desktop and two on mobile. The retired IDs deep-sea, tea-blossom and apple are accepted only by the migration in loadUserTheme: on authenticated preference load they are rewritten to dark at that user's existing key. Other users' preferences are untouched; storage failures still fall back to Dark in memory.

Account centers are independent: USER gets shopping, orders, addresses, shared support contacts and personal themes; ADMIN gets management placeholders, read-only site contact settings and personal themes. AccountActions shares switch/logout logic. Switching clears the session with an explicit /login?mode=switch exit target consumed by the guard, preserves per-user themes and restores anonymous Dark. USER logout goes home; ADMIN logout goes to /admin/login. The additional frontend fixture user-b@one-g.com / 123456 (user-demo-b) supports checking user-to-user isolation; it is DEMO ONLY, like the other fixtures.
