"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

// Local coordination only: one stable, namespaced ID across the two home grids.
const PreviewContext = createContext<{
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
} | null>(null);

export default function HomePreviewProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const value = useMemo(() => ({ selectedId, setSelectedId }), [selectedId]);
  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function useHomePreview() {
  const context = useContext(PreviewContext);
  if (!context) throw new Error("Home previews require HomePreviewProvider");
  return context;
}
