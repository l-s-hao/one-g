"use client";

import { useState } from "react";
import { LDiv, LSpan } from "@/i18n/Elements";
import ContentImage from "./ContentImage";

export default function ProductVisual({ label, compact = false, images = [] }: { label: string; compact?: boolean; images?: string[] }) {
  const src = images[0];
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const failed = !!src && failedSource === src;
  return <LDiv className={`product-visual ${compact ? "product-visual--compact" : ""}`} data-image-state={!src ? "pending" : failed ? "failed" : "available"}>
    {src ? <ContentImage src={src} alt={label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" onError={() => setFailedSource(src)}/>
      : <LSpan className="product-visual__placeholder">图片待补</LSpan>}
  </LDiv>;
}
