import { mockAuthEnabled } from "../demo-mode";
import { AuthFlowError, contextKey, type VerificationContext } from "./policy";
export type HumanProof = { token: string; expiresAt: number };
export interface HumanVerificationAdapter {
  readonly mode: "mock" | "unconfigured";
  issue(context: VerificationContext, signal?: AbortSignal): Promise<HumanProof>;
  consume(token: string, context: VerificationContext): void;
  discard(token: string): void;
}
// Deliberately named simulation, not a checkbox/slider pretending to be a provider.
// Real provider integration MUST exchange/verify its token on the trusted server.
export function createMockHumanVerification(now = () => Date.now()): HumanVerificationAdapter {
  const proofs = new Map<string, { key: string; expiresAt: number }>();
  return {
    mode: "mock",
    async issue(context, signal) {
      await Promise.resolve(); signal?.throwIfAborted();
      const key = contextKey(context);
      for (const [token, proof] of proofs) if (proof.expiresAt <= now()) proofs.delete(token);
      const token = crypto.randomUUID(); const expiresAt = now() + 120_000;
      proofs.set(token, { key, expiresAt }); return { token, expiresAt };
    },
    consume(token, context) {
      const proof = proofs.get(token); proofs.delete(token);
      if (!proof || proof.expiresAt <= now() || proof.key !== contextKey(context)) throw new AuthFlowError("请重新完成人机验证后获取验证码。");
    },
    discard(token) { proofs.delete(token); },
  };
}
const unavailable = () => { throw new AuthFlowError("人机验证服务尚未接入，暂不能发送真实验证码。"); };
export const humanVerification: HumanVerificationAdapter = mockAuthEnabled ? createMockHumanVerification() : {
  mode: "unconfigured", async issue() { return unavailable(); }, consume: unavailable, discard() {},
};
