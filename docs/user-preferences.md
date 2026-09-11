# User theme preferences

The account service is not connected and login is not available. AuthProvider
reserves the CurrentUser and AuthState interfaces (currentUser, ready, logout),
but currently provides an anonymous state only. It does not read localStorage
sessions, including any legacy demo identity. Login/register forms retain the
existing service-unavailable response; no demo login or password storage exists.

ThemeProvider remains the sole theme context. Anonymous users always use Dark;
legacy `one-g-theme` is ignored. The protected /account page and theme cards are
prepared for future authenticated users but are currently inaccessible: /account
redirects to /login. Theme preferences use `one-g-theme:<currentUser.id>` only once
a verified user is supplied. Preference data is retained on logout.

When real authentication is ready, implement AuthProvider with a verified server
session. Keep SSR and initial client state anonymous/Dark until the session is
confirmed. Implement logout against that service and clear currentUser; the theme
context then restores Dark. Never accept a browser-stored identity as authentication.

Replace the storage adapter in `src/lib/user-preferences.ts` with authenticated
GET/PATCH `/api/me/preferences` returning/accepting `{ "theme": "apple" }`.
Derive user identity from the server session, never a client-supplied user ID.
Validate the four theme IDs.

Use a `user_preferences` table: `id`, unique `user_id` (foreign key), `theme`,
`created_at`, `updated_at`. Preferences affect only the requesting user, including
admins. Migrate that user's local preference only if no database preference exists;
the database becomes authoritative. No database or API is implemented in this phase.
