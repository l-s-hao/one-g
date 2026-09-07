"use client";

import { useEffect, useState } from "react";
import DriftWall, { type DriftWallItem } from "@/components/DriftWall";

type DriftWallSize = { columns: number; tileWidth: number; tileHeight: number };

function getSize(width: number): DriftWallSize {
  if (width >= 1900) return { columns: 6, tileWidth: 400, tileHeight: 267 };
  if (width >= 1200) return { columns: 6, tileWidth: 360, tileHeight: 240 };
  if (width >= 768) return { columns: 4, tileWidth: 260, tileHeight: 173 };
  return { columns: 3, tileWidth: 180, tileHeight: 120 };
}

export default function ResponsiveDriftWall({ items }: { items: DriftWallItem[] }) {
  const [size, setSize] = useState<DriftWallSize>({ columns: 6, tileWidth: 360, tileHeight: 240 });

  useEffect(() => {
    const update = () => setSize(getSize(window.innerWidth));
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <DriftWall
      items={items}
      columns={size.columns}
      tileWidth={size.tileWidth}
      tileHeight={size.tileHeight}
      gap={20}
      tilt={12}
      turn={-10}
      perspective={1500}
      depth={90}
      speed={42}
      direction="up"
      variance={0.35}
      parallax={0.45}
      lift={48}
      fade={0.72}
      dim={0.20}
      overlayColor="#030305"
      radius={12}
      roll={0}
      pauseOnHover={false}
      grayscale={false}
    />
  );
}
