import type { CurrentUser } from "@/types/auth";

// DEMO ONLY
// 仅用于前端原型。
// 仅保存虚构夹具的慢速派生校验值，不提供正式认证。
export const mockUsers: readonly (CurrentUser & { passwordSalt: string; passwordVerifier: string })[] = [
  { id: "user-demo", email: "user@one-g.com", passwordSalt: "041b9e239af9c0db5bdbe82c3bcefbcb", passwordVerifier: "7c739d9e13405a8168a7a7003f7ea8ad625bc92c93d7d5c87d474da6710f94d6", role: "USER" },
  { id: "user-demo-b", email: "user-b@one-g.com", passwordSalt: "3ae71c15c4abc11794d9c47452d32c32", passwordVerifier: "29b481b51892472ea24e2321e8c7a2e36eca5b7409a82f01f52d3505affee144", role: "USER" },
  { id: "admin-demo", email: "admin@one-g.com", passwordSalt: "174dd4ce82d0b0ba5e065916eb1f657a", passwordVerifier: "6cd9523302f60c16d5d25afd5cf56b876fd92f2f68cc2bc905c8803d91201c85", role: "ADMIN" },
];
