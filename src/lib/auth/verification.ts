import type { CurrentUser } from "@/types/auth";
import { mockAuthEnabled } from "../demo-mode";
import { mockUsers } from "@/data/mock-users";

export type LoginChannel = "phone" | "email";
export type VerificationRequest = { channel: LoginChannel; recipient: string };
export type Challenge = VerificationRequest & { id: string; expiresAt: number; resendAt: number; codeLength: number };
export type VerifyRequest = VerificationRequest & { challengeId: string; code: string };
export interface VerificationService {
  readonly mode: "mock" | "unconfigured";
  send(request: VerificationRequest, signal?: AbortSignal): Promise<Challenge>;
  verify(request: VerifyRequest, signal?: AbortSignal): Promise<CurrentUser>;
  discard(id: string): void;
}
export const normalizeRecipient = (channel: LoginChannel, value: string) => channel === "email" ? value.trim().toLowerCase() : value.trim();
export const validRecipient = (channel: LoginChannel, value: string) => channel === "phone" ? /^1[3-9]\d{9}$/.test(value) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export class VerificationError extends Error {
  constructor(message: string, readonly retryAt?: number) { super(message); }
}

// Fictional fixtures with explicitly pre-bound identifiers. Never infer links from profile/contact data.
// Existing IDs remain unchanged; no signup, role input, account merging or real message delivery.
export const testIdentities = [
  { userId: "user-demo", phone: "19900000001", email: "demo-a@example.test" },
  { userId: "user-demo-b", phone: "19900000002", email: "demo-b@example.test" },
] as const;
export const testCode = "004271";
export function createMockVerificationService(now = () => Date.now(), delay = 350): VerificationService {
  const challenges = new Map<string, Challenge & { userId: string; attempts: number }>();
  const cooldowns = new Map<string, number>();
  const pause = async (signal?: AbortSignal) => { await new Promise(resolve => setTimeout(resolve, delay)); signal?.throwIfAborted(); };
  return {
    mode: "mock",
    async send(request, signal) {
      await pause(signal);
      const recipient = normalizeRecipient(request.channel, request.recipient);
      if (!validRecipient(request.channel, recipient)) throw new VerificationError("请输入有效的手机号或邮箱。");
      const key = `${request.channel}:${recipient}`;
      const retryAt = cooldowns.get(key) ?? 0;
      if (retryAt > now()) throw new VerificationError("请求过于频繁，请稍后重试。", retryAt);
      const identity = testIdentities.find(item => item[request.channel] === recipient);
      if (!identity) throw new VerificationError("暂时无法完成请求，请检查输入或稍后重试。");
      for (const [id, old] of challenges) if (old.channel === request.channel && old.recipient === recipient) challenges.delete(id);
      const challenge: Challenge = { ...request, recipient, id: crypto.randomUUID(), expiresAt: now() + 300_000, resendAt: now() + 60_000, codeLength: 6 };
      challenges.set(challenge.id, { ...challenge, userId: identity.userId, attempts: 0 });
      cooldowns.set(key, challenge.resendAt);
      return challenge;
    },
    async verify(request, signal) {
      await pause(signal);
      const challenge = challenges.get(request.challengeId);
      const invalid = () => new VerificationError("验证码错误或已失效，请重试或重新获取。");
      if (!challenge || challenge.expiresAt <= now() || challenge.attempts >= 5) { challenges.delete(request.challengeId); throw invalid(); }
      challenge.attempts++;
      if (challenge.channel !== request.channel || challenge.recipient !== normalizeRecipient(request.channel, request.recipient) || request.code !== testCode) {
        if (challenge.attempts >= 5) challenges.delete(request.challengeId);
        throw invalid();
      }
      challenges.delete(request.challengeId);
      const user = mockUsers.find(item => item.id === challenge.userId && item.role === "USER");
      if (!user) throw invalid();
      return { id: user.id, email: user.email, role: "USER" };
    },
    discard(id) { challenges.delete(id); },
  };
}
const unavailable = async (): Promise<never> => { throw new VerificationError("验证码服务尚未接入，暂不支持真实用户登录。"); };
// Replace the adapter only after a real backend contract is configured; no imaginary static API.
export const verificationService: VerificationService = mockAuthEnabled
  ? createMockVerificationService()
  : { mode: "unconfigured", send: unavailable, verify: unavailable, discard() {} };
