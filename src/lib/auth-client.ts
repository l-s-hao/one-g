import { mockUsers } from "@/data/mock-users";
import type { CurrentUser, LoginResult, UserRole } from "@/types/auth";

// DEMO ONLY: browser state is forgeable and grants no real permissions.
export const demoAuthKey = "one-g-auth-demo";
const publicUser = (user: CurrentUser): CurrentUser => ({ id: user.id, email: user.email, role: user.role });

// Replace this adapter with backend auth + HttpOnly session cookies later.
export async function authenticate(email: string, password: string, role: UserRole): Promise<LoginResult> {
  const user = mockUsers.find(item => item.email === email.trim().toLowerCase() && item.password === password);
  if (!user) return { ok: false, error: "INVALID_CREDENTIALS" };
  if (user.role !== role) return { ok: false, error: "WRONG_ROLE" };
  return { ok: true, user: publicUser(user) };
}

export function readDemoSession(): CurrentUser | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(demoAuthKey) ?? "null");
    if (!stored || typeof stored !== "object" || !("userId" in stored) || !("version" in stored) || stored.version !== 1) return null;
    const user = mockUsers.find(item => item.id === stored.userId);
    return user ? publicUser(user) : null;
  } catch { return null; }
}

export function saveDemoSession(user: CurrentUser | null) {
  try {
    if (user) localStorage.setItem(demoAuthKey, JSON.stringify({ version: 1, userId: user.id }));
    else localStorage.removeItem(demoAuthKey);
  } catch { /* Restricted storage: keep session in memory only. */ }
}
