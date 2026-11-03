"use client";

import { useState } from "react";
import { LDiv, LSpan } from "@/i18n/Elements";
import { LocalizedImage as Image } from "@/i18n/Elements";

export default function ProductVisual({ label, compact = false, images = [] }: { label: string; compact?: boolean; images?: string[] }) {
  const src = images[0];
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const failed = !!src && failedSource === src;
  // 缺少素材与请求失败分开说明；失败时不设置替代 URL，避免回退地址失效后循环请求。
  return <LDiv className={`product-visual ${compact ? "product-visual--compact" : ""}`} data-image-state={!src ? "pending" : failed ? "failed" : "available"}>
    {src && !failed ? <Image src={src} alt={label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" onError={() => setFailedSource(src)} />
      : <LSpan className="product-visual__placeholder">{failed ? "图片加载失败" : "图片待补"}</LSpan>}
  </LDiv>;
}
