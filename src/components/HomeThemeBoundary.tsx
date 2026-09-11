import type { ReactNode } from "react";

// A styling boundary only. ThemeProvider owns every active preference.
export default function HomeThemeBoundary({ children }: { children: ReactNode }) {
  return <div className="home-theme-boundary" data-home-theme="brand">{children}</div>;
}
