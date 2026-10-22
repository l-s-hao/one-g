export const serviceRegions = {
  mainland: { label: "中国大陆（+86）", channels: ["email", "phone", "wechat"], requiresPhone: true },
  international: { label: "中国大陆以外（仅邮箱）", channels: ["email"], requiresPhone: false },
} as const;
export type ServiceRegion = keyof typeof serviceRegions;
export type AccountChannel = "email" | "phone";
export type VerificationPurpose = "register" | "login" | "bind-phone";
export const isServiceRegion = (value: unknown): value is ServiceRegion => value === "mainland" || value === "international";
export const normalizeAddress = (channel: AccountChannel, value: string) => channel === "email" ? value.trim().toLowerCase() : value.trim();
export const validAddress = (channel: AccountChannel, value: string) => channel === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : /^1[3-9]\d{9}$/.test(value);
export function allowsChannel(region: ServiceRegion, channel: string) {
  return isServiceRegion(region) && (serviceRegions[region].channels as readonly string[]).includes(channel);
}
export function validPassword(value: string) {
  // No existing registration policy existed. Proposed registration policy only;
  // old fixture passwords remain usable. Never trim/truncate password input.
  return value.length >= 12 && value.length <= 128 && /[A-Za-z]/.test(value) && /[^A-Za-z]/.test(value);
}
export class AuthFlowError extends Error {
  constructor(message: string, readonly retryAt?: number) { super(message); }
}
export const genericAuthError = () => new AuthFlowError("无法完成验证，请检查资料或稍后重试。");
export type VerificationContext = { purpose: VerificationPurpose; region: ServiceRegion; channel: AccountChannel; recipient: string };
export function checkedContext(input: VerificationContext): VerificationContext {
  if (!isServiceRegion(input.region) || !allowsChannel(input.region, input.channel) || !validAddress(input.channel, normalizeAddress(input.channel, input.recipient))
    || !["register", "login"].includes(input.purpose) || (input.purpose === "register" && input.channel !== "email")) throw genericAuthError();
  return { purpose: input.purpose, region: input.region, channel: input.channel, recipient: normalizeAddress(input.channel, input.recipient) };
}
export const contextKey = (input: VerificationContext) => JSON.stringify(checkedContext(input));
