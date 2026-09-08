import type { CSSProperties } from "react";

export default function ShineBorder({
  shineColor = ["#ffffff", "#666666", "#ffffff"],
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
