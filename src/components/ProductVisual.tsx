import Image from "next/image";

export default function ProductVisual({ label, compact = false, images = [] }: { label: string; compact?: boolean; images?: string[] }) {
  if (images[0]) return <div className={`product-visual ${compact ? "product-visual--compact" : ""}`}><Image src={images[0]} alt={label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" /></div>;
  return <div className={`product-visual ${compact ? "product-visual--compact" : ""}`} aria-label={`${label} 产品视觉占位`}><span className="product-visual__grid" /><span className="product-visual__mark">ONE - G</span><span className="product-visual__label">{label}</span></div>;
}
