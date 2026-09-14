import type { ReactNode } from "react";

// A styling boundary only. ThemeProvider owns every active preference.
export default function BrandThemeBoundary({ children }: { children: ReactNode }) {
  return <div data-brand-theme="brand" data-home-theme="brand">{children}</div>;
}
