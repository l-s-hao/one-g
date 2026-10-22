"use client";

import type { ComponentPropsWithRef, PointerEvent } from "react";
import { LInput } from "@/i18n/Elements";
import styles from "./VerificationLogin.module.css";

// Local adaptation of Aceternity Input: https://ui.aceternity.com/registry/input.json
// Keep the pointer accent scoped to login; keyboard focus is independent of it.
export default function LoginInput(props: ComponentPropsWithRef<typeof LInput>) {
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    event.currentTarget.dataset.pointer = "true";
  };
  return <div className={styles.inputWrap} onPointerMove={move} onPointerLeave={event => { delete event.currentTarget.dataset.pointer; }} onPointerCancel={event => { delete event.currentTarget.dataset.pointer; }}>
    <LInput {...props} className={`${styles.input} ${props.className ?? ""}`} />
  </div>;
}
