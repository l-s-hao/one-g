import { mockAuthEnabled } from "../demo-mode";
import { mockUsers } from "@/data/mock-users";
import type { CurrentUser } from "@/types/auth";
import { type ServiceRegion, genericAuthError, validPassword, validAddress, normalizeAddress, isServiceRegion } from "./policy";

export const testIdentities = [
  { userId: "user-demo", phone: "19900000001", email: "demo-a@example.test" },
  { userId: "user-demo-b", phone: "19900000002", email: "demo-b@example.test" },
] as const;
export type Affiliation = "individual" | "organization";
export type RegistrationProfile = { region: ServiceRegion; nickname: string; password: string; email: string; phone: string; affiliation: Affiliation; organization: string };
export type AccountRecord = CurrentUser & { nickname: string; region: ServiceRegion; phone?: string; affiliation: Affiliation; organization?: string; emailVerified: boolean; phoneVerified: boolean };
type MemoryAccount = { user: AccountRecord; salt: Uint8Array<ArrayBuffer>; verifier: ArrayBuffer };
const registered = new Map<string, MemoryAccount>();
const publicUser = (user: CurrentUser): CurrentUser => ({ id: user.id, email: user.email, role: user.role });
export function registrationErrors(profile: RegistrationProfile) {
  const errors: Partial<Record<keyof RegistrationProfile, string>> = {};
  if (!isServiceRegion(profile.region)) errors.region = "请选择服务地区。";
  if (!profile.nickname.trim() || profile.nickname.trim().length > 50) errors.nickname = "请输入 1–50 字的昵称。";
  if (!validPassword(profile.password)) errors.password = "密码需为 12–128 字符，并包含字母和非字母字符。";
  if (!validAddress("email", normalizeAddress("email", profile.email))) errors.email = "请输入有效的邮箱地址。";
  if (profile.region === "mainland" && !validAddress("phone", profile.phone.trim())) errors.phone = "请输入有效的 11 位手机号。";
  if (!["individual", "organization"].includes(profile.affiliation)) errors.affiliation = "请选择所属类型。";
  if (profile.affiliation === "organization" && (!profile.organization.trim() || profile.organization.trim().length > 100)) errors.organization = "请输入公司或组织名称（最多 100 字）。";
  return errors;
}
export function findAccount(channel: "email" | "phone", address: string): AccountRecord | undefined {
  const recipient = normalizeAddress(channel, address);
  for (const { user } of registered.values()) {
    if (channel === "email" && user.emailVerified && user.email === recipient) return user;
    if (channel === "phone" && user.phoneVerified && user.phone === recipient) return user;
  }
  const identity = testIdentities.find(item => item[channel] === recipient);
  const fixture = mockUsers.find(user => user.role === "USER" && (user.id === identity?.userId || (channel === "email" && user.email === recipient)));
  if (!fixture) return undefined;
  const trusted = testIdentities.find(item => item.userId === fixture.id);
  return { ...publicUser(fixture), nickname: fixture.id, region: "mainland", phone: trusted?.phone, affiliation: "individual", emailVerified: true, phoneVerified: !!trusted };
}
export function findSessionUser(id: string): CurrentUser | undefined {
  const memory = registered.get(id)?.user;
  const fixture = mockUsers.find(user => user.id === id);
  return memory ? publicUser(memory) : fixture ? publicUser(fixture) : undefined;
}
export async function derivePassword(password: string, salt: Uint8Array<ArrayBuffer>) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" }, key, 256);
}
export async function checkAccountPassword(user: AccountRecord, password: string) {
  const memory = registered.get(user.id);
  if (!memory) return fixturePasswordMatches(user.id, password);
  const actual = new Uint8Array(await derivePassword(password, memory.salt));
  const expected = new Uint8Array(memory.verifier);
  let difference = 0; for (let i = 0; i < expected.length; i++) difference |= actual[i] ^ expected[i];
  return difference === 0;
}
export async function createMemoryAccount(profile: RegistrationProfile, signal?: AbortSignal) {
  if (!mockAuthEnabled || Object.keys(registrationErrors(profile)).length || !profile.email.trim().toLowerCase().endsWith(".test")) throw genericAuthError();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const verifier = await derivePassword(profile.password, salt); signal?.throwIfAborted();
  // Atomic within this one JS realm: no await between duplicate check and insert.
  if (findAccount("email", profile.email)) throw genericAuthError();
  const user: AccountRecord = {
    id: crypto.randomUUID(), email: normalizeAddress("email", profile.email), role: "USER", nickname: profile.nickname.trim(), region: profile.region,
    phone: profile.region === "mainland" ? profile.phone.trim() : undefined,
    affiliation: profile.affiliation, organization: profile.affiliation === "organization" ? profile.organization.trim() : undefined,
    emailVerified: true, phoneVerified: false,
  };
  registered.set(user.id, { user, salt, verifier }); return user;
}

export async function fixturePasswordMatches(id: string, password: string) {
  if (!mockAuthEnabled) return false;
  const fixture = mockUsers.find(item => item.id === id);
  if (!fixture) return false;
  const bytes = (hex: string) => Uint8Array.from(hex.match(/.{2}/g) ?? [], value => parseInt(value, 16));
  const actual = new Uint8Array(await derivePassword(password, bytes(fixture.passwordSalt)));
  const expected = bytes(fixture.passwordVerifier);
  let difference = 0; for (let i = 0; i < expected.length; i++) difference |= actual[i] ^ expected[i];
  return difference === 0;
}
