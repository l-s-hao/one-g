import { mockUsers } from "@/data/mock-users";
import type { LoginResult } from "@/types/auth";
import { mockAuthEnabled } from "../demo-mode";
import { normalizeRecipient, testIdentities, verificationService, type LoginChannel } from "./verification";

// Development-only adapter. Never use URL, hostname, storage flags or a form role to enable it.
export const mockShortcutEnabled = process.env.NODE_ENV === "development"
  && mockAuthEnabled && verificationService.mode === "mock";

function findTestUser(channel: LoginChannel, recipient: string) {
  const address = normalizeRecipient(channel, recipient);
  const identity = testIdentities.find(item => item[channel] === address);
  if (identity) return mockUsers.find(user => user.id === identity.userId && user.role === "USER");
  // Reuse the existing administrator record, not a pattern or domain-based role inference.
  const administrator = mockUsers.find(user => user.id === "admin-demo" && user.role === "ADMIN");
  return channel === "email" && administrator?.email === address ? administrator : undefined;
}
export function canUseMockShortcut(channel: LoginChannel, recipient: string) {
  return mockShortcutEnabled && !!findTestUser(channel, recipient);
}
export async function authenticateMockShortcut(channel: LoginChannel, recipient: string, signal?: AbortSignal): Promise<LoginResult> {
  if (!mockShortcutEnabled) return { ok: false, error: "INVALID_CREDENTIALS" };
  // An async boundary allows logout/address changes to cancel before a session is established.
  await Promise.resolve();
  signal?.throwIfAborted();
  const user = findTestUser(channel, recipient);
  return user ? { ok: true, user: { id: user.id, email: user.email, role: user.role } }
    : { ok: false, error: "INVALID_CREDENTIALS" };
}
