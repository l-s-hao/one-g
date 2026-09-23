import { mockCommerceEnabled } from "../demo-mode";
import { assertCartOwner, parseCart } from "../cart";
import { getProductById } from "../products";
import { isPaymentMethod, type PaymentMethod } from "../payments";

export type OrderStatus = "pending" | "processing" | "awaiting-verification" | "paid" | "failed" | "closed";
export const orderStatusLabels: Record<OrderStatus, string> = { pending: "待支付", processing: "支付处理中", "awaiting-verification": "待核实到账", paid: "已支付", failed: "支付失败", closed: "已关闭" };
export interface Order {
  id: string; userId: string; demo: boolean; status: OrderStatus; payment: PaymentMethod;
  items: { productId: string; quantity: number }[]; amount: number; currency: "CNY"; createdAt: string; idempotencyKey: string;
}
export interface CreateOrderInput { items: Order["items"]; payment: PaymentMethod; idempotencyKey: string }
export interface CompanyBankDetails { accountName: string; bankName: string; accountNumber: string; referenceInstructions: string }
export interface CommerceService {
  createOrder(userId: string, input: CreateOrderInput): Promise<Order>;
  initiatePayment(userId: string, orderId: string): Promise<never>;
  getOrder(userId: string, orderId: string): Promise<Order | null>;
  listOrders(userId: string): Promise<Order[]>;
  getBankDetails(): Promise<CompanyBankDetails | null>;
}
function readDemoOrders(userId: string): Order[] {
  assertCartOwner(userId);
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(`one-g-orders:${userId}`) ?? "[]");
    // No browser record can establish paid status, even if someone edits localStorage.
    return Array.isArray(raw) ? raw.filter((item): item is Order => item?.userId === userId && item.demo === true && item.status === "pending" && typeof item.id === "string" && item.id.startsWith("DEMO-") && isPaymentMethod(item.payment) && Number.isFinite(item.amount) && item.amount >= 0 && Array.isArray(item.items) && typeof item.idempotencyKey === "string") : [];
  } catch { return []; }
}
const unavailable = async (): Promise<never> => { throw new Error("订单与支付服务尚未接入，无法创建真实订单或收款。"); };
const demoService: CommerceService = {
  async createOrder(userId, input) {
    assertCartOwner(userId);
    if (!input.idempotencyKey || !isPaymentMethod(input.payment) || !input.items.length) throw new Error("请选择有效商品和支付方式。");
    const orders = readDemoOrders(userId);
    const prior = orders.find(order => order.idempotencyKey === input.idempotencyKey);
    if (prior) {
      if (prior.payment !== input.payment || JSON.stringify(prior.items) !== JSON.stringify(input.items)) throw new Error("结算内容已改变，请重新确认。");
      return prior;
    }
    if (input.items.some(item => !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 999 || getProductById(item.productId)?.price === undefined)) throw new Error("商品价格或数量待确认，暂不能下单。");
    const items = parseCart(input.items);
    if (items.length !== input.items.length) throw new Error("包含暂不可下单的商品。");
    const amount = items.reduce((total, item) => total + item.price! * item.quantity, 0);
    if (!Number.isFinite(amount) || amount < 0) throw new Error("价格无效。");
    const order: Order = { id: `DEMO-${crypto.randomUUID()}`, userId, demo: true, status: "pending", payment: input.payment, items: items.map(item => ({ productId: item.id, quantity: item.quantity })), amount, currency: "CNY", createdAt: new Date().toISOString(), idempotencyKey: input.idempotencyKey };
    // Demo calculation only. A real backend must reprice IDs and enforce session ownership/idempotency.
    localStorage.setItem(`one-g-orders:${userId}`, JSON.stringify([...orders, order]));
    return order;
  },
  async initiatePayment(userId, orderId) {
    const order = await this.getOrder(userId, orderId);
    if (!order) throw new Error("订单不存在或不可访问。");
    throw new Error(order.payment === "bank-transfer" ? "对公收款信息待配置。" : "支付渠道尚未接入，未发起收款。");
  },
  async getOrder(userId, id) { return readDemoOrders(userId).find(order => order.id === id) ?? null; },
  async listOrders(userId) { return readDemoOrders(userId); },
  async getBankDetails() { return null; },
};
export const commerceService: CommerceService = mockCommerceEnabled ? demoService : {
  createOrder: unavailable, initiatePayment: unavailable,
  async getOrder() { return null; }, async listOrders() { return []; }, async getBankDetails() { return null; },
};
// Querying order status is the only result source. Query-string success flags are ignored.
export async function queryPaymentStatus(userId: string, orderId: string) { return commerceService.getOrder(userId, orderId); }
