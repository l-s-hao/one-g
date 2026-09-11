export type UserRole = "USER" | "ADMIN";

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
}

export type LoginResult = { ok: true; user: CurrentUser } | { ok: false; error: "INVALID_CREDENTIALS" | "WRONG_ROLE" | "SESSION_CHANGED" };
