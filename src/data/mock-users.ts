import type { CurrentUser } from "@/types/auth";

// DEMO ONLY
// 仅用于前端原型。
// 正式上线必须删除明文密码并接后端认证。
export const mockUsers: readonly (CurrentUser & { password: string })[] = [
  { id: "user-demo", email: "user@one-g.com", password: "123456", role: "USER" },
  { id: "admin-demo", email: "admin@one-g.com", password: "admin123", role: "ADMIN" },
];
