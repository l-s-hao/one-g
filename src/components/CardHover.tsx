import type { ReactNode } from "react";

/** A stable hit area; the existing child keeps its complete card appearance. */
export default function CardHover({ children, as = "div" }: { children: ReactNode; as?: "div" | "li" }) {
  return as === "li" ? <li data-card-hover-host>{children}</li> : <div data-card-hover-host>{children}</div>;
}
