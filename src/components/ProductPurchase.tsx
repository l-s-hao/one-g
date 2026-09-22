"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { getOfferingPackages } from "@/lib/configurable-offerings";
import ProductStatusBadge from "./ProductStatusBadge";
import styles from "./ProductPurchase.module.css";

type Offering = ReturnType<typeof getOfferingPackages>[number];

/** Existing bundles are editorial previews: no confirmed bundle prices or payment configuration. */
export default function ProductPurchase({ offering }: { offering: Offering }) {
  const { product, detail, packages, heroImageIndex } = offering;
  const [selectedId, setSelectedId] = useState("");
  const note = detail.imageNotes[heroImageIndex];
  const selected = packages.find(bundle => bundle.id === selectedId);
  useEffect(() => {
    let active = true;
    const restore = () => {
      const id = new URLSearchParams(window.location.search).get("package");
      if (active) setSelectedId(packages.some(bundle => bundle.id === id) ? id! : "");
    };
    void Promise.resolve().then(restore);
    window.addEventListener("popstate", restore);
    return () => { active = false; window.removeEventListener("popstate", restore); };
  }, [packages]);
  const select = (id: string) => {
    setSelectedId(id);
    // ID-only URL state survives refresh, back/forward and the existing safe login returnTo.
    // Never serialize a price, payment details or an automatic cart action.
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ package: id }).toString();
    window.history.pushState(null, "", url.pathname + url.search);
  };
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
        <section className={styles.payment} aria-labelledby="payment-title"><h2 id="payment-title">支付方式选择</h2><p>支付方式待配置</p></section>
        <section className={styles.summary} aria-labelledby="selection-title">
          <h2 id="selection-title">当前选择</h2><p aria-live="polite">{selected?.name ?? "请选择套餐"}</p>
          <p className={styles.amount}>价格待确认</p>
          <button type="button" disabled aria-describedby="purchase-unavailable">加入购物车</button>
          <p id="purchase-unavailable" className={styles.note}>当前仅供套餐预览，暂未开放销售；套餐价格与支付方式待确认。</p>
        </section>
      </div>
    </div>
    <div className={styles.customization}>
      <p>如有其他要求，可以深度定制。</p>
      <Link href="/deep-customization">深度定制 <span aria-hidden="true">→</span></Link>
    </div>
    <section className={styles.recommendations} aria-labelledby="recommendations-title"><h2 id="recommendations-title">更多推荐</h2><p>暂无已确认的推荐商品。</p></section>
  </div>;
}
