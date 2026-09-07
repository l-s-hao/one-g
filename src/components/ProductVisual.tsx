export default function ProductVisual({ label, compact = false }: { label: string; compact?: boolean }) {
  return <div className={`product-visual ${compact ? "product-visual--compact" : ""}`} aria-label={`${label} 产品视觉占位`}><span className="product-visual__grid" /><span className="product-visual__mark">ONE - G</span><span className="product-visual__label">{label}</span></div>;
}
