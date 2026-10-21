"use client";

import { LButton, LDiv, LFieldset, LFigcaption, LFigure, LH1, LH2, LInput, LLabel, LLegend, LLi, LP, LSection, LSpan, LStrong, LUl } from "@/i18n/Elements";


import { LocalizedImage as Image } from "@/i18n/Elements";
import { LocalizedLink as Link } from "@/i18n/Elements";
import { useEffect, useState } from "react";
import type { getOfferingPackages } from "@/lib/configurable-offerings";
import CardHover from "./CardHover";
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
  return <LDiv className={styles.page}>
    <LH1>购买 {product.name}</LH1>
    <LDiv className={styles.purchase}>
      <LFigure className={styles.media}>
        <Image src={product.images[heroImageIndex]} alt={note.alt} width={note.width} height={note.height} sizes="(max-width: 767px) 100vw, 60vw" loading="eager"/>
        <LFigcaption>{note.caption}</LFigcaption>
      </LFigure>
      <LDiv className={styles.options}>
        <ProductStatusBadge status={product.status}/>
        <LP className={styles.note}>{detail.statusNote}</LP>
        <LFieldset className={styles.packages}><LLegend>配置套餐选择</LLegend>
          {packages.length ? packages.map(bundle => <CardHover key={bundle.id}><LLabel data-card-hover-surface className={styles.choice} data-selected={selectedId === bundle.id}>
            <LInput type="radio" name={`package-${product.id}`} value={bundle.id} checked={selectedId === bundle.id} onChange={() => select(bundle.id)}/>
            <LSpan><LStrong>{bundle.name}</LStrong><LUl>{bundle.items.map(item => <LLi key={item}>{item}</LLi>)}</LUl><LSpan className={styles.price}>价格待确认</LSpan></LSpan>
          </LLabel></CardHover>) : <LP>套餐待确认</LP>}
        </LFieldset>
        {detail.bundleNote && <LP className={styles.note}>{detail.bundleNote}</LP>}
        <LLabel className="mt-4 block">数量<LInput aria-label="数量" type="number" min="1" max="999" value={quantity} onChange={event => { const value = Number(event.target.value); if (Number.isSafeInteger(value) && value > 0 && value <= 999) { setQuantity(value); updateQuery("quantity", String(value)); } }} className="ml-3 w-20 rounded border border-[var(--border)] p-2"/></LLabel>
        <LSection className={styles.payment}><PaymentSelector value={payment} onChange={value => { selectPayment(value); updateQuery("payment", value); }}/></LSection>
        <LSection className={styles.summary} aria-labelledby="selection-title">
          <LH2 id="selection-title">当前选择</LH2><LP aria-live="polite">{selected?.name ?? "请选择套餐"}</LP>
          <LP className={styles.amount}>价格待确认</LP>
          <LButton effect="invert" intent="purchase" type="button" disabled aria-describedby="purchase-unavailable">加入购物车</LButton>
          <LP id="purchase-unavailable" className={styles.note}>当前仅供套餐预览，暂未开放销售；套餐价格待确认，支付渠道尚未接入。</LP>
        </LSection>
      </LDiv>
    </LDiv>
    <CardHover><LDiv data-card-hover-surface className={styles.customization}>
      <LP>如有其他要求，可以深度定制。</LP>
      <Link effect="invert" effectVariant="secondary" intent="ordinary" effectSurface="card" href={{ pathname: "/deep-customization", query: { product: product.slug, ...(selectedId ? { package: selectedId } : {}), quantity: String(quantity), ...(payment ? { payment } : {}) } }}>深度定制 <LSpan aria-hidden="true">→</LSpan></Link>
    </LDiv></CardHover>
    <LSection className={styles.recommendations} aria-labelledby="recommendations-title"><LH2 id="recommendations-title">更多推荐</LH2><LP>暂无已确认的推荐商品。</LP></LSection>
  </LDiv>;
}
