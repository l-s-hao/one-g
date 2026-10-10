"use client";

import { LDd, LDl, LDt, LH2, LP, LSection } from "@/i18n/Elements";

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
  return <LSection className="mt-6 space-y-3 rounded-2xl border border-[var(--border)] p-6">
    <LH2 className="text-xl font-semibold">{order.demo ? "演示订单（非真实交易）" : "订单详情"}</LH2>
    <LP className="break-all">订单号：{order.id}</LP><LP>状态：{orderStatusLabels[order.status]}</LP>
    <LP>支付方式：{paymentLabel(order.payment)}</LP><LP>{order.demo ? "演示金额" : "应付金额"}：{formatPrice(order.amount)}</LP>
    {order.payment === "bank-transfer" ? bank && !order.demo ? <LDl className="space-y-2">
      <LDt>公司收款户名</LDt><LDd>{bank.accountName}</LDd><LDt>开户银行</LDt><LDd>{bank.bankName}</LDd><LDt>银行账号</LDt><LDd>{bank.accountNumber}</LDd><LDt>订单号或付款备注要求</LDt><LDd>{bank.referenceInstructions} · {order.id}</LDd>
    </LDl> : <LP>对公收款信息待配置</LP> : <LP>支付渠道尚未接入，未发起收款。</LP>}
    {order.demo && <LP>仅展示本地演示数据，不代表付款成功，不触发发货。</LP>}
  </LSection>;
}
