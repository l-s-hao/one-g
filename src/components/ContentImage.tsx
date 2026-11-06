"use client";

import { useEffect, useRef, useState, type ComponentPropsWithRef } from "react";
import { LocalizedImage, LSpan } from "@/i18n/Elements";
import { contentImageState, type ContentImageState } from "@/lib/content-image-state";
import BrandLoader from "./BrandLoader";
import styles from "./ContentImage.module.css";

type Props = ComponentPropsWithRef<typeof LocalizedImage> & { compactLoader?: boolean };

export default function ContentImage({ compactLoader = false, ...props }: Props) {
  const source = typeof props.src === "string" ? props.src : "default" in props.src ? props.src.default.src : props.src.src;
  if (!source.trim()) return <span className={styles.frame} data-content-image="empty"><LSpan>图片待补</LSpan></span>;
  // 只在真实素材替换时隔离请求生命周期；语言、主题和普通父层重渲染不重新加载。
  return <ImageRequest key={source} {...props} compactLoader={compactLoader}/>;
}

function ImageRequest({ compactLoader, ref: forwardedRef, ...props }: Props) {
  const image = useRef<HTMLImageElement | null>(null);
  const [state, setState] = useState<ContentImageState>("waiting");
  useEffect(() => {
    const node = image.current;
    if (!node) return;
    let live = true, visible = false, failed = false, version = 0;
    const read = () => {
      if (!live) return;
      const shown = visible && !document.hidden && !node.closest("[hidden],[inert]");
      setState(contentImageState(node.complete, node.naturalWidth, !!node.currentSrc, !!shown, failed));
    };
    const loaded = () => { failed = false; read(); };
    const error = () => { failed = true; read(); };
    node.addEventListener("load", loaded); node.addEventListener("error", error);
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0);
      read();
    }) : null;
    observer?.observe(node);
    if (!observer) { const r=node.getBoundingClientRect();visible=r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight; }
    // Next/Image仍负责srcset/sizes。候选变化只复核当前元素，不缓存旧currentSrc结果。
    const mutation = new MutationObserver(() => {
      failed = false; const request = ++version;
      queueMicrotask(() => { if (live && request === version) read(); });
    });
    mutation.observe(node, { attributes: true, attributeFilter: ["src", "srcset", "sizes"] });
    const resized = typeof ResizeObserver === "function" ? new ResizeObserver(read) : null;
    resized?.observe(node);
    document.addEventListener("visibilitychange", read);
    read();
    return () => { live = false; version++; document.removeEventListener("visibilitychange", read); observer?.disconnect(); mutation.disconnect(); resized?.disconnect(); node.removeEventListener("load", loaded); node.removeEventListener("error", error); };
  }, []);
  return <span className={`${styles.frame} ${props.fill ? styles.fill : ""}`} data-content-image={state}>
    <LocalizedImage {...props} ref={node => { image.current = node; if(typeof forwardedRef === "function")return forwardedRef(node);if(forwardedRef)forwardedRef.current = node; }}/>
    {state === "loading" && <span className={styles.feedback} aria-hidden="true"><BrandLoader size={compactLoader ? "compact" : "section"} announce={false}/></span>}
    {state === "failed" && <LSpan className={styles.feedback}>图片加载失败</LSpan>}
  </span>;
}
