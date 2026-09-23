"use client";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { isPaymentMethod, readPaymentPreference, savePaymentPreference, type PaymentMethod } from "@/lib/payments";
export function usePaymentPreference(fromPurchaseUrl = false) {
  const { currentUser, ready } = useAuth();
  const owner = currentUser?.id;
  const [state, setState] = useState<{ owner?: string; value: PaymentMethod | null } | null>(null);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    const restore = () => {
      if (!active) return;
      const requested = fromPurchaseUrl ? new URLSearchParams(window.location.search).get("payment") : null;
      const value = isPaymentMethod(requested) ? requested : readPaymentPreference(owner);
      if (value && isPaymentMethod(requested)) savePaymentPreference(value, owner);
      setState({ owner, value });
    };
    void Promise.resolve().then(restore);
    window.addEventListener("popstate", restore);
    return () => { active = false; window.removeEventListener("popstate", restore); };
  }, [owner, ready, fromPurchaseUrl]);
  const value = state?.owner === owner ? state?.value ?? null : null;
  const select = (value: PaymentMethod) => { savePaymentPreference(value, owner); setState({ owner, value }); };
  return { payment: value, selectPayment: select };
}
