"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { getOfferingPackages } from "@/lib/configurable-offerings";
import PaymentSelector from "./PaymentSelector";
import { usePaymentPreference } from "./usePaymentPreference";
import ProductStatusBadge from "./ProductStatusBadge";
import styles from "./ProductPurchase.module.css";

type Offering = ReturnType<typeof getOfferingPackages>[number];

/** Existing bundles are editorial previews: no confirmed bundle prices or payment configuration. */
export default function ProductPurchase({ offering }: { offering: Offering }) {
  const { product, detail, packages, heroImageIndex } = offering;
  const { payment, selectPayment } = usePaymentPreference(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const note = detail.imageNotes[heroImageIndex];
  const selected = packages.find(bundle => bundle.id === selectedId);
  useEffect(() => {
    let active = true;
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("package");
      const quantity = Number(params.get("quantity") ?? 1);
      if (active) setQuantity(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 999 ? quantity : 1);
      if (active) setSelectedId(packages.some(bundle => bundle.id === id) ? id! : "");
    };
    void Promise.resolve().then(restore);
    window.addEventListener("popstate", restore);
    return () => { active = false; window.removeEventListener("popstate", restore); };
  }, [packages]);
  const updateQuery = (key: string, value: string) => {
    // ID-only URL state survives refresh, back/forward and the existing safe login returnTo.
    // Never serialize a price, payment details or an automatic cart action.
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.pushState(null, "", url.pathname + url.search);
  };
  const select = (id: string) => { setSelectedId(id); updateQuery("package", id); };
  return <div className={styles.page}>
    <h1>购买 {product.name}</h1>
    <div className={styles.purchase}>
      <figure className={styles.media}>
        <Image src={product.images[heroImageIndex]} alt={note.alt} width={note.width} height={note.height} sizes="(max-width: 767px) 100vw, 60vw" loading="eager"/>
        <figcaption>{note.caption}</figcaption>
      </figure>
      <div className={styles.options}>
        <ProductStatusBadge status={product.status}/>
        <p className={styles.note}>{detail.statusNote}</p>
        <fieldset className={styles.packages}><legend>配置套餐选择</legend>
          {packages.length ? packages.map(bundle => <label key={bundle.id} className={styles.choice} data-selected={selectedId === bundle.id}>
            <input type="radio" name={`package-${product.id}`} value={bundle.id} checked={selectedId === bundle.id} onChange={() => select(bundle.id)}/>
            <span><strong>{bundle.name}</strong><ul>{bundle.items.map(item => <li key={item}>{item}</li>)}</ul><span className={styles.price}>价格待确认</span></span>
          </label>) : <p>套餐待确认</p>}
        </fieldset>
        {detail.bundleNote && <p className={styles.note}>{detail.bundleNote}</p>}
        <label className="mt-4 block">数量<input aria-label="数量" type="number" min="1" max="999" value={quantity} onChange={event => { const value = Number(event.target.value); if (Number.isSafeInteger(value) && value > 0 && value <= 999) { setQuantity(value); updateQuery("quantity", String(value)); } }} className="ml-3 w-20 rounded border border-[var(--border)] p-2"/></label>
        <section className={styles.payment}><PaymentSelector value={payment} onChange={value => { selectPayment(value); updateQuery("payment", value); }}/></section>
        <section className={styles.summary} aria-labelledby="selection-title">
          <h2 id="selection-title">当前选择</h2><p aria-live="polite">{selected?.name ?? "请选择套餐"}</p>
          <p className={styles.amount}>价格待确认</p>
          <button type="button" disabled aria-describedby="purchase-unavailable">加入购物车</button>
          <p id="purchase-unavailable" className={styles.note}>当前仅供套餐预览，暂未开放销售；套餐价格待确认，支付渠道尚未接入。</p>
        </section>
      </div>
    </div>
    <div className={styles.customization}>
      <p>如有其他要求，可以深度定制。</p>
      <Link href={{ pathname: "/deep-customization", query: { product: product.slug, ...(selectedId ? { package: selectedId } : {}), quantity: String(quantity), ...(payment ? { payment } : {}) } }}>深度定制 <span aria-hidden="true">→</span></Link>
    </div>
    <section className={styles.recommendations} aria-labelledby="recommendations-title"><h2 id="recommendations-title">更多推荐</h2><p>暂无已确认的推荐商品。</p></section>
  </div>;
}
