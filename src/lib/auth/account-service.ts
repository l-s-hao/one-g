import type { LoginResult } from "@/types/auth";
import { mockAuthEnabled } from "../demo-mode";
import { checkAccountPassword, createMemoryAccount, findAccount, registrationErrors, type RegistrationProfile } from "./accounts";
import { allowsChannel, AuthFlowError, genericAuthError, normalizeAddress, type AccountChannel, type ServiceRegion } from "./policy";
import { verificationService, type VerifyRequest } from "./verification";
export type PasswordLoginRequest = { region: ServiceRegion; channel: AccountChannel; recipient: string; password: string };
export type RegistrationRequest = { profile: RegistrationProfile; verification: VerifyRequest; requestId: string };
const attempts = new Map<string, { count: number; until: number }>();
const registrations = new Map<string, { signature: string; task: Promise<void> }>();
export const accountService = {
  mode: mockAuthEnabled ? "mock" as const : "unconfigured" as const,
  async passwordLogin(input: PasswordLoginRequest, signal?: AbortSignal): Promise<LoginResult> {
    if (!mockAuthEnabled || !allowsChannel(input.region, input.channel)) throw genericAuthError();
    const key = `${input.channel}:${normalizeAddress(input.channel, input.recipient)}`;
    const now = Date.now(); const old = attempts.get(key);
    if (old && old.until > now && old.count >= 5) throw new AuthFlowError("尝试次数过多，请稍后再试。", old.until);
    const record = old && old.until > now ? old : { count: 0, until: now + 300_000 };
    record.count++; attempts.set(key, record);
    const user = findAccount(input.channel, input.recipient);
    const verified = !!user && await checkAccountPassword(user, input.password);
    signal?.throwIfAborted();
    if (!verified || !user) throw genericAuthError();
    attempts.delete(key);
    return { ok: true, user: { id: user.id, email: user.email, role: "USER" } };
  },
  async register(input: RegistrationRequest, signal?: AbortSignal): Promise<void> {
    if (!mockAuthEnabled || !input.requestId || "role" in input || "role" in input.profile || Object.keys(registrationErrors(input.profile)).length) throw genericAuthError();
    const { profile, verification } = input;
    if (verification.purpose !== "register" || verification.channel !== "email" || verification.region !== profile.region || normalizeAddress("email", verification.recipient) !== normalizeAddress("email", profile.email)) throw genericAuthError();
    // Request IDs and public profile signatures support safe in-memory retries;
    // no raw password/code/token or complete draft is retained in this cache.
    const signature = JSON.stringify({ ...profile, password: undefined, email: normalizeAddress("email", profile.email), challengeId: verification.challengeId });
    const prior = registrations.get(input.requestId);
    if (prior) { if (prior.signature !== signature) throw genericAuthError(); return prior.task; }
    const task = (async () => {
      await verificationService.consumeRegistration(verification, signal);
      signal?.throwIfAborted(); await createMemoryAccount(profile, signal);
    })();
    registrations.set(input.requestId, { signature, task });
    try { await task; } catch (error) { registrations.delete(input.requestId); throw error; }
  },
};
