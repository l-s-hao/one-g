import type { CurrentUser } from "@/types/auth";
import { mockAuthEnabled } from "../demo-mode";
import { findAccount } from "./accounts";
import { humanVerification, type HumanVerificationAdapter } from "./human";
import { AuthFlowError, checkedContext, contextKey, genericAuthError, normalizeAddress, validAddress, type VerificationContext } from "./policy";
export { testIdentities } from "./accounts";
export { AuthFlowError as VerificationError } from "./policy";
export type LoginChannel = "phone" | "email";
export type VerificationRequest = VerificationContext & { humanToken: string };
export type Challenge = VerificationContext & { id: string; createdAt: number; expiresAt: number; resendAt: number; codeLength: number };
export type VerifyRequest = VerificationContext & { challengeId: string; code: string };
export interface VerificationService {
  readonly mode: "mock" | "unconfigured";
  send(request: VerificationRequest, signal?: AbortSignal): Promise<Challenge>;
  verify(request: VerifyRequest, signal?: AbortSignal): Promise<CurrentUser>;
  consumeRegistration(request: VerifyRequest, signal?: AbortSignal): Promise<void>;
  discard(id: string): void;
}
export const normalizeRecipient = normalizeAddress;
export const validRecipient = validAddress;
// Mock-only fixture, never returned by a real send endpoint.
export const testCode = "004271";
export function createMockVerificationService(now = () => Date.now(), delay = 350, human: HumanVerificationAdapter = humanVerification): VerificationService {
  const challenges = new Map<string, { challenge: Challenge; attempts: number }>();
  const cooldowns = new Map<string, number>();
  const pause = async (signal?: AbortSignal) => { await new Promise(resolve => setTimeout(resolve, delay)); signal?.throwIfAborted(); };
  const consume = async (request: VerifyRequest, purpose: "login" | "register", signal?: AbortSignal) => {
    await pause(signal);
    const invalid = () => new AuthFlowError("验证码错误或已失效，请重试或重新获取。");
    const item = challenges.get(request.challengeId);
    if (!item || item.challenge.expiresAt <= now() || item.attempts >= 5) { challenges.delete(request.challengeId); throw invalid(); }
    item.attempts++;
    let matches = false;
    try { matches = request.purpose === purpose && contextKey(item.challenge) === contextKey(request); } catch { /* Reject malformed requests uniformly. */ }
    if (!matches || request.code !== testCode) { if (item.attempts >= 5) challenges.delete(request.challengeId); throw invalid(); }
    challenges.delete(request.challengeId);
  };
  return {
    mode: "mock",
    async send(input, signal) {
      await pause(signal);
      const request = checkedContext(input);
      human.consume(input.humanToken, request);
      const key = `${request.channel}:${request.recipient}`;
      const retryAt = cooldowns.get(key) ?? 0;
      if (retryAt > now()) throw new AuthFlowError("请求过于频繁，请稍后重试。", retryAt);
      if (request.purpose === "register" && !request.recipient.endsWith(".test")) throw new AuthFlowError("本地演示仅接受虚构的 .test 邮箱，请勿填写真实资料。");
      // Login never creates users, including unknown email/WeChat identities.
      if (request.purpose === "login" && !findAccount(request.channel, request.recipient)) throw genericAuthError();
      for (const [id, old] of challenges) if (old.challenge.channel === request.channel && old.challenge.recipient === request.recipient) challenges.delete(id);
      for (const [id, old] of challenges) if (old.challenge.expiresAt <= now()) challenges.delete(id);
      const challenge: Challenge = { ...request, id: crypto.randomUUID(), createdAt: now(), expiresAt: now() + 300_000, resendAt: now() + 60_000, codeLength: 6 };
      challenges.set(challenge.id, { challenge, attempts: 0 }); cooldowns.set(key, challenge.resendAt);
      return challenge;
    },
    async verify(request, signal) {
      await consume(request, "login", signal);
      const user = findAccount(request.channel, request.recipient);
      if (!user || user.role !== "USER") throw genericAuthError();
      return { id: user.id, email: user.email, role: "USER" };
    },
    async consumeRegistration(request, signal) { await consume(request, "register", signal); },
    discard(id) { challenges.delete(id); },
  };
}
const unavailable = async (): Promise<never> => { throw new AuthFlowError("验证码服务尚未接入，暂不支持真实用户登录。"); };
// A real backend must enforce these same purpose/region/verified-identifier checks.
export const verificationService: VerificationService = mockAuthEnabled ? createMockVerificationService() : {
  mode: "unconfigured", send: unavailable, verify: unavailable, consumeRegistration: unavailable, discard() {},
};
