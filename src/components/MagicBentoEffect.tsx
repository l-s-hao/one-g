"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import styles from "./MagicBentoEffect.module.css";

// Motion adapted from React Bits MagicBento-TS-CSS (see installed MagicBento.tsx).
// This wrapper owns effects only: its children retain their layout, text and selection.
interface MagicBentoEffectProps {
  children: ReactNode;
  className?: string;
  textAutoHide?: boolean; // Intentionally does not clamp business labels.
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: false; // Selection owns click feedback; no ripple implementation.
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
}

export function MagicBentoEffect({ children, className, enableStars = true,
  enableSpotlight = true, enableBorderGlow = true, enableTilt = true,
  enableMagnetism = true, spotlightRadius = 420, particleCount = 12,
  glowColor = "var(--effect-rgb)",
}: MagicBentoEffectProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const region = root.current;
    if (!region) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cards = Array.from(region.querySelectorAll<HTMLElement>("[data-magic-card]"));
      const cleanups: (() => void)[] = [];
      region.style.setProperty("--magic-glow-rgb", glowColor);
      const spotlight = document.createElement("span");
      spotlight.className = styles.spotlight;
      spotlight.setAttribute("aria-hidden", "true");
      spotlight.style.setProperty("--spotlight-size", `${spotlightRadius * 2}px`);
      if (enableSpotlight) region.appendChild(spotlight);
      const available = (card: HTMLElement) => !card.querySelector("input:disabled");
      const resetGlow = () => {
        cards.forEach(card => card.style.setProperty("--glow-intensity", "0"));
        gsap.to(spotlight, { opacity: 0, duration: 0.15, overwrite: true });
      };
      const moveSpotlight = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = region.getBoundingClientRect();
        const proximity = spotlightRadius * 0.5;
        const fadeDistance = spotlightRadius * 0.75;
        let intensity = 0;
        cards.forEach(card => {
          const bounds = card.getBoundingClientRect();
          const distance = Math.max(0, Math.hypot(event.clientX - bounds.left - bounds.width / 2,
            event.clientY - bounds.top - bounds.height / 2) - Math.max(bounds.width, bounds.height) / 2);
          const glow = available(card) ? Math.max(0, Math.min(1, (fadeDistance - distance) / (fadeDistance - proximity))) : 0;
          intensity = Math.max(intensity, glow);
          card.style.setProperty("--glow-x", `${(event.clientX - bounds.left) / bounds.width * 100}%`);
          card.style.setProperty("--glow-y", `${(event.clientY - bounds.top) / bounds.height * 100}%`);
          card.style.setProperty("--glow-intensity", String(glow));
        });
        gsap.to(spotlight, { left: event.clientX - rect.left, top: event.clientY - rect.top,
          opacity: intensity * 0.8, duration: 0.1, overwrite: true, ease: "power2.out" });
      };
      region.addEventListener("pointermove", moveSpotlight);
      region.addEventListener("pointerleave", resetGlow);
      window.addEventListener("blur", resetGlow);
      // A scroll can move the card region away from a stationary pointer.
      window.addEventListener("scroll", resetGlow, true);

      cards.forEach(card => {
        const surface = card.querySelector<HTMLElement>("[data-magic-surface]");
        if (!surface) return;
        surface.classList.add(styles.surface);
        if (enableBorderGlow) surface.classList.add(styles.borderGlow);
        card.style.setProperty("--glow-radius", `${spotlightRadius}px`);
        // Mask thickness follows the existing border; never writes border-width.
        surface.style.setProperty("--magic-border-width", getComputedStyle(surface).borderTopWidth);
        const layer = document.createElement("span");
        layer.className = styles.particles;
        layer.setAttribute("aria-hidden", "true");
        surface.appendChild(layer);
        let hovered = false;
        const timers = new Set<ReturnType<typeof setTimeout>>();
        const particles = new Set<HTMLElement>();
        const clearParticles = (immediate = false) => {
          timers.forEach(clearTimeout);
          timers.clear();
          particles.forEach(particle => {
            gsap.killTweensOf(particle);
            if (immediate) particle.remove();
            else gsap.to(particle, { scale: 0, opacity: 0, duration: 0.3,
              ease: "back.in(1.7)", onComplete: () => { particle.remove(); particles.delete(particle); } });
          });
          if (immediate) particles.clear();
        };
        const leave = () => {
          hovered = false;
          clearParticles();
          gsap.to(surface, { rotateX: 0, rotateY: 0, x: 0, y: 0,
            duration: 0.3, overwrite: true, ease: "power2.out", clearProps: "transform" });
        };
        const enter = (event: PointerEvent) => {
          if (event.pointerType !== "mouse" || !available(card) || hovered) return;
          hovered = true;
          clearParticles(true);
          if (!enableStars) return;
          // Randomness and measurements occur only after a client hover.
          const { width, height } = card.getBoundingClientRect();
          for (let index = 0; index < particleCount; index++) {
            const timer = setTimeout(() => {
              timers.delete(timer);
              if (!hovered) return;
              const particle = document.createElement("span");
              particle.className = styles.particle;
              particle.style.left = `${Math.random() * width}px`;
              particle.style.top = `${Math.random() * height}px`;
              layer.appendChild(particle);
              particles.add(particle);
              gsap.fromTo(particle, { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
              gsap.to(particle, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100,
                rotation: Math.random() * 360, duration: 2 + Math.random() * 2,
                ease: "none", repeat: -1, yoyo: true });
              gsap.to(particle, { opacity: 0.3, duration: 1.5,
                ease: "power2.inOut", repeat: -1, yoyo: true, delay: 0.3 });
            }, index * 100);
            timers.add(timer);
          }
        };
        const move = (event: PointerEvent) => {
          if (event.pointerType !== "mouse" || !available(card)) return;
          // Measure the untransformed label to avoid magnetic feedback/jitter.
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          gsap.to(surface, { rotateX: enableTilt ? -y * 2 : 0, rotateY: enableTilt ? x * 2 : 0,
            x: enableMagnetism ? x * 3 : 0, y: enableMagnetism ? y * 3 : 0,
            transformPerspective: 1000, duration: 0.2, overwrite: true, ease: "power2.out" });
        };
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        card.addEventListener("pointermove", move);
        window.addEventListener("blur", leave);
        window.addEventListener("scroll", leave, true);
        cleanups.push(() => {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
          card.removeEventListener("pointermove", move);
          window.removeEventListener("blur", leave);
          window.removeEventListener("scroll", leave, true);
          clearParticles(true);
          gsap.killTweensOf(surface);
          gsap.set(surface, { clearProps: "transform" });
          layer.remove();
          surface.classList.remove(styles.surface, styles.borderGlow);
          surface.style.removeProperty("--magic-border-width");
          ["--glow-x", "--glow-y", "--glow-intensity", "--glow-radius"].forEach(key => card.style.removeProperty(key));
        });
      });
      return () => {
        cleanups.forEach(cleanup => cleanup());
        region.removeEventListener("pointermove", moveSpotlight);
        region.removeEventListener("pointerleave", resetGlow);
        window.removeEventListener("blur", resetGlow);
        window.removeEventListener("scroll", resetGlow, true);
        gsap.killTweensOf(spotlight);
        spotlight.remove();
        region.style.removeProperty("--magic-glow-rgb");
      };
    });
    return () => media.revert();
  }, [enableStars, enableSpotlight, enableBorderGlow, enableTilt, enableMagnetism, spotlightRadius, particleCount, glowColor]);

  return <div ref={root} className={`${className ?? ""} ${styles.region}`}>{children}</div>;
}
