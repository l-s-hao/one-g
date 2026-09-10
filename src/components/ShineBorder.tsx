import type { CSSProperties } from "react";

export default function ShineBorder({
  shineColor = ["var(--effect-color)", "var(--effect-dim)", "var(--effect-color)"],
  duration = 10,
  borderWidth = 1,
}: {
  shineColor?: string[];
  duration?: number;
  borderWidth?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="shine-border"
      style={{
        "--shine-colors": shineColor.join(", "),
        "--shine-duration": `${duration}s`,
        padding: borderWidth,
      } as CSSProperties}
    />
  );
}
