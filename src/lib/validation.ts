/** 仅检查邮箱格式；调用方负责去空白及账号规范化，不表示地址已验证或服务已接入。 */
export function isEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
