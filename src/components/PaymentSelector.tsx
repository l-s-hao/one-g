"use client";

import { LFieldset, LInput, LLabel, LLegend, LP, LSmall, LSpan } from "@/i18n/Elements";

import { useId } from "react";
import { paymentMethods, type PaymentMethod } from "@/lib/payments";
export default function PaymentSelector({ value, onChange, disabled = false }: { value: PaymentMethod | null; onChange: (value: PaymentMethod) => void; disabled?: boolean }) {
  const id = useId();
  return <LFieldset disabled={disabled} className="space-y-3"><LLegend className="mb-3 font-semibold">支付方式选择</LLegend>
    {paymentMethods.map(method => <LLabel key={method.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-3 text-sm">
      <LInput type="radio" name={id} value={method.id} checked={value === method.id} onChange={() => onChange(method.id)} className="mt-1"/>
      <LSpan>{method.label}<LSmall className="mt-1 block text-[var(--text-muted)]">{method.note}</LSmall></LSpan>
    </LLabel>)}<LP className="text-xs text-[var(--text-muted)]">仅预选支付方式，不会发起收款。登录方式与支付方式无关。</LP>
  </LFieldset>;
}
