"use client";

import { useEffect, useRef } from "react";
import { registerEdge } from "./scheduler";

/** Decoration only. The existing button/Next Link owns every prop, ref and event. */
export default function SpecularEdge() {
  const edge = useRef<HTMLSpanElement>(null);
  useEffect(() => edge.current ? registerEdge(edge.current) : undefined, []);
  return <span ref={edge} className="specular-edge" aria-hidden="true" />;
}
