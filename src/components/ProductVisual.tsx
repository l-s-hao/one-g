import { LDiv, LSpan } from "@/i18n/Elements";
import { LocalizedImage as Image } from "@/i18n/Elements";

export default function ProductVisual({ label, compact = false, images = [] }: { label: string; compact?: boolean; images?: string[] }) {
  if (images[0]) return <LDiv className={`product-visual ${compact ? "product-visual--compact" : ""}`}><Image src={images[0]} alt={label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" /></LDiv>;
  return <LDiv className={`product-visual ${compact ? "product-visual--compact" : ""}`} aria-label={`${label} 产品视觉占位`}><LSpan className="product-visual__grid" /><LSpan className="product-visual__mark">ONE - G</LSpan><LSpan className="product-visual__label">{label}</LSpan></LDiv>;
}
