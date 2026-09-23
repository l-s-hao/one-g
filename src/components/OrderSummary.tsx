"use client";
import { useEffect, useState } from "react";
import { commerceService, orderStatusLabels, type Order, type CompanyBankDetails } from "@/lib/commerce/service";
import { paymentLabel } from "@/lib/payments";
import { formatPrice } from "@/lib/pricing";
export default function OrderSummary({ order }: { order: Order }) {
  const [bank, setBank] = useState<CompanyBankDetails | null>(null);
  useEffect(() => {
    let active = true;
    void commerceService.getBankDetails().then(value => { if (active) setBank(value); });
    return () => { active = false; };
  }, []);
  return <section className="mt-6 space-y-3 rounded-2xl border border-[var(--border)] p-6">
    <h2 className="text-xl font-semibold">{order.demo ? "演示订单（非真实交易）" : "订单详情"}</h2>
    <p className="break-all">订单号：{order.id}</p><p>状态：{orderStatusLabels[order.status]}</p>
    <p>支付方式：{paymentLabel(order.payment)}</p><p>{order.demo ? "演示金额" : "应付金额"}：{formatPrice(order.amount)}</p>
    {order.payment === "bank-transfer" ? bank && !order.demo ? <dl className="space-y-2">
      <dt>公司收款户名</dt><dd>{bank.accountName}</dd><dt>开户银行</dt><dd>{bank.bankName}</dd><dt>银行账号</dt><dd>{bank.accountNumber}</dd><dt>订单号或付款备注要求</dt><dd>{bank.referenceInstructions} · {order.id}</dd>
    </dl> : <p>对公收款信息待配置</p> : <p>支付渠道尚未接入，未发起收款。</p>}
    {order.demo && <p>仅展示本地演示数据，不代表付款成功，不触发发货。</p>}
  </section>;
}
