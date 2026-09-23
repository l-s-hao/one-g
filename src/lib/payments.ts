export const paymentMethods = [
  { id: "alipay", label: "支付宝", note: "尚未接入，当前仅记录支付偏好。" },
  { id: "wechat-pay", label: "微信支付", note: "尚未接入，当前仅记录支付偏好。" },
  { id: "bank-transfer", label: "对公转账", note: "对公收款信息待配置。" },
] as const;
export type PaymentMethod = typeof paymentMethods[number]["id"];
export const isPaymentMethod = (value: unknown): value is PaymentMethod => paymentMethods.some(method => method.id === value);
export const paymentLabel = (value: PaymentMethod) => paymentMethods.find(method => method.id === value)!.label;
export function readPaymentPreference(userId?: string): PaymentMethod | null {
  try {
    const value = userId ? localStorage.getItem(`one-g-payment:${userId}`) : sessionStorage.getItem("one-g-payment:guest");
    return isPaymentMethod(value) ? value : null;
  } catch { return null; }
}
export function savePaymentPreference(value: PaymentMethod, userId?: string) {
  try { if (userId) localStorage.setItem(`one-g-payment:${userId}`, value); else sessionStorage.setItem("one-g-payment:guest", value); } catch { /* Keep URL/in-memory selection when storage is unavailable. */ }
}
